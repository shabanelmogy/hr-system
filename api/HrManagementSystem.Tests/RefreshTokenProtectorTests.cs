using HrManagementSystem.Infrastructure.Security.Authentication;

namespace HrManagementSystem.Tests;

public sealed class RefreshTokenProtectorTests
{
    private static readonly DateTime Now = new(2026, 8, 11, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Issue_StoresOnlyHashAndCreatesActiveSessionToken()
    {
        var issued = RefreshTokenProtector.Issue(
            "session-id",
            "jwt-id",
            7,
            Now,
            Now.AddDays(14),
            "127.0.0.1",
            "test-agent");

        Assert.NotEqual(issued.RawToken, issued.Token.TokenHash);
        Assert.Equal(64, issued.Token.TokenHash.Length);
        Assert.Equal(RefreshTokenProtector.Hash(issued.RawToken), issued.Token.TokenHash);
        Assert.True(issued.Token.IsActiveAt(Now));
        Assert.Equal(Now, issued.Token.CreatedOn);
        Assert.Equal(7, issued.Token.CompanyId);
        Assert.DoesNotContain("=", issued.RawToken);
    }

    [Fact]
    public void Rotate_RevokesCurrentTokenAndPreservesSessionAndAbsoluteExpiry()
    {
        var expiresOn = Now.AddDays(14);
        var current = RefreshTokenProtector.Issue(
            "session-id",
            "old-jwt-id",
            7,
            Now,
            expiresOn,
            null,
            null);

        var replacement = RefreshTokenProtector.Rotate(
            current.Token,
            "new-jwt-id",
            Now.AddMinutes(1),
            "127.0.0.1",
            "test-agent");

        Assert.False(current.Token.IsActiveAt(Now.AddMinutes(1)));
        Assert.Equal("Rotated", current.Token.RevocationReason);
        Assert.Equal(current.Token.SessionId, replacement.Token.SessionId);
        Assert.Equal(current.Token.CompanyId, replacement.Token.CompanyId);
        Assert.Equal(expiresOn, replacement.Token.ExpiresOn);
        Assert.NotEqual(current.RawToken, replacement.RawToken);
        Assert.True(replacement.Token.IsActiveAt(Now.AddMinutes(1)));
    }

    [Fact]
    public void RotatedToken_DistinguishesConcurrentRefreshGraceFromLaterReuse()
    {
        var current = RefreshTokenProtector.Issue(
            "session-id",
            "old-jwt-id",
            7,
            Now,
            Now.AddDays(14),
            null,
            null);

        _ = RefreshTokenProtector.Rotate(
            current.Token,
            "new-jwt-id",
            Now.AddMinutes(1),
            null,
            null);

        var rotatedOn = Assert.IsType<DateTime>(current.Token.RevokedOn);
        Assert.True(current.Token.WasRotated);
        Assert.True(current.Token.WasRotatedWithin(
            TimeSpan.FromSeconds(30),
            rotatedOn.AddSeconds(10)));
        Assert.False(current.Token.WasRotatedWithin(
            TimeSpan.FromSeconds(30),
            rotatedOn.AddSeconds(31)));
    }
}
