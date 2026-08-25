using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrManagementSystem.Tests;

public sealed class CrystalReportDataSourceTests
{
    [Fact]
    public async Task BuildAsync_UsesHrDatabaseData_WithStableCountriesSchemaAndFilters()
    {
        await using var context = CreateContext();
        context.Countries.AddRange(
            new Country { Id = 1, NameAr = "مصر", NameEn = "Egypt" },
            new Country { Id = 2, NameAr = "الأردن", NameEn = "Jordan" });
        context.States.Add(new State
        {
            Id = 1,
            CountryId = 1,
            NameAr = "القاهرة",
            NameEn = "Cairo",
            Code = "CAI"
        });
        await context.SaveChangesAsync();
        var source = new CrystalReportDataSource(context);

        var result = await source.BuildAsync(
            "countries",
            new Dictionary<string, string?> { ["NameEn"] = "Egypt" },
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Contains("CountryId", result.Xml, StringComparison.Ordinal);
        Assert.Contains("CountryEn", result.Xml, StringComparison.Ordinal);
        Assert.Contains("StateId", result.Xml, StringComparison.Ordinal);
        Assert.Contains("Egypt", result.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("Jordan", result.Xml, StringComparison.Ordinal);
    }

    [Fact]
    public async Task BuildAsync_RejectsEntitiesWithoutAnApprovedDataProfile()
    {
        await using var context = CreateContext();
        var source = new CrystalReportDataSource(context);

        var result = await source.BuildAsync(
            "addresses", new Dictionary<string, string?>(), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task BuildAsync_UsesStableDistrictSchemaAndDistrictStateFilters()
    {
        await using var context = CreateContext();
        context.Countries.Add(new Country { Id = 1, NameAr = "مصر", NameEn = "Egypt" });
        context.States.Add(new State
        {
            Id = 1,
            CountryId = 1,
            NameAr = "القاهرة",
            NameEn = "Cairo",
            Code = "CAI"
        });
        context.Districts.AddRange(
            new District { Id = 1, StateId = 1, NameAr = "المعادي", NameEn = "Maadi", Code = "MAA" },
            new District { Id = 2, StateId = 1, NameAr = "الزمالك", NameEn = "Zamalek", Code = "ZAM" });
        await context.SaveChangesAsync();
        var source = new CrystalReportDataSource(context);

        var result = await source.BuildAsync(
            "districts",
            new Dictionary<string, string?>
            {
                ["NameEn"] = "Maadi",
                ["StateEn"] = "Cairo"
            },
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Contains("DistrictId", result.Xml, StringComparison.Ordinal);
        Assert.Contains("DistrictCode", result.Xml, StringComparison.Ordinal);
        Assert.Contains("StateEn", result.Xml, StringComparison.Ordinal);
        Assert.Contains("AddressesCount", result.Xml, StringComparison.Ordinal);
        Assert.Contains("Maadi", result.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("Zamalek", result.Xml, StringComparison.Ordinal);

        var unsupportedFilter = await source.BuildAsync(
            "districts",
            new Dictionary<string, string?> { ["Code"] = "MAA" },
            CancellationToken.None);
        Assert.Null(unsupportedFilter);
    }

    [Fact]
    public async Task BuildAsync_UsesStableAddressTypeSchemaAndFilters()
    {
        await using var context = CreateContext();
        context.AddressTypes.AddRange(
            new AddressType { Id = 1, NameAr = "سكن", NameEn = "Residence" },
            new AddressType { Id = 2, NameAr = "عمل", NameEn = "Work" },
            new AddressType { Id = 3, NameAr = "مؤرشف", NameEn = "Archived", IsDeleted = true });
        context.Addresses.AddRange(
            new Address { Id = 1, AddressTypeId = 1 },
            new Address { Id = 2, AddressTypeId = 1, IsDeleted = true },
            new Address { Id = 3, AddressTypeId = 2 });
        await context.SaveChangesAsync();
        var source = new CrystalReportDataSource(context);

        var result = await source.BuildAsync(
            "addresstypes",
            new Dictionary<string, string?> { ["NameEn"] = "Residence" },
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Contains("AddressTypeId", result.Xml, StringComparison.Ordinal);
        Assert.Contains("AddressTypeEn", result.Xml, StringComparison.Ordinal);
        Assert.Contains("AddressesCount", result.Xml, StringComparison.Ordinal);
        Assert.Contains("Residence", result.Xml, StringComparison.Ordinal);
        Assert.Contains(">1<", result.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("Work", result.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("Archived", result.Xml, StringComparison.Ordinal);

        var unsupportedFilter = await source.BuildAsync(
            "addresstypes",
            new Dictionary<string, string?> { ["AddressesCount"] = "1" },
            CancellationToken.None);
        Assert.Null(unsupportedFilter);
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new TestCurrentActor(), TimeProvider.System);
    }

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId => "tenant";
        public int? CompanyId => 1;
    }
}
