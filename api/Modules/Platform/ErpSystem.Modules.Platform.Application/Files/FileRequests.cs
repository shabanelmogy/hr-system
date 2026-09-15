using ErpSystem.Modules.Platform.Contracts.Files;

namespace ErpSystem.Modules.Platform.Application.Files;

public sealed record GetFilesQuery : IQuery<IReadOnlyList<PlatformFileMetadata>>;
public sealed record UploadFileCommand(PlatformFileUpload File) : ICommand<string>;
public sealed record UploadManyFilesCommand(IReadOnlyCollection<PlatformFileUpload> Files)
    : ICommand<IReadOnlyList<Guid>>;
public sealed record UploadImageCommand(PlatformFileUpload Image) : ICommand;
public sealed record DownloadFileQuery(string StoredFileName) : IQuery<PlatformFileDownload>;
public sealed record StreamFileQuery(Guid Id) : IQuery<PlatformFileDownload>;
public sealed record DeleteFileCommand(string StoredFileName) : ICommand<bool>;

public sealed class GetFilesQueryHandler(IFileMetadataStore metadataStore)
    : IQueryHandler<GetFilesQuery, IReadOnlyList<PlatformFileMetadata>>
{
    public Task<IReadOnlyList<PlatformFileMetadata>> Handle(
        GetFilesQuery query,
        CancellationToken cancellationToken) =>
        metadataStore.GetAllAsync(cancellationToken);
}

public sealed class UploadFileCommandHandler(
    IFileMetadataStore metadataStore,
    IFileBinaryStore binaryStore,
    IFileChangePublisher changes,
    IFileStoragePolicy storagePolicy,
    IFileUploadInspectionService uploadInspection)
    : ICommandHandler<UploadFileCommand, string>
{
    public async Task<string> Handle(UploadFileCommand command, CancellationToken cancellationToken)
    {
        await uploadInspection.InspectAsync(command.File, cancellationToken).ConfigureAwait(false);
        var storedFileName = storagePolicy.CreateStoredFileName();
        await binaryStore.WriteFileAsync(storedFileName, command.File, cancellationToken).ConfigureAwait(false);

        PlatformFileMetadata persisted;
        try
        {
            persisted = await metadataStore.AddAsync(
                FileRequestMapping.CreateDraft(storagePolicy, command.File, storedFileName),
                cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            await binaryStore.DeleteFileAsync(storedFileName, CancellationToken.None).ConfigureAwait(false);
            throw;
        }

        FileRequestMapping.Publish(changes, "Create", persisted, persisted.Id.ToString());
        return persisted.StoredFileName;
    }
}

public sealed class UploadManyFilesCommandHandler(
    IFileMetadataStore metadataStore,
    IFileBinaryStore binaryStore,
    IFileChangePublisher changes,
    IFileStoragePolicy storagePolicy,
    IFileUploadInspectionService uploadInspection)
    : ICommandHandler<UploadManyFilesCommand, IReadOnlyList<Guid>>
{
    public async Task<IReadOnlyList<Guid>> Handle(
        UploadManyFilesCommand command,
        CancellationToken cancellationToken)
    {
        var batch = command.Files as PlatformFileUpload[] ?? command.Files.ToArray();
        var drafts = new List<PlatformFileMetadataDraft>(batch.Length);
        var writtenNames = new List<string>(batch.Length);

        try
        {
            foreach (var file in batch)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await uploadInspection.InspectAsync(file, cancellationToken).ConfigureAwait(false);
            }

            foreach (var file in batch)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var storedFileName = storagePolicy.CreateStoredFileName();
                await binaryStore.WriteFileAsync(storedFileName, file, cancellationToken).ConfigureAwait(false);
                writtenNames.Add(storedFileName);
                drafts.Add(FileRequestMapping.CreateDraft(storagePolicy, file, storedFileName));
            }

            var persisted = await metadataStore.AddRangeAsync(drafts, cancellationToken).ConfigureAwait(false);
            if (persisted.Count > 0)
                FileRequestMapping.Publish(changes, "BulkCreate", persisted[0], entityId: null);

            return persisted.Select(file => file.Id).ToArray();
        }
        catch
        {
            foreach (var storedFileName in writtenNames)
                await binaryStore.DeleteFileAsync(storedFileName, CancellationToken.None).ConfigureAwait(false);
            throw;
        }
    }
}

