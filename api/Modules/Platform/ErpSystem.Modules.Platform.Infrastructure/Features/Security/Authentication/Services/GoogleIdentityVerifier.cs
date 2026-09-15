using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Services;

public sealed class GoogleIdentityVerifier(
    HttpClient httpClient,
    IConfiguration configuration) : IGoogleIdentityVerifier
{
    private readonly string _clientId = configuration["ExternalLogin:Google:ClientId"] ?? string.Empty;

    public async Task<GoogleIdentity?> VerifyAsync(
        string credential,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(credential) || string.IsNullOrWhiteSpace(_clientId))
            return null;

        using var tokenInfoResponse = await SendWithTransientRetryAsync(
            () => new HttpRequestMessage(
                HttpMethod.Get,
                $"https://oauth2.googleapis.com/tokeninfo?access_token={Uri.EscapeDataString(credential)}"),
            cancellationToken).ConfigureAwait(false);

        if (!tokenInfoResponse.IsSuccessStatusCode)
            return null;

        var tokenInfo = await tokenInfoResponse.Content.ReadFromJsonAsync<GoogleTokenInfo>(
            cancellationToken: cancellationToken).ConfigureAwait(false);
        if (tokenInfo is null ||
            !string.Equals(tokenInfo.Audience, _clientId, StringComparison.Ordinal) ||
            tokenInfo.ExpiresIn <= 0)
        {
            return null;
        }

        using var userInfoResponse = await SendWithTransientRetryAsync(
            () =>
            {
                var request = new HttpRequestMessage(
                    HttpMethod.Get,
                    "https://www.googleapis.com/oauth2/v3/userinfo");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", credential);
                return request;
            },
            cancellationToken).ConfigureAwait(false);

        if (!userInfoResponse.IsSuccessStatusCode)
            return null;

        var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<GoogleUserInfo>(
            cancellationToken: cancellationToken).ConfigureAwait(false);
        if (userInfo is null || !userInfo.EmailVerified || string.IsNullOrWhiteSpace(userInfo.Email))
            return null;

        return new GoogleIdentity(
            userInfo.Subject,
            userInfo.Email,
            userInfo.GivenName ?? string.Empty,
            userInfo.FamilyName ?? string.Empty);
    }

    private async Task<HttpResponseMessage> SendWithTransientRetryAsync(
        Func<HttpRequestMessage> requestFactory,
        CancellationToken cancellationToken)
    {
        const int maxAttempts = 2;

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                using var request = requestFactory();
                var response = await httpClient.SendAsync(
                    request,
                    HttpCompletionOption.ResponseHeadersRead,
                    cancellationToken).ConfigureAwait(false);

                if (attempt == maxAttempts || !IsTransient(response.StatusCode))
                    return response;

                response.Dispose();
            }
            catch (HttpRequestException) when (attempt < maxAttempts)
            {
            }

            await Task.Delay(TimeSpan.FromMilliseconds(200), cancellationToken).ConfigureAwait(false);
        }

        throw new InvalidOperationException("The outbound request did not produce a response.");
    }

    private static bool IsTransient(HttpStatusCode statusCode) =>
        statusCode == HttpStatusCode.RequestTimeout ||
        (int)statusCode == 429 ||
        (int)statusCode >= 500;

    private sealed class GoogleTokenInfo
    {
        [JsonPropertyName("aud")]
        public string Audience { get; init; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; init; }
    }

    private sealed class GoogleUserInfo
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
}
