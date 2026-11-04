namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

public sealed record CrystalReportDatabaseView(string ViewName, bool IsCompatible, string? RejectionCode);
public sealed record CrystalReportDatabaseViewPage(IReadOnlyList<CrystalReportDatabaseView> Items, int TotalCount);
