using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class CrystalReportDomainTests
{
    [Fact]
    public void Create_NormalizesStableKeys_WithoutAcceptingStorageOrScopeValues()
    {
        var report = CrystalReport.Create(
            " Countries ", " Countries-With-States ", "Country details", "  Example  ");

        Assert.Equal("countries", report.EntityKey);
        Assert.Equal("countries-with-states", report.ReportKey);
        Assert.Equal("Country details", report.DisplayName);
        Assert.Equal("Example", report.Description);
        Assert.Null(report.CurrentPublishedVersionId);
        Assert.Empty(report.TenantId);
    }

    [Fact]
    public void Publish_UsesSummaryTitle_AndFallsBackOnlyWhenTitleIsEmpty()
    {
        var report = CrystalReport.Create("countries", "countries", "Initial", null);
        var first = CreateVersion(report.Id, 1, "Countries.rpt", "Countries master");
        report.Publish(first);

        Assert.Equal(first.Id, report.CurrentPublishedVersionId);
        Assert.Equal("Countries master", report.DisplayName);

        var second = CreateVersion(report.Id, 2, "Countries.Compact.rpt", null);
        report.Publish(second);
        Assert.Equal("Countries.Compact", report.DisplayName);
    }

    [Theory]
    [InlineData("country_reports")]
    [InlineData("country.reports")]
    [InlineData("country--reports")]
    public void Create_RejectsKeysOutsideCanonicalHyphenGrammar(string key)
    {
        Assert.Throws<ArgumentException>(() =>
            CrystalReport.Create(key, "countries", "Countries", null));
    }

    [Fact]
    public void ArchivedReport_RejectsVersionAndPublishMutations()
    {
        var report = CrystalReport.Create("countries", "countries", "Countries", null);
        var version = CreateVersion(report.Id, 1, "Countries.rpt", null);
        report.Archive();

        Assert.Throws<InvalidOperationException>(() => report.AddVersion(version));
        Assert.Throws<InvalidOperationException>(() => report.Publish(version));
    }

    [Fact]
    public void RoleGrant_CombinesIndependentRuntimeAndManagementRights()
    {
        var grant = CrystalReportRoleGrant.Create(
            Guid.NewGuid(), "role-1",
            CrystalReportRight.Run | CrystalReportRight.Download);

        Assert.True(grant.Rights.HasFlag(CrystalReportRight.Run));
        Assert.True(grant.Rights.HasFlag(CrystalReportRight.Download));
        Assert.False(grant.Rights.HasFlag(CrystalReportRight.Publish));
    }

    private static CrystalReportVersion CreateVersion(
        Guid reportId,
        int versionNumber,
        string fileName,
        string? title) =>
        CrystalReportVersion.Create(
            reportId,
            versionNumber,
            $"{Guid.NewGuid():N}.rpt",
            fileName,
            1024,
            new string('a', 64),
            title,
            null,
            CrystalReportValidationStatus.Valid,
            null);
}

