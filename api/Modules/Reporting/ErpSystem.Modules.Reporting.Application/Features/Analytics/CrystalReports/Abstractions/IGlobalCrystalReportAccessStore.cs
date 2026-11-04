using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

public interface IGlobalCrystalReportAccessStore
{
    Task<PlatformRoleScopePage> RolesAsync(string? search, int page, int pageSize, CancellationToken token);
    Task<bool> RolesValidAsync(IReadOnlyCollection<string> roleIds, CancellationToken token);
    Task<IReadOnlyList<CrystalReportRoleGrantResponse>> GrantsAsync(Guid reportId, CancellationToken token);
    Task<bool> HasRightAsync(Guid reportId, CrystalReportRight right, CancellationToken token);
    Task<IReadOnlyList<Guid>> GrantedReportIdsAsync(CrystalReportRight right, CancellationToken token);
    Task ReplaceAsync(Guid reportId, IReadOnlyList<GlobalCrystalReportRoleGrant> grants, CancellationToken token);
}

public interface IGlobalCrystalReportConsumptionStore
{
    Task<IReadOnlyList<GlobalCrystalManagedCatalogEntry>> CatalogAsync(string entityKey, CrystalReportRight right, CancellationToken token);
}
