using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Tests;

internal sealed class GlobalCrystalReportTestAccess : IGlobalCrystalReportAccessStore, IGlobalCrystalReportConsumptionStore
{
    public bool Granted { get; set; }
    public CrystalReportRight Rights { get; set; } = CrystalReportRight.Run | CrystalReportRight.Download | CrystalReportRight.Upload | CrystalReportRight.Publish;
    public IReadOnlyList<GlobalCrystalManagedCatalogEntry> Catalog { get; set; } = [];
    public Task<PlatformRoleScopePage> RolesAsync(string? search, int page, int pageSize, CancellationToken token) => Task.FromResult(new PlatformRoleScopePage([], 0));
    public Task<bool> RolesValidAsync(IReadOnlyCollection<string> roleIds, CancellationToken token) => Task.FromResult(roleIds.Count == 0);
    public Task<IReadOnlyList<CrystalReportRoleGrantResponse>> GrantsAsync(Guid reportId, CancellationToken token) => Task.FromResult<IReadOnlyList<CrystalReportRoleGrantResponse>>([]);
    public Task<bool> HasRightAsync(Guid reportId, CrystalReportRight right, CancellationToken token) => Task.FromResult(Granted && Rights.HasFlag(right));
    public Task<IReadOnlyList<Guid>> GrantedReportIdsAsync(CrystalReportRight right, CancellationToken token) => Task.FromResult<IReadOnlyList<Guid>>(Granted ? Catalog.Select(item => item.ReportId).ToArray() : []);
    public Task ReplaceAsync(Guid reportId, IReadOnlyList<GlobalCrystalReportRoleGrant> grants, CancellationToken token) => throw new NotSupportedException();
    public Task<IReadOnlyList<GlobalCrystalManagedCatalogEntry>> CatalogAsync(string entityKey, CrystalReportRight right, CancellationToken token) => Task.FromResult<IReadOnlyList<GlobalCrystalManagedCatalogEntry>>(Granted && Rights.HasFlag(right) ? Catalog.Where(item => item.EntityKey == entityKey).ToArray() : []);

    public static GlobalCrystalReportConsumerPolicy PlatformPolicy => new(new Actor(), new Permissions());
    private sealed class Actor : ICurrentActor
    {
        public string? UserId => "global-fixture";
        public string? TenantId => null;
        public int? CompanyId => null;
        public bool IsInRole(string role) => role == "super_admin";
    }
    private sealed class Permissions : ICurrentPermissionChecker
    {
        public bool HasPermission(string permission) => permission is "GlobalCrystalReports:View" or "GlobalCrystalReports:Download";
    }
}
