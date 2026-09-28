using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class ManagedCrystalTemplateValidationPersistenceTests
{
    private static readonly string Fingerprint = new('a', 64);

    [Fact]
    public async Task ValidationTransition_IsTheOnlyAllowedVersionUpdate()
    {
        await using var context = CreateContext();
        var (_, version) = AddReport(context);
        await context.SaveChangesAsync();

        version.MarkInvalid("Schema mismatch");
        await context.SaveChangesAsync();

        Assert.Equal(CrystalReportValidationStatus.Invalid, version.ValidationStatus);
        Assert.Equal("Schema mismatch", version.ValidationReason);
        Assert.Null(version.ValidationContractSchemaVersion);
        Assert.Null(version.ValidationContractFingerprint);
        Assert.NotNull(version.UpdatedOn);
    }

    [Fact]
    public async Task SourceIdentityUpdate_IsRejectedAsAppendOnlyHistory()
    {
        await using var context = CreateContext();
        var (_, version) = AddReport(context);
        await context.SaveChangesAsync();

        context.Entry(version).Property(item => item.StorageKey).CurrentValue =
            "reports/tampered/source.rpt";

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => context.SaveChangesAsync());

        Assert.Contains("append-only", exception.Message, StringComparison.Ordinal);
    }

    private static (CrystalReport Report, CrystalReportVersion Version) AddReport(
        ReportingDbContext context)
    {
        var report = CrystalReport.Create(
            "countries",
            "countries-directory",
            "Countries directory",
            null);
        var version = CrystalReportVersion.Create(
            report.Id,
            1,
            $"reports/{report.Id:N}/1.rpt",
            "countries-directory.rpt",
            128,
            new string('b', 64),
            "Countries directory",
            null,
            1,
            Fingerprint);
        report.AddVersion(version);
        context.CrystalReports.Add(report);
        return (report, version);
    }

    private static ReportingDbContext CreateContext() =>
        new(
            new DbContextOptionsBuilder<ReportingDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
                .Options,
            new TestCurrentActor(),
            TimeProvider.System);

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => "validation-test";
        public string? TenantId => "tenant-a";
        public int? CompanyId => 1;
    }
}
