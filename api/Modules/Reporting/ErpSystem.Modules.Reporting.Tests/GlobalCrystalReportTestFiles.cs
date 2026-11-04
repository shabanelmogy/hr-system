using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

namespace ErpSystem.Modules.Reporting.Tests;

/// <summary>Typed storage fixture; it proves orchestration, never native-template validity.</summary>
internal sealed class GlobalCrystalReportTestFiles : ICrystalReportFileStorage
{
    public CrystalReportFileFailure Failure { get; set; }
    public int Writes { get; private set; }
    public int Deletes { get; private set; }
    public int Reads { get; private set; }
    public Action? BeforeStore { get; set; }
    public Task<StoreCrystalReportFileResult> StoreAsync(string entityKey, FileUpload upload, CancellationToken cancellationToken)
    {
        Writes++;
        BeforeStore?.Invoke();
        var registry = ManagedCrystalReportContractRegistry.LoadEmbedded();
        return Task.FromResult(Failure == CrystalReportFileFailure.None
            ? new StoreCrystalReportFileResult(new StoredCrystalReportFile($"{Guid.NewGuid():N}.rpt", upload.FileName,
                upload.Length, new string('b', 64), "Fixture", null, registry.SchemaVersion, registry.Fingerprint), Failure, null)
            : new StoreCrystalReportFileResult(null, Failure, "Fixture rejected"));
    }
    public Task<Stream?> OpenVerifiedReadAsync(string storageKey, long expectedSize, string expectedSha256, CancellationToken cancellationToken)
    {
        Reads++;
        return Task.FromResult<Stream?>(new MemoryStream("fixture-source"u8.ToArray()));
    }
    public Task DeleteIfExistsAsync(string storageKey, CancellationToken cancellationToken)
    {
        Deletes++;
        return Task.CompletedTask;
    }
}
