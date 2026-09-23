using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Entities;
using ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Enums;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Reporting;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Accounting.Tests;

public sealed class AccountingReportingSourceTests
{
    [Fact]
    public async Task FiscalYears_AreFilteredByTheTrustedTenantCompanyAndApprovedFields()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        await using (var firstCompany = CreateContext(databaseName, "tenant-1", 11))
        {
            firstCompany.FiscalYears.Add(Create("FY-2027", "tenant-1", 11));
            await firstCompany.SaveChangesAsync();
        }

        await using (var secondCompany = CreateContext(databaseName, "tenant-1", 22))
        {
            secondCompany.FiscalYears.Add(Create("FY-OTHER", "tenant-1", 22));
            await secondCompany.SaveChangesAsync();
        }

        await using var reportContext = CreateContext(databaseName, "tenant-1", 11);
        var source = new AccountingReportingSource(reportContext);

        var rows = await source.GetFiscalYearsAsync(
            "FY-2027",
            null,
            "Fiscal Year 2027",
            10_001,
            CancellationToken.None);

        Assert.Equal(12, rows.Count);
        Assert.All(rows, row =>
        {
            Assert.Equal("FY-2027", row.FiscalYearCode);
            Assert.Equal("Fiscal Year 2027", row.FiscalYearEn);
            Assert.Equal("Monthly", row.PeriodFrequency);
            Assert.Equal("Draft", row.FiscalYearStatus);
            Assert.NotNull(row.FiscalPeriodId);
            Assert.NotNull(row.FiscalPeriodCode);
            Assert.Equal("Draft", row.FiscalPeriodStatus);
        });
        Assert.Equal(Enumerable.Range(1, 12), rows.Select(row => row.FiscalPeriodSequence!.Value));
        Assert.DoesNotContain(rows, row => row.FiscalYearCode == "FY-OTHER");
    }

    private static AccountingDbContext CreateContext(string databaseName, string tenantId, int companyId) =>
        new(
            new DbContextOptionsBuilder<AccountingDbContext>()
                .UseInMemoryDatabase(databaseName)
                .Options,
            new TestActor(tenantId, companyId),
            TimeProvider.System);

    private static FiscalYear Create(string code, string tenantId, int companyId) =>
        new(
            code,
            "السنة المالية 2027",
            "Fiscal Year 2027",
            new DateOnly(2027, 1, 1),
            new DateOnly(2027, 12, 31),
            FiscalPeriodFrequency.Monthly)
        {
            TenantId = tenantId,
            CompanyId = companyId
        };

    private sealed record TestActor(string? TenantId, int? CompanyId) : ICurrentActor
    {
        public string? UserId => "report-test";
    }
}
