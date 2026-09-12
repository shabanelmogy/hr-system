using ErpSystem.Modules.HR.Application.Common.Files;
using ErpSystem.Modules.HR.Application.Features.Platform.Files.Contracts;
using ErpSystem.Modules.HR.Application.Features.Platform.Files.Services;
using ErpSystem.Modules.Platform.Contracts.Files;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.Files.Services;

/// <summary>
/// Legacy HR application compatibility facade. Generic file workflow ownership
/// lives in Platform; this adapter preserves the existing HR transport contract.
/// </summary>
public sealed class FileService(IFileOperationsService operations) : IFileService
{
    public async Task<IEnumerable<UploadFileResponse>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        (await operations.GetAllAsync(cancellationToken).ConfigureAwait(false))
        .Select(MapResponse)
        .ToArray();

    public Task<string> UploadAsync(FileUpload file, CancellationToken cancellationToken = default) =>
        operations.UploadAsync(MapUpload(file), cancellationToken);

    public async Task<IEnumerable<Guid>> UploadManyAsync(
        IReadOnlyCollection<FileUpload> files,
        CancellationToken cancellationToken = default) =>
        await operations.UploadManyAsync(files.Select(MapUpload).ToArray(), cancellationToken).ConfigureAwait(false);

    public Task UploadImageAsync(FileUpload image, CancellationToken cancellationToken = default) =>
        operations.UploadImageAsync(MapUpload(image), cancellationToken);

    public async Task<(Stream? stream, string contentType, string fileName)> DownloadAsync(
        string storedFileName,
        CancellationToken cancellationToken = default)
    {
        var result = await operations.DownloadAsync(storedFileName, cancellationToken).ConfigureAwait(false);
        return (result.Stream, result.ContentType, result.FileName);
    }

    public async Task<(Stream? stream, string contentType, string fileName)> StreamAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await operations.StreamAsync(id, cancellationToken).ConfigureAwait(false);
        return (result.Stream, result.ContentType, result.FileName);
    }

    public Task<bool> DeleteAsync(string storedFileName, CancellationToken cancellationToken = default) =>
        operations.DeleteAsync(storedFileName, cancellationToken);

    private static PlatformFileUpload MapUpload(FileUpload file) =>
        new(file.FileName, file.ContentType, file.Length, file.OpenReadStream);

    private static UploadFileResponse MapResponse(PlatformFileMetadata file) =>
        new(
            file.Id.ToString(),
            file.FileName,
            file.StoredFileName,
            file.ContentType,
            file.FileExtension,
            file.CreatedOn,
            file.CreatedByPc,
            file.CreatedById,
            file.IsDeleted);
}
