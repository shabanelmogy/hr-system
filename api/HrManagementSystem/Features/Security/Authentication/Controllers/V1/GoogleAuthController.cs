using System.Net.Http.Headers;
using System.Text.Json.Serialization;

using HrManagementSystem.Features.Security.Authentication.Services;

namespace HrManagementSystem.Features.Security.Authentication.Controllers.V1;

[Route("api/account")]
[ApiController]
[AllowAnonymous]
[EnableRateLimiting("authentication")]
public sealed class GoogleAuthController(
    IAuthService authService,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly string _googleClientId =
        configuration["ExternalLogin:Google:ClientId"] ?? string.Empty;

    [HttpPost("google-auth")]
    public async Task<IActionResult> GoogleAuth(
        [FromBody] GoogleAuthRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Credential) || string.IsNullOrWhiteSpace(_googleClientId))
            return Unauthorized();

        var client = _httpClientFactory.CreateClient("Google");
        using var tokenInfoResponse = await SendWithTransientRetryAsync(
            client,
            () => new HttpRequestMessage(
                HttpMethod.Get,
                $"https://oauth2.googleapis.com/tokeninfo?access_token={Uri.EscapeDataString(request.Credential)}"),
            cancellationToken);

        if (!tokenInfoResponse.IsSuccessStatusCode)
            return Unauthorized();

        var tokenInfo = await tokenInfoResponse.Content.ReadFromJsonAsync<GoogleTokenInfo>(
            cancellationToken: cancellationToken);

        if (tokenInfo is null ||
            !string.Equals(tokenInfo.Audience, _googleClientId, StringComparison.Ordinal) ||
            tokenInfo.ExpiresIn <= 0)
        {
            return Unauthorized();
        }

        using var userInfoResponse = await SendWithTransientRetryAsync(
            client,
            () =>
            {
                var userInfoRequest = new HttpRequestMessage(HttpMethod.Get, "oauth2/v3/userinfo");
                userInfoRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", request.Credential);
                return userInfoRequest;
            },
            cancellationToken);
        if (!userInfoResponse.IsSuccessStatusCode)
            return Unauthorized();

        var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<GoogleUserInfo>(
            cancellationToken: cancellationToken);

        if (userInfo is null || !userInfo.EmailVerified || string.IsNullOrWhiteSpace(userInfo.Email))
            return Unauthorized();

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userInfo.Subject),
            new(ClaimTypes.Email, userInfo.Email),
            new(ClaimTypes.GivenName, userInfo.GivenName ?? string.Empty),
            new(ClaimTypes.Surname, userInfo.FamilyName ?? string.Empty)
        };

        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Google"));
        var result = await _authService.LoginWithGoogleAsync(principal, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    private static async Task<HttpResponseMessage> SendWithTransientRetryAsync(
        HttpClient client,
        Func<HttpRequestMessage> requestFactory,
        CancellationToken cancellationToken)
    {
        const int maxAttempts = 2;

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                using var request = requestFactory();
                var response = await client.SendAsync(
                    request,
                    HttpCompletionOption.ResponseHeadersRead,
                    cancellationToken);

                if (attempt == maxAttempts || !IsTransient(response.StatusCode))
                    return response;

                response.Dispose();
            }
            catch (HttpRequestException) when (attempt < maxAttempts)
            {
            }

            await Task.Delay(TimeSpan.FromMilliseconds(200), cancellationToken);
        }

        throw new InvalidOperationException("The outbound request did not produce a response.");
    }

    private static bool IsTransient(System.Net.HttpStatusCode statusCode) =>
        statusCode == System.Net.HttpStatusCode.RequestTimeout ||
        (int)statusCode == StatusCodes.Status429TooManyRequests ||
        (int)statusCode >= StatusCodes.Status500InternalServerError;
}

public sealed record GoogleAuthRequest(string Credential);

public sealed class GoogleTokenInfo
{
    [JsonPropertyName("aud")]
    public string Audience { get; init; } = string.Empty;

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; init; }
}

public sealed class GoogleUserInfo
{
    [JsonPropertyName("sub")]
    public string Subject { get; init; } = string.Empty;

    [JsonPropertyName("given_name")]
    public string? GivenName { get; init; }

    [JsonPropertyName("family_name")]
    public string? FamilyName { get; init; }

    [JsonPropertyName("email")]
    public string Email { get; init; } = string.Empty;

    [JsonPropertyName("email_verified")]
    public bool EmailVerified { get; init; }
}
