namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Contracts
{
    public record ReportDetailRequest(int Id, string PropertyName, string ColumnName, int ReportMasterId);
}
