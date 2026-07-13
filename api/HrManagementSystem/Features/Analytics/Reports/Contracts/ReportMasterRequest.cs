namespace HrManagementSystem.Features.Analytics.Reports.Contracts
{
    public record ReportMasterRequest(
        string ReportName,
        string ExportedName,
        string ReportPath,
        string Logo,
        string ViewName,
        int ReportCategoryId);
}
