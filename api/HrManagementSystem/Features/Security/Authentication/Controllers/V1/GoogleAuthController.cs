using System.Net.Http.Headers;
using System.Text.Json.Serialization;

namespace HrManagementSystem.Features.Security.Authentication.Controllers.V1;

[Route("api/account")]
[ApiController]
[AllowAnonymous]
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

        var client = _httpClientFactory.CreateClient();
        var tokenInfoResponse = await client.GetAsync(
            $"https://oauth2.googleapis.com/tokeninfo?access_token={Uri.EscapeDataString(request.Credential)}",
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

        using var userInfoRequest = new HttpRequestMessage(
            HttpMethod.Get,
            "https://www.googleapis.com/oauth2/v3/userinfo");
        userInfoRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", request.Credential);

        var userInfoResponse = await client.SendAsync(userInfoRequest, cancellationToken);
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
