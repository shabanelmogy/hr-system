namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class CrystalReportStorageOptions
{
    public const string SectionName = "CrystalReports";
    public string StorageRoot { get; set; } = "App_Data/CrystalReports";
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024;
    public long MaxRenderedFileSizeBytes { get; set; } = 50 * 1024 * 1024;
    public long MaxRuntimeDataSizeBytes { get; set; } = 10 * 1024 * 1024;
    public long MaxInspectionResponseSizeBytes { get; set; } = 64 * 1024;
    public long MaxCatalogResponseSizeBytes { get; set; } = 1024 * 1024;
    public int MaxDeploymentCandidates { get; set; } = 1000;
    /// <summary>
    /// Enables calls to the separately deployed Crystal Reports runtime.
    /// Local report storage and catalog operations remain available when this is false.
    /// </summary>
    public bool RuntimeEnabled { get; set; }
    public string RuntimeBaseUrl { get; set; } = string.Empty;
    public string RuntimeApiKey { get; set; } = string.Empty;
}
