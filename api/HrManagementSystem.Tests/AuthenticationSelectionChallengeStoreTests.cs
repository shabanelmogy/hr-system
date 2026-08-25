using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrManagementSystem.Tests;

public sealed class AuthenticationSelectionChallengeStoreTests
{
    private static readonly DateTimeOffset Now =
        new(2026, 8, 25, 8, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task ConsumeAsync_AllowsASelectionChallengeOnlyOnce()
    {
        await using var context = CreateContext();
        var store = new AuthenticationSelectionChallengeStore(
            context,
            new FixedTimeProvider(Now));

        await store.StoreAsync(
            "selection-jti",
            "user-id",
            "company-selection",
            Now.AddMinutes(5).UtcDateTime,
            "tenant-id",
            CancellationToken.None);

        Assert.True(await store.ConsumeAsync(
            "selection-jti",
            "user-id",
            "company-selection",
            "tenant-id",
            CancellationToken.None));
        Assert.False(await store.ConsumeAsync(
            "selection-jti",
            "user-id",
            "company-selection",
            "tenant-id",
            CancellationToken.None));
    }

    [Fact]
    public async Task ConsumeAsync_RejectsExpiredOrMismatchedChallenges()
    {
        await using var context = CreateContext();
        var store = new AuthenticationSelectionChallengeStore(
            context,
            new FixedTimeProvider(Now));

        await store.StoreAsync(
            "selection-jti",
            "user-id",
            "company-selection",
            Now.AddMinutes(5).UtcDateTime,
            "tenant-id",
            CancellationToken.None);

        Assert.False(await store.ConsumeAsync(
            "selection-jti",
            "user-id",
            "company-selection",
            "another-tenant",
            CancellationToken.None));

        await store.StoreAsync(
            "expired-jti",
            "user-id",
            "company-selection",
            Now.AddSeconds(-1).UtcDateTime,
            "tenant-id",
            CancellationToken.None);
        Assert.False(await store.ConsumeAsync(
            "expired-jti",
            "user-id",
            "company-selection",
            "tenant-id",
            CancellationToken.None));
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new EmptyCurrentActor(), new FixedTimeProvider(Now));
    }

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
