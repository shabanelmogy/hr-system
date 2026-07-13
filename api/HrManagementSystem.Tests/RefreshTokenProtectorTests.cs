using HrManagementSystem.Infrastructure.Security.Authentication;

namespace HrManagementSystem.Tests;

public sealed class RefreshTokenProtectorTests
{
    [Fact]
    public void Issue_StoresOnlyHashAndCreatesActiveSessionToken()
    {
        var issued = RefreshTokenProtector.Issue(
            "session-id",
            "jwt-id",
            DateTime.UtcNow.AddDays(14),
            "127.0.0.1",
            "test-agent");

        Assert.NotEqual(issued.RawToken, issued.Token.TokenHash);
        Assert.Equal(64, issued.Token.TokenHash.Length);
        Assert.Equal(RefreshTokenProtector.Hash(issued.RawToken), issued.Token.TokenHash);
        Assert.True(issued.Token.IsActive);
        Assert.DoesNotContain("=", issued.RawToken);
    }

    [Fact]
    public void Rotate_RevokesCurrentTokenAndPreservesSessionAndAbsoluteExpiry()
    {
        var expiresOn = DateTime.UtcNow.AddDays(14);
        var current = RefreshTokenProtector.Issue(
            "session-id",
            "old-jwt-id",
            expiresOn,
            null,
            null);

        var replacement = RefreshTokenProtector.Rotate(
            current.Token,
            "new-jwt-id",
            "127.0.0.1",
            "test-agent");

        Assert.False(current.Token.IsActive);
        Assert.Equal("Rotated", current.Token.RevocationReason);
        Assert.Equal(replacement.Token.TokenHash, current.Token.ReplacedByTokenHash);
        Assert.Equal(current.Token.SessionId, replacement.Token.SessionId);
        Assert.Equal(expiresOn, replacement.Token.ExpiresOn);
        Assert.NotEqual(current.RawToken, replacement.RawToken);
        Assert.True(replacement.Token.IsActive);
    }
}
