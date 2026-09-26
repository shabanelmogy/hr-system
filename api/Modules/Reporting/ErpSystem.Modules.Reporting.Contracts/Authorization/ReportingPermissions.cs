namespace ErpSystem.Modules.Reporting.Contracts.Authorization;

public static class ReportingPermissions
{
    public const string ViewGlobalCrystalReports = "GlobalCrystalReports:View";
    public const string ViewDashboard = "Analytics:ViewDashboard";
    public const string ExportData = "Analytics:Export";

    public const string ViewDatabaseViews = "DatabaseViews:View";
    public const string EditDatabaseViews = "DatabaseViews:Edit";
    public const string DeleteDatabaseViews = "DatabaseViews:Delete";

    public const string ViewReportsCategories = "ReportsCategories:View";
    public const string CreateReportsCategories = "ReportsCategories:Create";
    public const string EditReportsCategories = "ReportsCategories:Edit";
    public const string DeleteReportsCategories = "ReportsCategories:Delete";

    public const string ViewReportTemplates = "ReportTemplates:View";
    public const string CreateReportTemplates = "ReportTemplates:Create";
    public const string EditReportTemplates = "ReportTemplates:Edit";
    public const string PublishReportTemplates = "ReportTemplates:Publish";
    public const string UnpublishReportTemplates = "ReportTemplates:Unpublish";
    public const string ArchiveReportTemplates = "ReportTemplates:Archive";
    public const string RestoreReportTemplates = "ReportTemplates:Restore";

    public const string ViewCrystalReports = "CrystalReports:View";
    public const string CreateCrystalReports = "CrystalReports:Create";
    public const string DownloadCrystalReports = "CrystalReports:Download";
    public const string UploadCrystalReports = "CrystalReports:Upload";
    public const string PublishCrystalReports = "CrystalReports:Publish";
    public const string ViewCrystalReportAccess = "CrystalReportAccess:View";
    public const string EditCrystalReportAccess = "CrystalReportAccess:Edit";
    public const string ArchiveCrystalReports = "CrystalReports:Archive";

    public static IReadOnlyList<string> Reports { get; } =
    [
        ViewDashboard, ExportData,
        ViewReportsCategories, CreateReportsCategories, EditReportsCategories, DeleteReportsCategories,
        ViewReportTemplates, CreateReportTemplates, EditReportTemplates, PublishReportTemplates,
        UnpublishReportTemplates, ArchiveReportTemplates, RestoreReportTemplates,
        ViewCrystalReports, CreateCrystalReports, DownloadCrystalReports, UploadCrystalReports,
        PublishCrystalReports, ViewCrystalReportAccess, EditCrystalReportAccess, ArchiveCrystalReports,
        ViewDatabaseViews, EditDatabaseViews, DeleteDatabaseViews
    ];

    public static IReadOnlyList<string> GlobalReports { get; } =
    [
        ViewGlobalCrystalReports
    ];

    public static IReadOnlyList<string> All { get; } = [.. Reports, .. GlobalReports];
}
