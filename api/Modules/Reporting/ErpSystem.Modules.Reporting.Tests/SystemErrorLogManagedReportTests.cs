using System.Globalization;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class SystemErrorLogManagedReportTests
{
    [Theory]
    [InlineData(false, true, true, false)]
    [InlineData(true, false, true, false)]
    [InlineData(true, true, false, false)]
    [InlineData(true, true, true, true)]
    public void Consumer_requires_super_admin_source_and_report_grants(bool superAdmin, bool source, bool report, bool expected)
    {
        var policy = Policy(superAdmin, source, report);
        Assert.Equal(expected, policy.Allows("system-error-logs"));
        Assert.False(policy.Allows("system-error-logs", download: true));
        var permissions = new Permissions(["SystemErrorLogs:View", ReportingPermissions.ViewGlobalCrystalReports,
            ReportingPermissions.CreateGlobalCrystalReports, ReportingPermissions.EditGlobalCrystalReportAccess]);
        var management = new GlobalCrystalReportPolicy(new Actor(true), permissions);
        Assert.True(management.Allows("system-error-logs", ReportingPermissions.CreateGlobalCrystalReports));
        Assert.False(management.Allows("system-error-logs", ReportingPermissions.EditGlobalCrystalReportAccess));
    }

    [Fact]
    public async Task Provider_denies_before_owner_read_and_passes_bounded_criteria_and_safe_schema()
    {
        var owner = new Source();
        var denied = new SystemErrorLogsCrystalReportDataProvider(owner, Policy(true, false, true));
        Assert.False((await denied.BuildAsync(new Dictionary<string, string?>(), default)).IsSuccess);
        Assert.Equal(0, owner.Reads);

        var provider = new SystemErrorLogsCrystalReportDataProvider(owner, Policy(true, true, true));
        var result = await provider.BuildAsync(new Dictionary<string, string?>
        {
            ["FromUtc"] = "2026-11-06T00:00:00Z", ["StatusCode"] = "500", ["Search"] = "Target"
        }, default);
        Assert.True(result.IsSuccess);
        Assert.Equal(500, owner.Criteria?.StatusCode);
        Assert.Equal(DateTimeKind.Utc, owner.Criteria?.FromUtc?.Kind);
        Assert.Equal("Target", owner.Criteria?.Search);
        ManagedCrystalReportContractRegistry.LoadEmbedded().ValidateDataSetXml("system-error-logs", result.Data!.Xml);
        Assert.Contains("5000000000", result.Data.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("IpAddress", result.Data.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("Diagnostics", result.Data.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("TenantId", result.Data.Xml, StringComparison.Ordinal);
        Assert.False((await provider.BuildAsync(new Dictionary<string, string?> { ["StatusCode"] = "bad" }, default)).IsSuccess);
        Assert.Equal(1, owner.Reads);
    }

    [Fact]
    public void Registered_source_uses_explicit_provider_binding_and_preserves_geographic_view_requirement()
    {
        var registry = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var catalog = new CrystalReportDesignSourceCatalog(registry);
        var logs = Assert.Single(catalog.Sources, source => source.SourceKey == "system-error-logs");
        Assert.Equal("provider", logs.BindingKind);
        Assert.Equal("platform", logs.ModuleKey);
        Assert.Equal(5000, logs.MaxRows);
        Assert.Equal("database-view", Assert.Single(catalog.Sources, source => source.SourceKey == "countries").BindingKind);
        Assert.True(new CreateGlobalCrystalReportDraftCommandValidator().Validate(new CreateGlobalCrystalReportDraftCommand("platform", "system-error-logs",
            "system-error-logs-summary", "Summary", null, registry.Fingerprint)).IsValid);
        Assert.False(new CreateGlobalCrystalReportDraftCommandValidator().Validate(new CreateGlobalCrystalReportDraftCommand("reference-data", "countries",
            "countries-summary", "Summary", null, registry.Fingerprint)).IsValid);
        Assert.Equal("system-error-logs", GlobalCrystalReport.CreateDraft("system-error-logs", "system-error-logs-summary", "Summary", null).EntityKey);
    }

    private static GlobalCrystalReportConsumerPolicy Policy(bool superAdmin, bool source, bool report) => new(new Actor(superAdmin),
        new Permissions([.. source ? new[] { "SystemErrorLogs:View" } : [], .. report ? new[] { ReportingPermissions.ViewGlobalCrystalReports } : []]));

    private sealed class Actor(bool superAdmin) : ICurrentActor
    {
        public string? UserId => "actor";
        public string? TenantId => superAdmin ? null : "tenant";
        public int? CompanyId => superAdmin ? null : 1;
        public bool IsInRole(string role) => superAdmin && role == "super_admin";
    }

    private sealed class Permissions(IReadOnlyList<string> granted) : ICurrentPermissionChecker
    {
        public bool HasPermission(string permission) => granted.Contains(permission, StringComparer.Ordinal);
    }

    private sealed class Source : ISystemErrorLogReportSource
    {
        public int Reads { get; private set; }
        public SystemErrorLogReportCriteria? Criteria { get; private set; }
        public Task<SystemErrorLogReportResult> ReadAsync(SystemErrorLogReportCriteria criteria, CancellationToken token)
        {
            Reads++;
            Criteria = criteria;
            return Task.FromResult(new SystemErrorLogReportResult([
                new(Guid.NewGuid(), DateTime.Parse("2026-11-06T12:00:00Z", CultureInfo.InvariantCulture,
                    DateTimeStyles.AdjustToUniversal), "api", "error", null, "Orders", "Get", 500,
                    5_000_000_000L, null, "TargetSummary", null, null)
            ], SystemErrorLogReportFailure.None));
        }
    }
}
