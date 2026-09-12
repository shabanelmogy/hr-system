using ErpSystem.Modules.Platform.Contracts.Files;

namespace ErpSystem.Modules.Platform.Application.Files;

internal sealed class FileOperationsService(
    IFileMetadataStore metadataStore,
    IFileBinaryStore binaryStore,
    IFileChangePublisher changes,
    IFileStoragePolicy storagePolicy) : IFileOperationsService
{
    public Task<IReadOnlyList<PlatformFileMetadata>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        metadataStore.GetAllAsync(cancellationToken);

    public async Task<string> UploadAsync(
        PlatformFileUpload file,
        CancellationToken cancellationToken = default)
    {
        var storedFileName = storagePolicy.CreateStoredFileName();
        await binaryStore.WriteFileAsync(storedFileName, file, cancellationToken).ConfigureAwait(false);

        PlatformFileMetadata persisted;
        try
        {
            persisted = await metadataStore.AddAsync(
                CreateDraft(file, storedFileName),
                cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            await binaryStore.DeleteFileAsync(storedFileName, CancellationToken.None).ConfigureAwait(false);
            throw;
        }

        Publish("Create", persisted, persisted.Id.ToString());
        return persisted.StoredFileName;
    }

    public async Task<IReadOnlyList<Guid>> UploadManyAsync(
        IReadOnlyCollection<PlatformFileUpload> files,
        CancellationToken cancellationToken = default)
    {
        var drafts = new List<PlatformFileMetadataDraft>(files.Count);
        var writtenNames = new List<string>(files.Count);

        try
        {
            foreach (var file in files)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var storedFileName = storagePolicy.CreateStoredFileName();
                await binaryStore.WriteFileAsync(storedFileName, file, cancellationToken).ConfigureAwait(false);
                writtenNames.Add(storedFileName);
                drafts.Add(CreateDraft(file, storedFileName));
            }

            var persisted = await metadataStore.AddRangeAsync(drafts, cancellationToken).ConfigureAwait(false);
            if (persisted.Count > 0)
                Publish("BulkCreate", persisted[0], entityId: null);

            return persisted.Select(file => file.Id).ToArray();
        }
        catch
        {
            foreach (var storedFileName in writtenNames)
                await binaryStore.DeleteFileAsync(storedFileName, CancellationToken.None).ConfigureAwait(false);
            throw;
        }
    }

    public async Task UploadImageAsync(
        PlatformFileUpload image,
        CancellationToken cancellationToken = default)
    {
        var storedFileName = storagePolicy.CreateStoredImageName(image.FileName);
        await binaryStore.WriteImageAsync(storedFileName, image, cancellationToken).ConfigureAwait(false);
    }

    public async Task<PlatformFileDownload> DownloadAsync(
        string storedFileName,
        CancellationToken cancellationToken = default)
    {
        var metadata = await metadataStore
            .FindByStoredFileNameAsync(storedFileName, cancellationToken)
            .ConfigureAwait(false);
        return metadata is null
            ? PlatformFileDownload.Missing
            : await OpenAsync(metadata, cancellationToken).ConfigureAwait(false);
    }

    public async Task<PlatformFileDownload> StreamAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var metadata = await metadataStore.FindByIdAsync(id, cancellationToken).ConfigureAwait(false);
        return metadata is null
            ? PlatformFileDownload.Missing
            : await OpenAsync(metadata, cancellationToken).ConfigureAwait(false);
    }

    public async Task<bool> DeleteAsync(
        string storedFileName,
        CancellationToken cancellationToken = default)
    {
        var removed = await metadataStore
            .RemoveByStoredFileNameAsync(storedFileName, cancellationToken)
            .ConfigureAwait(false);
        if (removed is null)
            return false;

        await binaryStore.DeleteFileAsync(removed.StoredFileName, cancellationToken).ConfigureAwait(false);
        Publish("Delete", removed, removed.Id.ToString());
        return true;
    }

    private PlatformFileMetadataDraft CreateDraft(PlatformFileUpload file, string storedFileName) =>
        new(
            storagePolicy.NormalizeClientFileName(file.FileName),
            storedFileName,
            file.ContentType,
            storagePolicy.GetNormalizedExtension(file.FileName));

    private async Task<PlatformFileDownload> OpenAsync(
        PlatformFileMetadata metadata,
        CancellationToken cancellationToken)
    {
        var stream = await binaryStore
            .OpenFileReadAsync(metadata.StoredFileName, cancellationToken)
            .ConfigureAwait(false);
        return stream is null
            ? PlatformFileDownload.Missing
            : new PlatformFileDownload(stream, metadata.ContentType, metadata.FileName);
    }

    private void Publish(string action, PlatformFileMetadata file, string? entityId)
    {
        if (string.IsNullOrWhiteSpace(file.TenantId) || file.CompanyId <= 0)
            throw new InvalidOperationException("A tenant and company are required for file realtime updates.");

        changes.Publish(new PlatformFileChange(file.TenantId, file.CompanyId, action, entityId));
    }
}
