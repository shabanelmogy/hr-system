namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

public sealed record GlobalCrystalReportAccessResponse(IReadOnlyList<CrystalReportRoleGrantResponse> Access,
    IReadOnlyList<string> AllowedRights, bool CanView, bool CanEdit, string RowVersion);

