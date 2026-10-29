using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Presentation.Authentication;

/// <summary>Expired signed access material identifies antiforgery only, never an authorized actor.</summary>
public sealed class BrowserAntiforgery(IAntiforgery antiforgery, IBrowserAuthenticationCookies cookies,
    IAuthenticationTokenValidationParametersFactory validation, IOptions<AntiforgeryOptions> options)
{
    public string CreateToken(HttpContext context)
    {
        var original = context.User;
        var originalCookies = AliasCookie(context);
        try
        {
            context.User = CookieIdentity(context);
            // GetTokens deliberately does not persist the framework Cookie. Keep
            // Hangfire's global Cookie/header names unchanged and store our own.
            var pair = antiforgery.GetTokens(context);
            if (pair.CookieToken is not null) cookies.WriteAntiforgery(pair.CookieToken);
            return pair.RequestToken!;
        }
        finally { context.User = original; context.Request.Headers.Cookie = originalCookies; }
    }

    public async Task ValidateAsync(HttpContext context)
    {
        var original = context.User;
        var originalCookies = AliasCookie(context);
        var headerName = options.Value.HeaderName!;
        var originalHeader = context.Request.Headers[headerName];
        try
        {
            context.User = CookieIdentity(context);
            var requestToken = context.Request.Headers[BrowserAuthenticationDefaults.AntiforgeryHeader];
            if (requestToken.Count != 1 || string.IsNullOrEmpty(requestToken[0]))
                throw new AntiforgeryValidationException("A browser request token is required.");
            context.Request.Headers[headerName] = requestToken;
            await antiforgery.ValidateRequestAsync(context);
        }
        finally
        {
            context.User = original;
            context.Request.Headers.Cookie = originalCookies;
            if (originalHeader.Count == 0) context.Request.Headers.Remove(headerName);
            else context.Request.Headers[headerName] = originalHeader;
        }
    }

    private Microsoft.Extensions.Primitives.StringValues AliasCookie(HttpContext context)
    {
        var original = context.Request.Headers.Cookie;
        var name = options.Value.Cookie.Name!;
        var token = context.Request.Cookies[BrowserAuthenticationDefaults.AntiforgeryCookie];
        var retained = original.ToString().Split(';', StringSplitOptions.RemoveEmptyEntries)
            .Where(part => !string.Equals(part.Trim().Split('=', 2)[0], name, StringComparison.Ordinal));
        context.Request.Headers.Cookie = string.Join("; ", retained.Append($"{name}={token ?? string.Empty}"));
        return original;
    }

    private ClaimsPrincipal CookieIdentity(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true) return context.User;
        try
        {
            var token = cookies.Read().Token;
            if (!string.IsNullOrEmpty(token))
                return new JwtSecurityTokenHandler().ValidateToken(token, validation.Create(validation.Audience, validateLifetime: false), out _);
        }
        catch (FormatException) { }
        catch (Microsoft.IdentityModel.Tokens.SecurityTokenException) { }
        catch (ArgumentException) { }
        return new ClaimsPrincipal(new ClaimsIdentity());
    }
}
