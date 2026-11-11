namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

public sealed record GlobalCrystalReportAccessResponse(IReadOnlyList<GlobalCrystalReportRoleGrantResponse> Access,
    IReadOnlyList<string> AllowedRights, bool CanView, bool CanEdit, string RowVersion);


/// <summary>Role scope is explicit; a missing role must never imply platform-wide access.</summary>
public sealed record GlobalCrystalReportRoleGrantResponse(string RoleId, string RoleName,
    IReadOnlyList<string> Rights, string? TenantId, string? TenantName, bool ScopeKnown);
