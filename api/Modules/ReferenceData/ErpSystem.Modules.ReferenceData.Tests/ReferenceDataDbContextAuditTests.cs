using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;
using ErpSystem.Modules.ReferenceData.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.ReferenceData.Tests;

public sealed class ReferenceDataDbContextAuditTests
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
    public async Task SaveChangesAsync_UsesSystemActorForSeedStyleWritesWithoutRequestActor()
    {
        await using var context = CreateContext(null);
        var country = CreateCountry();
        context.Countries.Add(country);

        await context.SaveChangesAsync();

        Assert.Equal("system", country.CreatedById);
    }

    [Fact]
    public void ReferenceDataDbContext_ImplementsUnitOfWork()
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

    [Fact]
    public async Task SaveChangesAsync_ConvertsAuditableDeleteToSoftDelete()
    {
        var utcNow = new DateTimeOffset(2026, 8, 11, 10, 0, 0, TimeSpan.Zero);
        await using var context = CreateContext("actor-1", new FixedTimeProvider(utcNow));
        var country = CreateCountry();
        context.Countries.Add(country);
        await context.SaveChangesAsync();

        context.Countries.Remove(country);
        await context.SaveChangesAsync();

        Assert.True(country.IsDeleted);
        Assert.Equal("actor-1", country.DeletedById);
        Assert.Equal(utcNow.UtcDateTime, country.DeletedOn);
        Assert.Equal(EntityState.Unchanged, context.Entry(country).State);
        Assert.Empty(await context.Countries.ToListAsync());
        Assert.Same(country, await context.Countries.IgnoreQueryFilters().SingleAsync());
    }

    private static ReferenceDataDbContext CreateContext(
        string? actorUserId,
        TimeProvider? timeProvider = null)
    {
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        return new ReferenceDataDbContext(
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

