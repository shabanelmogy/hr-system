using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Tests;

public sealed class AuthenticationSelectionChallengeStoreTests
{
    private static readonly DateTimeOffset Now =
        new(2026, 8, 25, 8, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task ConsumeAsync_AllowsASelectionChallengeOnlyOnce()
    {
        await using var context = CreateContext();
        var store = new AuthenticationSelectionChallengeStore(context);

        await store.StoreAsync(
            Challenge("selection-jti", "user-id", "company-selection", "tenant-id", Now.AddMinutes(5)),
            Now.UtcDateTime,
            CancellationToken.None);

        Assert.True(await store.ConsumeAsync(
            "selection-jti",
            "user-id",
            "company-selection",
            "tenant-id",
            Now.UtcDateTime,
            CancellationToken.None));
        Assert.False(await store.ConsumeAsync(
            "selection-jti",
            "user-id",
            "company-selection",
            "tenant-id",
            Now.UtcDateTime,
            CancellationToken.None));
    }

    [Fact]
    public async Task ConsumeAsync_MismatchDoesNotBurnChallenge()
    {
        await using var context = CreateContext();
        var store = new AuthenticationSelectionChallengeStore(context);

        await store.StoreAsync(
            Challenge("selection-jti", "user-id", "company-selection", "tenant-id", Now.AddMinutes(5)),
            Now.UtcDateTime,
            CancellationToken.None);

        Assert.False(await store.ConsumeAsync(
            "selection-jti",
            "user-id",
            "company-selection",
            "another-tenant",
            Now.UtcDateTime,
            CancellationToken.None));
        Assert.False(await store.ConsumeAsync(
            "selection-jti",
            "another-user",
            "company-selection",
            "tenant-id",
            Now.UtcDateTime,
            CancellationToken.None));
        Assert.False(await store.ConsumeAsync(
            "selection-jti",
            "user-id",
            "tenant-selection",
            "tenant-id",
            Now.UtcDateTime,
            CancellationToken.None));

        Assert.True(await store.ConsumeAsync(
            "selection-jti",
            "user-id",
            "company-selection",
            "tenant-id",
            Now.UtcDateTime,
            CancellationToken.None));
    }

    [Fact]
    public async Task ConsumeAsync_UsesStrictExpiryBoundaryAndNullableTenantBinding()
    {
        await using var context = CreateContext();
        var store = new AuthenticationSelectionChallengeStore(context);

        await store.StoreAsync(
            Challenge("expired-jti", "user-id", "company-selection", "tenant-id", Now),
            Now.UtcDateTime,
            CancellationToken.None);
        Assert.False(await store.ConsumeAsync(
            "expired-jti",
            "user-id",
            "company-selection",
            "tenant-id",
            Now.UtcDateTime,
            CancellationToken.None));

        await store.StoreAsync(
            Challenge("tenant-jti", "user-id", "tenant-selection", null, Now.AddMinutes(5)),
            Now.UtcDateTime,
            CancellationToken.None);
        Assert.False(await store.ConsumeAsync(
            "tenant-jti",
            "user-id",
            "tenant-selection",
            "tenant-id",
            Now.UtcDateTime,
            CancellationToken.None));
        Assert.True(await store.ConsumeAsync(
            "tenant-jti",
            "user-id",
            "tenant-selection",
            null,
            Now.UtcDateTime,
            CancellationToken.None));
    }

    [Fact]
    public async Task StoreAsync_RemovesPreviouslyExpiredRowsButStillStoresCurrentRequest()
    {
        await using var context = CreateContext();
        var store = new AuthenticationSelectionChallengeStore(context);
        context.AuthenticationSelectionChallenges.AddRange(
            new ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities.AuthenticationSelectionChallenge(
                "old-expired", "user-id", "scope", Now.AddMinutes(-10).UtcDateTime, Now.AddSeconds(-1).UtcDateTime),
            new ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities.AuthenticationSelectionChallenge(
                "old-active", "user-id", "scope", Now.AddMinutes(-1).UtcDateTime, Now.AddMinutes(2).UtcDateTime));
        await context.SaveChangesAsync();

        await store.StoreAsync(
            Challenge("new-expired", "user-id", "scope", null, Now.AddSeconds(-1)),
            Now.UtcDateTime,
            CancellationToken.None);

        var ids = await context.AuthenticationSelectionChallenges
            .OrderBy(challenge => challenge.JwtId)
            .Select(challenge => challenge.JwtId)
            .ToArrayAsync();
        Assert.Equal(["new-expired", "old-active"], ids);
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new EmptyCurrentActor(), new FixedTimeProvider(Now));
    }

    private static SelectionChallengePersistenceRecord Challenge(
        string jwtId,
        string userId,
        string scope,
        string? tenantId,
        DateTimeOffset expiresOn) =>
        new(jwtId, userId, scope, tenantId, Now.UtcDateTime, expiresOn.UtcDateTime);

    private sealed class EmptyCurrentActor : ICurrentActor
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }
}
