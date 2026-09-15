using ErpSystem.Modules.Platform.Infrastructure.Identity;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformRefreshTokenTests
{
    private static readonly DateTime Now = new(2026, 8, 11, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_StoresOnlyHashMaterialAndCreatesActiveSessionToken()
    {
        var tokenHash = new string('a', 64);
        var token = PlatformRefreshToken.Create(
            tokenHash,
            "session-id",
            "jwt-id",
            7,
            Now,
            Now.AddDays(14),
            "127.0.0.1",
            "test-agent");

        Assert.Equal(tokenHash, token.TokenHash);
        Assert.Equal(64, token.TokenHash.Length);
        Assert.True(token.IsActiveAt(Now));
        Assert.Equal(Now, token.CreatedOn);
        Assert.Equal(7, token.CompanyId);
        Assert.DoesNotContain(
            typeof(PlatformRefreshToken).GetProperties(),
            property => property.Name.Contains("RawToken", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Rotation_RevokesCurrentTokenAndPreservesSessionScopeAndAbsoluteExpiry()
    {
        var expiresOn = Now.AddDays(14);
        var current = PlatformRefreshToken.Create(
            new string('a', 64),
            "session-id",
            "old-jwt-id",
            7,
            Now,
            expiresOn,
            null,
            null);

        current.Revoke(PlatformRefreshToken.RotationReason, Now.AddMinutes(1));
        var replacement = PlatformRefreshToken.Create(
            new string('b', 64),
            current.SessionId,
            "new-jwt-id",
            current.CompanyId,
            Now.AddMinutes(1),
            expiresOn,
            "127.0.0.1",
            "test-agent");

        Assert.False(current.IsActiveAt(Now.AddMinutes(1)));
        Assert.Equal(PlatformRefreshToken.RotationReason, current.RevocationReason);
        Assert.Equal(current.SessionId, replacement.SessionId);
        Assert.Equal(current.CompanyId, replacement.CompanyId);
        Assert.Equal(expiresOn, replacement.ExpiresOn);
        Assert.NotEqual(current.TokenHash, replacement.TokenHash);
        Assert.True(replacement.IsActiveAt(Now.AddMinutes(1)));
    }

    [Fact]
    public void RotatedToken_DistinguishesConcurrentRefreshGraceFromLaterReuse()
    {
        var current = PlatformRefreshToken.Create(
            new string('a', 64),
            "session-id",
            "old-jwt-id",
            7,
            Now,
            Now.AddDays(14),
            null,
            null);

        current.Revoke(PlatformRefreshToken.RotationReason, Now.AddMinutes(1));

        var rotatedOn = Assert.IsType<DateTime>(current.RevokedOn);
        Assert.True(current.WasRotated);
        Assert.True(current.WasRotatedWithin(
            TimeSpan.FromSeconds(30),
            rotatedOn.AddSeconds(10)));
        Assert.False(current.WasRotatedWithin(
            TimeSpan.FromSeconds(30),
            rotatedOn.AddSeconds(31)));
    }
}

