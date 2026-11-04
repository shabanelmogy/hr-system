using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports.V1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class GlobalCrystalReportReplacementTests
{
    private static readonly ManagedCrystalReportContractRegistry Contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();

    [Fact]
    public void ConfirmedReplacement_HasASeparateAtomicEndpoint()
    {
        var routes = typeof(GlobalCrystalReportManagementController).GetMethods()
            .SelectMany(method => method.GetCustomAttributes(typeof(HttpPostAttribute), false)
                .Cast<HttpPostAttribute>())
            .Select(attribute => attribute.Template);

        Assert.Contains("{id:guid}/replace", routes);
    }

    [Fact]
    public async Task Replacement_PublishesTheNewVersionAndRetainsIdentityBindingGrantsAndOriginalSource()
    {
        await using var context = Context();
        var report = await SeedAsync(context);
        var first = Assert.Single(report.Versions);
        var originalStorageKey = first.StorageKey;
        var grant = Assert.Single(report.RoleGrants);
        var result = await Handler(context, new GlobalCrystalReportTestFiles()).Handle(
            new ReplaceGlobalCrystalReportCommand(report.Id, Convert.ToBase64String(report.RowVersion), Upload()), default);

        Assert.True(result.IsSuccess);
        Assert.Equal(report.Id, result.Value.Id);
        Assert.Equal("countries-directory", result.Value.ReportKey);
        Assert.Equal("Keep description", result.Value.Description);
        Assert.Equal("ref.vw_Countries", result.Value.ViewName);
        Assert.Equal(2, result.Value.CurrentVersionNumber);
        Assert.Equal(2, result.Value.Versions.Count);
        var current = Assert.Single(result.Value.Versions, version => version.IsPublished);
        Assert.Equal(2, current.VersionNumber);
        Assert.Equal("Fixture", current.SummaryTitle);
        Assert.False(result.Value.Versions.Single(version => version.Id == first.Id).IsPublished);
        Assert.Equal(originalStorageKey, first.StorageKey);
        Assert.Equal("Original title", first.SummaryTitle);
        Assert.Equal(grant.Id, Assert.Single(report.RoleGrants).Id);
    }

    [Theory]
    [InlineData("countries", "Countries.Directory.rpt", true)]
    [InlineData("countries", "Countries.Other.rpt", false)]
    [InlineData("states", "States.Directory.rpt", false)]
    public async Task Lookup_MatchesOnlyTheNormalizedFilenameWithinItsEntity(string entity, string fileName, bool exists)
    {
        await using var context = Context();
        var report = await SeedAsync(context);
        var result = await new GetGlobalCrystalReportUploadTargetQueryHandler(new GlobalCrystalReportStore(context),
            Policy(), new GlobalCrystalReportTestAccess(), Errors()).Handle(
            new GetGlobalCrystalReportUploadTargetQuery(entity, fileName), default);

        Assert.True(result.IsSuccess);
        Assert.Equal(exists, result.Value.Report is not null);
        Assert.Equal(exists, result.Value.CanReplace);
        if (exists) Assert.Equal(report.Id, result.Value.Report!.Id);
        Assert.Single(report.Versions);
    }

    [Theory]
    [InlineData(CrystalReportFileFailure.SourceRejected)]
    [InlineData(CrystalReportFileFailure.SchemaMismatch)]
    public async Task InvalidSource_PreservesTheCurrentPublication(CrystalReportFileFailure failure)
    {
        await using var context = Context();
        var report = await SeedAsync(context);
        var firstId = report.CurrentPublishedVersionId;
        var files = new GlobalCrystalReportTestFiles { Failure = failure };
        var result = await Handler(context, files).Handle(
            new ReplaceGlobalCrystalReportCommand(report.Id, Convert.ToBase64String(report.RowVersion), Upload()), default);

        Assert.True(result.IsFailure);
        Assert.Equal(firstId, report.CurrentPublishedVersionId);
        Assert.Single(await context.GlobalCrystalReportVersions.ToArrayAsync());
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ForbiddenOrArchivedTarget_IsRejectedBeforeInspection(bool archived)
    {
        await using var context = Context();
        var report = await SeedAsync(context);
        if (archived) { report.Archive(); await context.SaveChangesAsync(); }
        var files = new GlobalCrystalReportTestFiles();
        var result = await Handler(context, files, archived ? Policy() : Policy(ReportingPermissions.PublishGlobalCrystalReports))
            .Handle(new ReplaceGlobalCrystalReportCommand(report.Id, Convert.ToBase64String(report.RowVersion), Upload()), default);

        Assert.True(result.IsFailure);
        Assert.Equal(0, files.Writes);
        Assert.Single(report.Versions);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task StaleConfirmation_PreservesPublicationAndCleansOnlyAnUncommittedNewSource(bool duringInspection)
    {
        await using var context = Context();
        var report = await SeedAsync(context);
        var firstId = report.CurrentPublishedVersionId;
        var files = new GlobalCrystalReportTestFiles();
        if (duringInspection) files.BeforeStore = () => report.RowVersion = Enumerable.Repeat((byte)1, 8).ToArray();
        var expected = duringInspection ? new byte[8] : Enumerable.Repeat((byte)2, 8).ToArray();
        var result = await Handler(context, files).Handle(
            new ReplaceGlobalCrystalReportCommand(report.Id, Convert.ToBase64String(expected), Upload()), default);

        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.ConcurrencyConflict", result.Error.Code);
        Assert.Equal(firstId, report.CurrentPublishedVersionId);
        Assert.Single(report.Versions);
        Assert.Equal(duringInspection ? 1 : 0, files.Deletes);
    }

    [Theory]
    [InlineData(CrystalReportRight.Upload)]
    [InlineData(CrystalReportRight.Publish)]
    public async Task Replacement_RequiresBothReportRightsWithoutAccessAdministration(CrystalReportRight right)
    {
        await using var context = Context();
        var report = await SeedAsync(context);
        var files = new GlobalCrystalReportTestFiles();
        var policy = Policy(ReportingPermissions.EditGlobalCrystalReportAccess);
        var access = new GlobalCrystalReportTestAccess { Granted = true, Rights = right };
        var result = await new ReplaceGlobalCrystalReportCommandHandler(new GlobalCrystalReportStore(context), files,
            context, policy, Contracts, Errors(), access).Handle(
            new ReplaceGlobalCrystalReportCommand(report.Id, Convert.ToBase64String(report.RowVersion), Upload()), default);

        Assert.True(result.IsFailure);
        Assert.Equal(0, files.Writes);
        Assert.Single(report.Versions);
    }

    private static ReplaceGlobalCrystalReportCommandHandler Handler(ReportingDbContext context,
        GlobalCrystalReportTestFiles files, GlobalCrystalReportPolicy? policy = null) =>
        new(new GlobalCrystalReportStore(context), files, context, policy ?? Policy(), Contracts, Errors(), new GlobalCrystalReportTestAccess());

    private static async Task<GlobalCrystalReport> SeedAsync(ReportingDbContext context)
    {
        var report = GlobalCrystalReport.CreateDraft("countries", "countries-directory", "Original", "Keep description",
            "ref.vw_Countries", new string('d', 64));
        var version = GlobalCrystalReportVersion.Create(report.Id, 1, "original.rpt", "Countries.Directory.rpt", 32,
            new string('b', 64), "Original title", "Original subject", Contracts.SchemaVersion, Contracts.Fingerprint);
        report.AddVersion(version);
        report.Publish(version, Contracts.Fingerprint);
        report.RowVersion = new byte[8];
        report.RoleGrants.Add(GlobalCrystalReportRoleGrant.Create(report.Id, "reader-role", CrystalReportRight.Run));
        context.GlobalCrystalReports.Add(report);
        await context.SaveChangesAsync();
        return report;
    }

    private static ReportingDbContext Context() => new(
        new DbContextOptionsBuilder<ReportingDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options, new Actor());
    private static FileUpload Upload() => new("Countries.Directory.rpt", "application/octet-stream", 32, () => new MemoryStream(new byte[32]));
    private static CrystalReportErrors Errors() => new(new Echo());
    private static GlobalCrystalReportPolicy Policy(string? excluded = null) => new(new Actor(), new Permissions(excluded));
    private sealed class Actor : ICurrentActor
    {
        public string UserId => "replacement-fixture";
        public string? TenantId => null;
        public int? CompanyId => null;
        public bool IsInRole(string role) => role == "super_admin";
    }
    private sealed class Permissions(string? excluded) : ICurrentPermissionChecker
    {
        public bool HasPermission(string permission) => permission != excluded &&
            (ReportingPermissions.GlobalReports.Contains(permission) || permission is "Countries:Edit" or "States:Edit");
    }
    private sealed class Echo : IStringLocalizer<CrystalReportDetailResponse>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
