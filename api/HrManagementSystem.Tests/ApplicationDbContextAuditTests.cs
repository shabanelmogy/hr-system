using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrManagementSystem.Tests;

public sealed class ApplicationDbContextAuditTests
{
    [Fact]
    public async Task SaveChangesAsync_StampsCreatedEntityWithCurrentActor()
    {
        await using var context = CreateContext("actor-1");
        var country = CreateCountry();

        context.Countries.Add(country);
        await context.SaveChangesAsync();

        Assert.Equal("actor-1", country.CreatedById);
        Assert.Equal(Environment.MachineName, country.CreatedByPc);
    }

    [Fact]
    public async Task SaveChangesAsync_UsesConfiguredUtcTime()
    {
        var utcNow = new DateTimeOffset(2026, 8, 11, 9, 30, 0, TimeSpan.Zero);
        await using var context = CreateContext("actor-1", new FixedTimeProvider(utcNow));
        var country = CreateCountry();

        context.Countries.Add(country);
        await context.SaveChangesAsync();

        Assert.Equal(utcNow.UtcDateTime, country.CreatedOn);
    }

    [Fact]
    public async Task SaveChangesAsync_RejectsAuditableCreateWithoutActor()
    {
        await using var context = CreateContext(null);
        context.Countries.Add(CreateCountry());

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => context.SaveChangesAsync());

        Assert.Contains("ICurrentActorScope", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ApplicationDbContext_ImplementsUnitOfWork()
    {
        using var context = CreateContext("actor-1");

        Assert.IsAssignableFrom<IUnitOfWork>(context);
    }

    [Fact]
    public async Task SaveChangesAsync_PreservesExplicitActorWhenCurrentActorIsUnavailable()
    {
        await using var context = CreateContext(null);
        var country = CreateCountry();
        country.CreatedById = "system";

        context.Countries.Add(country);
        await context.SaveChangesAsync();

        Assert.Equal("system", country.CreatedById);
    }

    private static ApplicationDbContext CreateContext(
        string? actorUserId,
        TimeProvider? timeProvider = null)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        return new ApplicationDbContext(
            options,
            new TestCurrentActor(actorUserId),
            timeProvider ?? TimeProvider.System);
    }

    private static Country CreateCountry() => new()
    {
        NameAr = "Test",
        NameEn = "Test"
    };

    private sealed class TestCurrentActor(string? userId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
        public string? TenantId => null;
        public int? CompanyId => null;
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}
