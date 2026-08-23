using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;
using HrManagementSystem.Application.Common.Files;

namespace HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class PrivateCrystalReportFileStorage(
    IOptions<CrystalReportStorageOptions> options,
    ICrystalReportInspector inspector,
    IWebHostEnvironment environment) : ICrystalReportFileStorage
{
    private static readonly byte[] OleSignature = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];

    public async Task<StoreCrystalReportFileResult> StoreAsync(
        FileUpload upload, CancellationToken cancellationToken)
    {
        var fileName = Path.GetFileName(upload.FileName);
        if (!string.Equals(Path.GetExtension(fileName), ".rpt", StringComparison.OrdinalIgnoreCase))
            return Failure(CrystalReportFileFailure.InvalidExtension);
        if (upload.Length <= 0 || upload.Length > options.Value.MaxFileSizeBytes)
            return Failure(CrystalReportFileFailure.TooLarge);
        if (!await HasValidSignatureAsync(upload, cancellationToken))
            return Failure(CrystalReportFileFailure.InvalidSignature);

        var inspection = await inspector.InspectAsync(upload, cancellationToken);
        if (inspection is null)
            return Failure(CrystalReportFileFailure.InspectionUnavailable);
        if (!inspection.IsValid)
            return new StoreCrystalReportFileResult(
                null, CrystalReportFileFailure.InspectionRejected, inspection.ValidationReason);

        var storageKey = $"{Guid.NewGuid():N}.rpt";
        var finalPath = ResolvePath(storageKey);
        Directory.CreateDirectory(Path.GetDirectoryName(finalPath)!);
        var temporaryPath = finalPath + ".uploading";
        long length = 0;
        string hash;
        try
        {
            await using var input = upload.OpenReadStream();
            using var hasher = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
            await using (var output = new FileStream(
                             temporaryPath, FileMode.CreateNew, FileAccess.Write, FileShare.None,
                             81920, FileOptions.Asynchronous | FileOptions.SequentialScan))
            {
                var buffer = new byte[81920];
                int read;
                while ((read = await input.ReadAsync(buffer, cancellationToken)) > 0)
                {
                    length += read;
                    if (length > options.Value.MaxFileSizeBytes)
                        throw new CrystalReportTooLargeException();
                    hasher.AppendData(buffer, 0, read);
                    await output.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
                }
                await output.FlushAsync(cancellationToken);
            }

            hash = Convert.ToHexString(hasher.GetHashAndReset()).ToLowerInvariant();
            File.Move(temporaryPath, finalPath);
        }
        catch (CrystalReportTooLargeException)
        {
            TryDelete(temporaryPath);
            return Failure(CrystalReportFileFailure.TooLarge);
        }
        catch
        {
            TryDelete(temporaryPath);
            throw;
        }

        return new StoreCrystalReportFileResult(
            new StoredCrystalReportFile(
                storageKey, fileName, length, hash,
                inspection.SummaryTitle, inspection.SummarySubject),
            CrystalReportFileFailure.None, null);
    }

    public Task<Stream?> OpenReadAsync(string storageKey, CancellationToken cancellationToken)
    {
        var path = ResolvePath(storageKey);
        Stream? stream = File.Exists(path)
            ? new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read,
                81920, FileOptions.Asynchronous | FileOptions.SequentialScan)
            : null;
        return Task.FromResult(stream);
    }

    public Task DeleteIfExistsAsync(string storageKey, CancellationToken cancellationToken)
    {
        TryDelete(ResolvePath(storageKey));
        return Task.CompletedTask;
    }

    private async Task<bool> HasValidSignatureAsync(
        FileUpload upload, CancellationToken cancellationToken)
    {
        await using var stream = upload.OpenReadStream();
        var header = new byte[OleSignature.Length];
        var offset = 0;
        while (offset < header.Length)
        {
            var read = await stream.ReadAsync(header.AsMemory(offset), cancellationToken);
            if (read == 0)
                return false;
            offset += read;
        }
        return header.SequenceEqual(OleSignature);
    }

    private string ResolvePath(string storageKey)
    {
        if (Path.GetFileName(storageKey) != storageKey ||
            !storageKey.EndsWith(".rpt", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Invalid private Crystal report storage key.");
        var configuredRoot = options.Value.StorageRoot;
        var root = Path.GetFullPath(Path.IsPathRooted(configuredRoot)
            ? configuredRoot
            : Path.Combine(environment.ContentRootPath, configuredRoot));
        var candidate = Path.GetFullPath(Path.Combine(root, storageKey));
        if (!candidate.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Crystal report storage path escaped its private root.");
        return candidate;
    }

    private static StoreCrystalReportFileResult Failure(CrystalReportFileFailure failure) =>
        new(null, failure, null);
    private static void TryDelete(string path)
    {
        try { if (File.Exists(path)) File.Delete(path); }
        catch (IOException) { }
        catch (UnauthorizedAccessException) { }
    }
    private sealed class CrystalReportTooLargeException : Exception;
}
