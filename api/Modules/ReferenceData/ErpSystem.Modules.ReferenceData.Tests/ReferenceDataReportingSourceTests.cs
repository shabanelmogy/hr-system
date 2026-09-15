using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.AddressTypes.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Districts.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.States.Entities;
using ErpSystem.Modules.ReferenceData.Infrastructure;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.Reporting;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.ReferenceData.Tests;

public sealed class ReferenceDataReportingSourceTests
{
    [Fact]
    public async Task Countries_ExposeOnlyActiveRowsAndApplyApprovedNameFilters()
    {
        await using var context = CreateContext(Guid.NewGuid().ToString("N"), "tenant", 1);
        context.Countries.AddRange(
            new Country
            {
                Id = 1,
                NameAr = "مصر",
                NameEn = "Egypt",
                States =
                [
                    new State { Id = 10, NameAr = "القاهرة", NameEn = "Cairo", Code = "CAI" },
                    new State { Id = 11, NameAr = "مؤرشفة", NameEn = "Archived", Code = "ARC", IsDeleted = true }
                ]
            },
            new Country { Id = 2, NameAr = "الأردن", NameEn = "Jordan" },
            new Country { Id = 3, NameAr = "مؤرشفة", NameEn = "Archived", IsDeleted = true });
        await context.SaveChangesAsync();
        var source = new ReferenceDataReportingSource(context);

        var rows = await source.GetCountriesAsync(null, "Egypt", 10_001, CancellationToken.None);

        var row = Assert.Single(rows);
        Assert.Equal(1, row.CountryId);
        Assert.Equal("Egypt", row.CountryEn);
        Assert.Equal(10, row.StateId);
        Assert.Equal("Cairo", row.StateEn);
    }

    [Fact]
    public async Task Districts_CountOnlyActiveAddressesInTheCurrentCompany()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        await using (var companyOne = CreateContext(databaseName, "tenant", 1))
        {
            companyOne.Countries.Add(new Country { Id = 1, NameAr = "مصر", NameEn = "Egypt" });
            companyOne.States.Add(new State
            {
                Id = 10,
                CountryId = 1,
                NameAr = "القاهرة",
                NameEn = "Cairo",
                Code = "CAI"
            });
            companyOne.Districts.Add(new District
            {
                Id = 20,
                StateId = 10,
                NameAr = "المعادي",
                NameEn = "Maadi",
                Code = "MAA"
            });
            companyOne.AddressTypes.Add(new AddressType { Id = 100, NameAr = "سكن", NameEn = "Residence" });
            companyOne.Addresses.AddRange(
                new Address { Id = 1000, CountryId = 1, StateId = 10, DistrictId = 20, AddressTypeId = 100 },
                new Address { Id = 1001, CountryId = 1, StateId = 10, DistrictId = 20, AddressTypeId = 100, IsDeleted = true });
            await companyOne.SaveChangesAsync();
        }

        await using (var companyTwo = CreateContext(databaseName, "tenant", 2))
        {
            companyTwo.AddressTypes.Add(new AddressType { Id = 200, NameAr = "عمل", NameEn = "Work" });
            companyTwo.Addresses.Add(new Address
            {
                Id = 2000,
                CountryId = 1,
                StateId = 10,
                DistrictId = 20,
                AddressTypeId = 200
            });
            await companyTwo.SaveChangesAsync();
        }

        await using var reportContext = CreateContext(databaseName, "tenant", 1);
        var source = new ReferenceDataReportingSource(reportContext);
        var rows = await source.GetDistrictsAsync(null, "Maadi", null, "Cairo", 10_001, CancellationToken.None);

        var row = Assert.Single(rows);
        Assert.Equal(20, row.DistrictId);
        Assert.Equal(1, row.AddressesCount);
    }

    [Fact]
    public async Task AddressTypes_AreRestrictedToTheActiveTenantAndCompany()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        await using (var companyOne = CreateContext(databaseName, "tenant", 1))
        {
            companyOne.AddressTypes.Add(new AddressType { Id = 1, NameAr = "الشركة الأولى", NameEn = "First Company" });
            await companyOne.SaveChangesAsync();
        }

        await using (var companyTwo = CreateContext(databaseName, "tenant", 2))
        {
            companyTwo.AddressTypes.Add(new AddressType { Id = 2, NameAr = "الشركة الثانية", NameEn = "Second Company" });
            await companyTwo.SaveChangesAsync();
        }

        await using var reportContext = CreateContext(databaseName, "tenant", 1);
        var source = new ReferenceDataReportingSource(reportContext);
        var rows = await source.GetAddressTypesAsync(null, null, 10_001, CancellationToken.None);

        var row = Assert.Single(rows);
        Assert.Equal("First Company", row.AddressTypeEn);
    }

    private static ReferenceDataDbContext CreateContext(string databaseName, string tenantId, int companyId) =>
        new(
            new DbContextOptionsBuilder<ReferenceDataDbContext>()
                .UseInMemoryDatabase(databaseName)
                .Options,
            new TestActor(tenantId, companyId));

    private sealed class TestActor(string tenantId, int companyId) : ICurrentActor
    {
        public string? UserId => "report-test";
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }
}