public sealed class UploadImageCommandHandler(
    IFileBinaryStore binaryStore,
    IFileStoragePolicy storagePolicy,
    IFileUploadInspectionService uploadInspection)
    : ICommandHandler<UploadImageCommand>
{
    public async Task Handle(UploadImageCommand command, CancellationToken cancellationToken)
    {
        await uploadInspection.InspectAsync(command.Image, cancellationToken).ConfigureAwait(false);
        var storedFileName = storagePolicy.CreateStoredImageName(command.Image.FileName);
        await binaryStore.WriteImageAsync(storedFileName, command.Image, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class DownloadFileQueryHandler(
    IFileMetadataStore metadataStore,
    IFileBinaryStore binaryStore)
    : IQueryHandler<DownloadFileQuery, PlatformFileDownload>
{
    public async Task<PlatformFileDownload> Handle(
        DownloadFileQuery query,
        CancellationToken cancellationToken)
    {
        var metadata = await metadataStore
            .FindByStoredFileNameAsync(query.StoredFileName, cancellationToken)
            .ConfigureAwait(false);
        return metadata is null
            ? PlatformFileDownload.Missing
            : await FileRequestMapping.OpenAsync(binaryStore, metadata, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class StreamFileQueryHandler(
    IFileMetadataStore metadataStore,
    IFileBinaryStore binaryStore)
    : IQueryHandler<StreamFileQuery, PlatformFileDownload>
{
    public async Task<PlatformFileDownload> Handle(
        StreamFileQuery query,
        CancellationToken cancellationToken)
    {
        var metadata = await metadataStore.FindByIdAsync(query.Id, cancellationToken).ConfigureAwait(false);
        return metadata is null
            ? PlatformFileDownload.Missing
            : await FileRequestMapping.OpenAsync(binaryStore, metadata, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class DeleteFileCommandHandler(
    IFileMetadataStore metadataStore,
    IFileBinaryStore binaryStore,
    IFileChangePublisher changes)
    : ICommandHandler<DeleteFileCommand, bool>
{
    public async Task<bool> Handle(DeleteFileCommand command, CancellationToken cancellationToken)
    {
        var removed = await metadataStore
            .RemoveByStoredFileNameAsync(command.StoredFileName, cancellationToken)
            .ConfigureAwait(false);
        if (removed is null)
            return false;

        await binaryStore.DeleteFileAsync(removed.StoredFileName, cancellationToken).ConfigureAwait(false);
        FileRequestMapping.Publish(changes, "Delete", removed, removed.Id.ToString());
        return true;
    }
}

internal static class FileRequestMapping
{
    public static PlatformFileMetadataDraft CreateDraft(
        IFileStoragePolicy storagePolicy,
        PlatformFileUpload file,
        string storedFileName) =>
        new(
            storagePolicy.NormalizeClientFileName(file.FileName),
            storedFileName,
            file.ContentType,
            storagePolicy.GetNormalizedExtension(file.FileName));

    public static async Task<PlatformFileDownload> OpenAsync(
        IFileBinaryStore binaryStore,
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

    public static void Publish(
        IFileChangePublisher changes,
        string action,
        PlatformFileMetadata file,
        string? entityId)
    {
        if (string.IsNullOrWhiteSpace(file.TenantId) || file.CompanyId <= 0)
            throw new InvalidOperationException("A tenant and company are required for file realtime updates.");

        changes.Publish(new PlatformFileChange(file.TenantId, file.CompanyId, action, entityId));
    }
}
