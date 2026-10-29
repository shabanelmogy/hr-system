using System.Globalization;
using System.Text;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.Authentication.Browser;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;

public sealed class BrowserAuthenticationCookies(IHttpContextAccessor accessor, IOptions<BrowserAuthenticationOptions> options)
    : IBrowserAuthenticationCookies, IAuthenticationSessionIssuanceGuard
{
    private static readonly ChunkingCookieManager Chunks = new()
    {
        ChunkSize = BrowserAuthenticationDefaults.ChunkSize,
        ThrowForPartialCookies = true
    };

    private HttpContext Context => accessor.HttpContext ?? throw new InvalidOperationException("An HTTP request is required.");

    public AuthenticationRefreshRequest Read()
    {
        var context = Context;
        var raw = context.Request.Headers.Cookie.ToString().Split(';', StringSplitOptions.RemoveEmptyEntries)
            .Select(part => part.Trim().Split('=', 2)).Where(part => part.Length == 2)
            .Where(part => IsOwned(part[0])).ToArray();
        if (raw.Sum(part => Encoding.UTF8.GetByteCount(part[0]) + Encoding.UTF8.GetByteCount(part[1]) + 3)
                > BrowserAuthenticationDefaults.MaximumCookieHeaderBytes ||
            raw.GroupBy(part => part[0], StringComparer.Ordinal).Any(group => group.Count() != 1))
            throw new FormatException("Browser session Cookies exceed their bounds or are duplicated.");

        var accessParts = raw.Where(part => part[0].StartsWith(BrowserAuthenticationDefaults.AccessCookie, StringComparison.Ordinal)).ToArray();
        var marker = context.Request.Cookies[BrowserAuthenticationDefaults.AccessCookie];
        if (marker?.StartsWith("chunks-", StringComparison.Ordinal) == true)
        {
            if (!int.TryParse(marker.AsSpan(7), NumberStyles.None, CultureInfo.InvariantCulture, out var count) ||
                count is < 1 or > BrowserAuthenticationDefaults.MaximumChunks ||
                marker != $"chunks-{count}" || accessParts.Length != count + 1)
                throw new FormatException("The browser session chunk count is invalid.");
            for (var index = 1; index <= count; index++)
                if (string.IsNullOrEmpty(context.Request.Cookies[$"{BrowserAuthenticationDefaults.AccessCookie}C{index}"]))
                    throw new FormatException("A browser session chunk is missing.");
        }
        else if (accessParts.Length != (marker is null ? 0 : 1))
            throw new FormatException("Unexpected browser session chunks.");

        var access = Chunks.GetRequestCookie(context, BrowserAuthenticationDefaults.AccessCookie);
        var refresh = context.Request.Cookies[BrowserAuthenticationDefaults.RefreshCookie] ?? string.Empty;
        if (access?.Length > BrowserAuthenticationDefaults.MaximumAccessBytes || refresh.Length > 512 ||
            (access is not null && !access.All(IsTokenCharacter)) || !refresh.All(IsTokenCharacter))
            throw new FormatException("Browser session material is invalid.");
        return new AuthenticationRefreshRequest(access, refresh);
    }

    public AuthenticationError? Validate(string accessToken, DateTime refreshExpiresOn)
    {
        if (accessor.HttpContext?.GetEndpoint()?.Metadata.GetMetadata<BrowserAuthenticationEndpointAttribute>() is null)
            return null;
        return accessToken.Length > BrowserAuthenticationDefaults.MaximumAccessBytes ||
            !accessToken.All(IsTokenCharacter) || refreshExpiresOn <= DateTime.UtcNow
            ? new AuthenticationError("Authentication.BrowserSessionTooLarge", "The browser session cannot be issued within its transport limits.", AuthenticationErrorType.Validation)
            : null;
    }

    public void Write(AuthenticationSessionResponse session)
    {
        Clear();
        var options = Options(session.RefreshTokenExpiration);
        Chunks.AppendResponseCookie(Context, BrowserAuthenticationDefaults.AccessCookie, session.Token, options);
        Context.Response.Cookies.Append(BrowserAuthenticationDefaults.RefreshCookie, session.RefreshToken, options);
    }

    public void Clear()
    {
        var names = Context.Request.Cookies.Keys.Where(IsOwned).Take(16)
            .Concat(Enumerable.Range(1, BrowserAuthenticationDefaults.MaximumChunks).Select(index => $"{BrowserAuthenticationDefaults.AccessCookie}C{index}"))
            .Append(BrowserAuthenticationDefaults.AccessCookie).Append(BrowserAuthenticationDefaults.RefreshCookie)
            .Append(BrowserAuthenticationDefaults.AntiforgeryCookie).Distinct(StringComparer.Ordinal);
        foreach (var name in names) Context.Response.Cookies.Delete(name, Options());
    }

    public void WriteAntiforgery(string cookieToken) =>
        Context.Response.Cookies.Append(BrowserAuthenticationDefaults.AntiforgeryCookie, cookieToken, Options());

    private static bool IsOwned(string name) => name.StartsWith(BrowserAuthenticationDefaults.AccessCookie, StringComparison.Ordinal) ||
        name == BrowserAuthenticationDefaults.RefreshCookie || name == BrowserAuthenticationDefaults.AntiforgeryCookie;
    private static bool IsTokenCharacter(char character) => char.IsAsciiLetterOrDigit(character) || character is '-' or '_' or '.';
    private CookieOptions Options(DateTime? expires = null) => new()
    {
        Secure = true, HttpOnly = true,
        SameSite = options.Value.UseCrossSiteCookies ? SameSiteMode.None : SameSiteMode.Lax, Path = "/",
        IsEssential = true, Expires = expires is { } date ? new DateTimeOffset(DateTime.SpecifyKind(date, DateTimeKind.Utc)) : null
    };
}
