namespace HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class CrystalReportStorageOptions
{
    public const string SectionName = "CrystalReports";
    public string StorageRoot { get; set; } = "App_Data/CrystalReports";
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024;
    public long MaxRenderedFileSizeBytes { get; set; } = 50 * 1024 * 1024;
    public long MaxRuntimeDataSizeBytes { get; set; } = 10 * 1024 * 1024;
    public string InspectorBaseUrl { get; set; } = string.Empty;
    public string InspectorApiKey { get; set; } = string.Empty;
}
