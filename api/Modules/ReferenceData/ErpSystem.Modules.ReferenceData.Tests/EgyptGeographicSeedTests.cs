using ErpSystem.Modules.ReferenceData.Infrastructure;
using ErpSystem.Modules.ReferenceData.Infrastructure.Seeds;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.States.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace ErpSystem.Modules.ReferenceData.Tests;

public sealed class EgyptGeographicSeedTests
{
    [Fact]
    public void ReferenceDataModel_ContainsGeographicEntitiesInReferenceDataSchema()
    {
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options;
        using var context = new ReferenceDataDbContext(options);
        var model = context.Model;
        Assert.Contains(model.GetEntityTypes(), entity => entity.ClrType.Name == "Country");
        Assert.Contains(model.GetEntityTypes(), entity => entity.ClrType.Name == "State");
        Assert.Contains(model.GetEntityTypes(), entity => entity.ClrType.Name == "District");
    }

    [Fact]
    public async Task SeedAsync_CreatesEgyptAndTwentySevenGovernorates_AndIsIdempotent()
    {
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using var context = new ReferenceDataDbContext(options);

        await EgyptGeographicSeed.SeedAsync(context);
        await EgyptGeographicSeed.SeedAsync(context);

        var egypt = await context.Countries
            .SingleAsync(country => country.Alpha2Code == "EG");
        var governorateCount = await context.States
            .CountAsync(state => state.CountryId == egypt.Id);

        Assert.Equal(27, governorateCount);
        Assert.Equal(1, await context.Countries.CountAsync(country => country.Alpha2Code == "EG"));
        Assert.All(
            await context.States.Where(state => state.CountryId == egypt.Id).ToListAsync(),
            state => Assert.False(string.IsNullOrWhiteSpace(state.Code)));
    }

    [Fact]
    public async Task SeedAsync_ReusesLegacyEgyptWithBlankCode_WithoutOverwritingCustomData()
    {
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ReferenceDataDbContext(options);
        var legacyEgypt = new Country
        {
            NameAr = " مصر ",
            NameEn = " Egypt ",
            Alpha2Code = " ",
            PhoneCode = "custom-phone"
        };
        context.Countries.Add(legacyEgypt);
        await context.SaveChangesAsync();

        await EgyptGeographicSeed.SeedAsync(context);

        var country = await context.Countries.SingleAsync();
        Assert.Equal(legacyEgypt.Id, country.Id);
        Assert.Equal("EG", country.Alpha2Code);
        Assert.Equal("custom-phone", country.PhoneCode);
        Assert.Equal(27, await context.States.CountAsync(state => state.CountryId == country.Id));
    }

    [Fact]
    public async Task SeedAsync_DoesNotReactivateArchivedEgypt()
    {
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ReferenceDataDbContext(options);
        context.Countries.Add(new Country
        {
            NameAr = "مصر",
            NameEn = "Egypt",
            Alpha2Code = "EG",
            IsDeleted = true
        });
        await context.SaveChangesAsync();

        await EgyptGeographicSeed.SeedAsync(context);

        Assert.True((await context.Countries.IgnoreQueryFilters().SingleAsync()).IsDeleted);
        Assert.Empty(await context.States.ToListAsync());
    }

    [Fact]
    public async Task SeedAsync_PreservesEditedGovernorateAndAddsOnlyMissingRows()
    {
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ReferenceDataDbContext(options);
        var egypt = new Country
        {
            NameAr = "مصر",
            NameEn = "Egypt",
            Alpha2Code = "EG"
        };
        context.Countries.Add(egypt);
        await context.SaveChangesAsync();
        context.States.Add(new State
        {
            CountryId = egypt.Id,
            Code = "CAI",
            NameAr = "القاهرة",
            NameEn = "Cairo custom"
        });
        await context.SaveChangesAsync();

        await EgyptGeographicSeed.SeedAsync(context);

        var cairo = await context.States.SingleAsync(state => state.Code == "CAI");
        Assert.Equal("Cairo custom", cairo.NameEn);
        Assert.Equal(27, await context.States.CountAsync(state => state.CountryId == egypt.Id));
    }
}
