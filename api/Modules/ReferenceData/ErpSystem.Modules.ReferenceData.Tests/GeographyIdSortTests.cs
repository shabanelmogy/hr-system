using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Mapping;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.States.Mapping;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.States.Queries;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Mapping;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Queries;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.States.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Districts.Entities;
using ErpSystem.Modules.ReferenceData.Infrastructure;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Countries.Persistence;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.States.Persistence;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Districts.Persistence;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.ReferenceData.Tests;

public sealed class GeographyIdSortTests
{
    [Theory]
    [InlineData("asc", 2, 10, 100)]
    [InlineData("desc", 100, 10, 2)]
    public async Task Countries_SortNumericallyBeforePaging(string direction, int first, int second, int last)
    {
        await using var context = await CreateContextAsync();
        var query = new GetCountriesQuery { SortBy = "id", SortDirection = direction, PageSize = 2 };
        Assert.True((await new GetCountriesQueryValidator().ValidateAsync(query)).IsValid);
        var store = new CountryReadStore(context, Mapping());
        var page = await store.GetPageAsync(query, CancellationToken.None);
        var next = await store.GetPageAsync(query with { PageNumber = 2 }, CancellationToken.None);
        Assert.Equal([first, second], page.Items.Select(item => item.Id));
        Assert.Equal(last, Assert.Single(next.Items).Id);
        Assert.Equal(3, page.MetaData.TotalCount);
    }

    [Theory]
    [InlineData("asc", 2, 10, 100)]
    [InlineData("desc", 100, 10, 2)]
    public async Task States_SortNumericallyBeforePaging(string direction, int first, int second, int last)
    {
        await using var context = await CreateContextAsync();
        var query = new GetStatesQuery { SortBy = "id", SortDirection = direction, PageSize = 2 };
        Assert.True((await new GetStatesQueryValidator().ValidateAsync(query)).IsValid);
        var store = new StateReadStore(context, Mapping());
        var page = await store.GetPageAsync(query, CancellationToken.None);
        var next = await store.GetPageAsync(query with { PageNumber = 2 }, CancellationToken.None);
        Assert.Equal([first, second], page.Items.Select(item => item.Id));
        Assert.Equal(last, Assert.Single(next.Items).Id);
        Assert.Equal(3, page.MetaData.TotalCount);
    }

    [Theory]
    [InlineData("asc", 2, 10, 100)]
    [InlineData("desc", 100, 10, 2)]
    public async Task Districts_SortNumericallyBeforePaging(string direction, int first, int second, int last)
    {
        await using var context = await CreateContextAsync();
        var query = new GetDistrictsQuery { SortBy = "id", SortDirection = direction, PageSize = 2 };
        Assert.True((await new GetDistrictsQueryValidator().ValidateAsync(query)).IsValid);
        var store = new DistrictReadStore(context, Mapping());
        var page = await store.GetPageAsync(query, CancellationToken.None);
        var next = await store.GetPageAsync(query with { PageNumber = 2 }, CancellationToken.None);
        Assert.Equal([first, second], page.Items.Select(item => item.Id));
        Assert.Equal(last, Assert.Single(next.Items).Id);
        Assert.Equal(3, page.MetaData.TotalCount);
    }

    private static TypeAdapterConfig Mapping()
    {
        var config = new TypeAdapterConfig();
        new CountryMappingConfig().Register(config);
        new StateMappingConfig().Register(config);
        new DistrictMappingConfig().Register(config);
        return config;
    }

    private static async Task<ReferenceDataDbContext> CreateContextAsync()
    {
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var context = new ReferenceDataDbContext(options, new TestCurrentActor());
        foreach (var (id, name) in new[] { (100, "Alpha"), (2, "Zulu"), (10, "Middle") })
        {
            context.Countries.Add(new Country { Id = id, NameAr = name, NameEn = name });
            context.States.Add(new State { Id = id, NameAr = name, NameEn = name, Code = $"S{id}", CountryId = 2 });
            context.Districts.Add(new District { Id = id, NameAr = name, NameEn = name, Code = $"D{id}", StateId = 2 });
        }
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        return context;
    }

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }
}
