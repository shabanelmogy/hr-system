using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Services;

public static class RefreshTokenSessionPolicy
{
    public static readonly TimeSpan RefreshTokenLifetime = AuthenticationSessionPolicy.RefreshTokenLifetime;
    public static readonly TimeSpan InactiveTokenRetention = AuthenticationSessionPolicy.InactiveTokenRetention;
    public static readonly TimeSpan RotatedTokenReuseGracePeriod = AuthenticationSessionPolicy.RotatedTokenReuseGracePeriod;

    public const int MaxInactiveTokenHistory = AuthenticationSessionPolicy.MaxInactiveTokenHistory;

    public static bool IsWithinRotationGracePeriod(PlatformRefreshToken token, DateTime utcNow) =>
        token.WasRotatedWithin(RotatedTokenReuseGracePeriod, utcNow);

    public static void RevokeAll(
        List<PlatformRefreshToken> tokens,
        string reason,
        DateTime utcNow)
    {
        foreach (var token in tokens.Where(token => token.IsActiveAt(utcNow)))
            token.Revoke(reason, utcNow);
    }

    public static void RevokeSession(
        List<PlatformRefreshToken> tokens,
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

    public static void Prune(List<PlatformRefreshToken> tokens, DateTime utcNow)
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
