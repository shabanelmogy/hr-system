using HrManagementSystem.Features.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Infrastructure.Persistance;
using HrManagementSystem.Shared.Abstractions;
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
    public async Task SaveChangesAsync_PreservesExplicitActorWhenCurrentActorIsUnavailable()
    {
        await using var context = CreateContext(null);
        var country = CreateCountry();
        country.CreatedById = "system";

        context.Countries.Add(country);
        await context.SaveChangesAsync();

        Assert.Equal("system", country.CreatedById);
    }

    private static ApplicationDbContext CreateContext(string? actorUserId)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        return new ApplicationDbContext(options, new TestCurrentActor(actorUserId));
    }

    private static Country CreateCountry() => new()
    {
        NameAr = "Test",
        NameEn = "Test"
    };

    private sealed class TestCurrentActor(string? userId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
    }
}
