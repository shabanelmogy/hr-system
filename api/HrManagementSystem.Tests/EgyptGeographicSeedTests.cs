using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Persistence;
using HrManagementSystem.Infrastructure.Persistence.Seeds;
using Microsoft.EntityFrameworkCore;

namespace HrManagementSystem.Tests;

public sealed class EgyptGeographicSeedTests
{
    [Fact]
    public async Task SeedAsync_AddsEgyptAndAllGovernorates_AndIsIdempotent()
    {
        await using var context = CreateContext();
        await AddSeedUserAsync(context);

        await EgyptGeographicSeed.SeedAsync(context);
        await EgyptGeographicSeed.SeedAsync(context);

        var egypt = await context.Countries.SingleAsync(country => country.Alpha2Code == "EG");
        var states = await context.States
            .Where(state => state.CountryId == egypt.Id)
            .OrderBy(state => state.Code)
            .ToListAsync();

        Assert.Equal("مصر", egypt.NameAr);
        Assert.Equal("Egypt", egypt.NameEn);
        Assert.Equal(27, states.Count);
        Assert.Equal(27, states.Select(state => state.Code).Distinct(StringComparer.Ordinal).Count());
        Assert.Contains(states, state => state.Code == "CAI" && state.NameEn == "Cairo");
        Assert.Contains(states, state => state.Code == "ALX" && state.NameAr == "الإسكندرية");
        Assert.All(states, state => Assert.InRange(state.Code.Length, 2, 10));
        Assert.All(states, state => Assert.False(state.IsDeleted));
    }

    [Fact]
    public async Task SeedAsync_ReusesLegacyEgyptWithBlankCode_WithoutOverwritingUserData()
    {
        await using var context = CreateContext();
        await AddSeedUserAsync(context);
        var legacyEgypt = new Country
        {
            NameAr = " مصر ",
            NameEn = " Egypt ",
            Alpha2Code = " ",
            PhoneCode = "custom-phone",
            CreatedById = "seed-user"
        };
        context.Countries.Add(legacyEgypt);
        await context.SaveChangesAsync();

        await EgyptGeographicSeed.SeedAsync(context);

        var country = await context.Countries.SingleAsync();
        Assert.Equal(legacyEgypt.Id, country.Id);
        Assert.Equal("EG", country.Alpha2Code);
        Assert.Equal(" مصر ", country.NameAr);
        Assert.Equal(" Egypt ", country.NameEn);
        Assert.Equal("custom-phone", country.PhoneCode);
        Assert.Equal(27, await context.States.CountAsync(state => state.CountryId == country.Id));
    }

    [Fact]
    public async Task SeedAsync_SkipsArchivedEgyptWithoutReactivatingOrCreatingReplacement()
    {
        await using var context = CreateContext();
        await AddSeedUserAsync(context);
        var archivedEgypt = new Country
        {
            NameAr = "مصر",
            NameEn = "Egypt",
            Alpha2Code = "EG",
            IsDeleted = true,
            CreatedById = "seed-user"
        };
        context.Countries.Add(archivedEgypt);
        await context.SaveChangesAsync();

        await EgyptGeographicSeed.SeedAsync(context);

        Assert.True((await context.Countries.SingleAsync()).IsDeleted);
        Assert.Empty(await context.States.ToListAsync());
    }

    [Fact]
    public async Task SeedAsync_PreservesEditedGovernorateAndAddsOnlyTheMissingRows()
    {
        await using var context = CreateContext();
        await AddSeedUserAsync(context);
        var egypt = new Country
        {
            NameAr = "مصر",
            NameEn = "Egypt",
            Alpha2Code = "EG",
            CreatedById = "seed-user"
        };
        context.Countries.Add(egypt);
        await context.SaveChangesAsync();
        var editedCairo = new State
        {
            CountryId = egypt.Id,
            Code = "CAI",
            NameAr = "القاهرة",
            NameEn = "Cairo custom",
            CreatedById = "seed-user"
        };
        context.States.Add(editedCairo);
        await context.SaveChangesAsync();

        await EgyptGeographicSeed.SeedAsync(context);

        var state = await context.States.SingleAsync(item => item.Code == "CAI");
        Assert.Equal("Cairo custom", state.NameEn);
        Assert.Equal("CAI", state.Code);
        Assert.Equal(27, await context.States.CountAsync());
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new TestCurrentActor(), TimeProvider.System);
    }

    private static async Task AddSeedUserAsync(ApplicationDbContext context)
    {
        context.Users.Add(new ApplicationUser
        {
            Id = "seed-user",
            UserName = "seed-user",
            NormalizedUserName = "SEED-USER",
            TenantId = "seed-tenant",
            FirstName = "Seed",
            LastName = "User"
        });
        await context.SaveChangesAsync();
    }

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => "seed-user";
        public string? TenantId => "seed-tenant";
        public int? CompanyId => null;
    }
}
