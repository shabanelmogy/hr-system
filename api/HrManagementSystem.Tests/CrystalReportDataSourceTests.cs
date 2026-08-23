using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
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
            "districts", new Dictionary<string, string?>(), CancellationToken.None);

        Assert.Null(result);
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
