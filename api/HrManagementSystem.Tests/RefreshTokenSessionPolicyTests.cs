using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

namespace HrManagementSystem.Tests;

public sealed class RefreshTokenSessionPolicyTests
{
    private static readonly DateTime Now = new(2026, 8, 15, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void RevokeAll_RevokesOnlyActiveTokens()
    {
        var active = CreateToken("active", Now.AddMinutes(-5), Now.AddDays(1));
        var alreadyRevoked = CreateToken("revoked", Now.AddMinutes(-10), Now.AddDays(1));
        alreadyRevoked.Revoke("Existing reason", Now.AddMinutes(-1));
        var expired = CreateToken("expired", Now.AddHours(-2), Now.AddMinutes(-1));
        var tokens = new List<RefreshToken> { active, alreadyRevoked, expired };

        RefreshTokenSessionPolicy.RevokeAll(tokens, "Password was reset", Now);

        Assert.Equal("Password was reset", active.RevocationReason);
        Assert.Equal("Existing reason", alreadyRevoked.RevocationReason);
        Assert.Null(expired.RevocationReason);
    }

    [Fact]
    public void RevokeSession_RevokesOnlyTheReplacedActiveSession()
    {
        var replaced = CreateToken("replaced", Now.AddMinutes(-5), Now.AddDays(1));
        var retained = CreateToken("retained", Now.AddMinutes(-5), Now.AddDays(1));
        var replacedSessionId = replaced.SessionId;
        var tokens = new List<RefreshToken> { replaced, retained };

        RefreshTokenSessionPolicy.RevokeSession(
            tokens,
            replacedSessionId,
            "Company switched",
            Now);

        Assert.Equal("Company switched", replaced.RevocationReason);
        Assert.Null(retained.RevocationReason);
    }

    [Fact]
    public void Prune_RemovesStaleInactiveTokensAndKeepsActiveTokens()
    {
        var stale = CreateToken("stale", Now.AddHours(-3), Now.AddHours(-2));
        var recent = CreateToken("recent", Now.AddMinutes(-30), Now.AddMinutes(-5));
        var active = CreateToken("active", Now.AddMinutes(-5), Now.AddDays(1));
        var tokens = new List<RefreshToken> { stale, recent, active };

        RefreshTokenSessionPolicy.Prune(tokens, Now);

        Assert.DoesNotContain(stale, tokens);
        Assert.Contains(recent, tokens);
        Assert.Contains(active, tokens);
    }

    [Fact]
    public void Prune_CapsRecentInactiveHistory()
    {
        var tokens = Enumerable.Range(0, RefreshTokenSessionPolicy.MaxInactiveTokenHistory + 5)
            .Select(index => CreateToken(
                $"token-{index}",
                Now.AddMinutes(-50 + index),
                Now.AddMinutes(-49 + index)))
            .ToList();

        RefreshTokenSessionPolicy.Prune(tokens, Now.AddMinutes(10));

        Assert.Equal(RefreshTokenSessionPolicy.MaxInactiveTokenHistory, tokens.Count);
    }

    private static RefreshToken CreateToken(
        string tokenHash,
        DateTime createdOn,
        DateTime expiresOn) =>
        RefreshToken.Create(
            tokenHash,
            $"session-{tokenHash}",
            $"jwt-{tokenHash}",
            1,
            createdOn,
            expiresOn,
            null,
            null);
}
