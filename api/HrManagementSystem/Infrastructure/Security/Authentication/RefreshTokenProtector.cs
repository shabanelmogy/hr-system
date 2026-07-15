using HrManagementSystem.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

public static class RefreshTokenProtector
{
    public static IssuedRefreshToken Issue(
        string sessionId,
        string jwtId,
        DateTime expiresOn,
        string? ipAddress,
        string? userAgent)
    {
        var rawToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(64));
        var token = new RefreshToken
        {
            TokenHash = Hash(rawToken),
            SessionId = sessionId,
            JwtId = jwtId,
            ExpiresOn = expiresOn,
            CreatedByIp = Truncate(ipAddress, 45),
            CreatedByUserAgent = Truncate(userAgent, 256)
        };

        return new IssuedRefreshToken(rawToken, token);
    }

    public static IssuedRefreshToken Rotate(
        RefreshToken currentToken,
        string jwtId,
        string? ipAddress,
        string? userAgent)
    {
        if (!currentToken.IsActive)
            throw new InvalidOperationException("Only an active refresh token can be rotated.");

        var replacement = Issue(
            currentToken.SessionId,
            jwtId,
            currentToken.ExpiresOn,
            ipAddress,
            userAgent);

        currentToken.Revoke("Rotated", replacement.Token.TokenHash);
        return replacement;
    }

    public static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private static string? Truncate(string? value, int maxLength) =>
        string.IsNullOrWhiteSpace(value) ? null : value[..Math.Min(value.Length, maxLength)];
}

public sealed record IssuedRefreshToken(string RawToken, RefreshToken Token);
