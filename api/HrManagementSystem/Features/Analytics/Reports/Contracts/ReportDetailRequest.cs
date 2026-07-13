namespace HrManagementSystem.Features.Analytics.Reports.Contracts
{
    public record ReportDetailRequest(int Id, string PropertyName, string ColumnName, int ReportMasterId);
}
