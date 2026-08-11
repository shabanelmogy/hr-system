using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

public static class RefreshTokenProtector
{
    public static IssuedRefreshToken Issue(
        string sessionId,
        string jwtId,
        int companyId,
        DateTime createdOn,
        DateTime expiresOn,
        string? ipAddress,
        string? userAgent)
    {
        var rawToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(64));
        var token = RefreshToken.Create(
            Hash(rawToken),
            sessionId,
            jwtId,
            companyId,
            createdOn,
            expiresOn,
            Truncate(ipAddress, 45),
            Truncate(userAgent, 256));

        return new IssuedRefreshToken(rawToken, token);
    }

    public static IssuedRefreshToken Rotate(
        RefreshToken currentToken,
        string jwtId,
        DateTime utcNow,
        string? ipAddress,
        string? userAgent)
    {
        if (!currentToken.IsActiveAt(utcNow))
            throw new InvalidOperationException("Only an active refresh token can be rotated.");

        var replacement = Issue(
            currentToken.SessionId,
            jwtId,
            currentToken.CompanyId,
            utcNow,
            currentToken.ExpiresOn,
            ipAddress,
            userAgent);

        currentToken.Revoke(RefreshToken.RotationReason, utcNow);
        return replacement;
    }

    public static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private static string? Truncate(string? value, int maxLength) =>
        string.IsNullOrWhiteSpace(value) ? null : value[..Math.Min(value.Length, maxLength)];
}

public sealed record IssuedRefreshToken(string RawToken, RefreshToken Token);
