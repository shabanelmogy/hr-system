using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public static class RefreshTokenSessionPolicy
{
    public static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(14);
    public static readonly TimeSpan InactiveTokenRetention = TimeSpan.FromHours(1);
    public static readonly TimeSpan RotatedTokenReuseGracePeriod = TimeSpan.FromSeconds(30);

    public const int MaxInactiveTokenHistory = 50;

    public static bool IsWithinRotationGracePeriod(RefreshToken token, DateTime utcNow) =>
        token.WasRotatedWithin(RotatedTokenReuseGracePeriod, utcNow);

    public static void RevokeAll(
        List<RefreshToken> tokens,
        string reason,
        DateTime utcNow)
    {
        foreach (var token in tokens.Where(token => token.IsActiveAt(utcNow)))
            token.Revoke(reason, utcNow);
    }

    public static void RevokeSession(
        List<RefreshToken> tokens,
        string sessionId,
        string reason,
        DateTime utcNow)
    {
        foreach (var token in tokens.Where(token =>
                     token.IsActiveAt(utcNow) &&
                     string.Equals(token.SessionId, sessionId, StringComparison.Ordinal)))
        {
            token.Revoke(reason, utcNow);
        }
    }

    public static void Prune(List<RefreshToken> tokens, DateTime utcNow)
    {
        var removeBefore = utcNow.Subtract(InactiveTokenRetention);
        tokens.RemoveAll(token =>
            !token.IsActiveAt(utcNow) && (token.RevokedOn ?? token.ExpiresOn) < removeBefore);

        var excessTokens = tokens
            .Where(token => !token.IsActiveAt(utcNow))
            .OrderByDescending(token => token.RevokedOn ?? token.ExpiresOn)
            .Skip(MaxInactiveTokenHistory)
            .ToHashSet();

        tokens.RemoveAll(excessTokens.Contains);
    }
}
