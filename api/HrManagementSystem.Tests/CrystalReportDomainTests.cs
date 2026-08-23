using HrManagementSystem.Domain.Analytics.CrystalReports.Entities;

namespace HrManagementSystem.Tests;

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
        var first = Guid.NewGuid();
        report.Publish(first, "Countries master", "Countries.rpt");

        Assert.Equal(first, report.CurrentPublishedVersionId);
        Assert.Equal("Countries master", report.DisplayName);

        var second = Guid.NewGuid();
        report.Publish(second, null, "Countries.Compact.rpt");
        Assert.Equal("Countries.Compact", report.DisplayName);
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
}
