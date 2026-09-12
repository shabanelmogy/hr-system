using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Domain.Platform.Files.Entities;
using ErpSystem.Modules.Platform.Contracts.Files;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.Files.Persistence;

/// <summary>
/// Physical compatibility adapter for the historical hr.UploadedFile table,
/// protected filesystem layout, and HR realtime transport.
/// </summary>
public sealed class LegacyFileOperationsAdapter(
    IWebHostEnvironment environment,
    ApplicationDbContext context,
    IRealtimeChangeDispatcher realtimeChanges,
    IFileStoragePolicy storagePolicy) :
    IFileMetadataStore,
    IFileBinaryStore,
    IFileChangePublisher
{
    private readonly string _filesPath = ProtectedFileStorage.GetUploadsPath(environment);
    private readonly string _imagesPath = ProtectedFileStorage.GetImagesPath(environment);

    public async Task<IReadOnlyList<PlatformFileMetadata>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        await context.Files
            .Where(file => !file.IsDeleted)
            .AsNoTracking()
            .Select(file => new PlatformFileMetadata(
                file.Id,
                file.FileName,
                file.StoredFileName,
                file.ContentType,
                file.FileExtension,
                file.CreatedOn,
                file.CreatedByPc,
                file.CreatedById,
                file.IsDeleted,
                file.TenantId,
                file.CompanyId))
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

    public async Task<PlatformFileMetadata?> FindByStoredFileNameAsync(
        string storedFileName,
        CancellationToken cancellationToken = default)
    {
        var file = await context.Files
            .AsNoTracking()
            .FirstOrDefaultAsync(
                candidate => candidate.StoredFileName == storedFileName && !candidate.IsDeleted,
                cancellationToken)
            .ConfigureAwait(false);
        return file is null ? null : Map(file);
    }

    public async Task<PlatformFileMetadata?> FindByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var file = await context.Files
            .AsNoTracking()
            .FirstOrDefaultAsync(candidate => candidate.Id == id && !candidate.IsDeleted, cancellationToken)
            .ConfigureAwait(false);
        return file is null ? null : Map(file);
    }

    public async Task<PlatformFileMetadata> AddAsync(
        PlatformFileMetadataDraft draft,
        CancellationToken cancellationToken = default)
    {
        var entity = CreateEntity(draft);
        await context.Files.AddAsync(entity, cancellationToken).ConfigureAwait(false);
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return Map(entity);
    }

    public async Task<IReadOnlyList<PlatformFileMetadata>> AddRangeAsync(
        IReadOnlyCollection<PlatformFileMetadataDraft> drafts,
        CancellationToken cancellationToken = default)
    {
        var entities = drafts.Select(CreateEntity).ToArray();
        await context.Files.AddRangeAsync(entities, cancellationToken).ConfigureAwait(false);
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return entities.Select(Map).ToArray();
    }

    public async Task<PlatformFileMetadata?> RemoveByStoredFileNameAsync(
        string storedFileName,
        CancellationToken cancellationToken = default)
    {
        var file = await context.Files.FirstOrDefaultAsync(
            candidate => candidate.StoredFileName == storedFileName && !candidate.IsDeleted,
            cancellationToken).ConfigureAwait(false);
        if (file is null)
            return null;

        context.Files.Remove(file);
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return Map(file);
    }

    public async Task WriteFileAsync(
        string storedFileName,
        PlatformFileUpload upload,
        CancellationToken cancellationToken = default) =>
        await WriteAsync(_filesPath, storedFileName, upload, cancellationToken).ConfigureAwait(false);

    public async Task WriteImageAsync(
        string storedFileName,
        PlatformFileUpload upload,
        CancellationToken cancellationToken = default) =>
        await WriteAsync(_imagesPath, storedFileName, upload, cancellationToken).ConfigureAwait(false);

    public Task<Stream?> OpenFileReadAsync(
        string storedFileName,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var path = storagePolicy.ResolveStoredFilePath(_filesPath, storedFileName);
        Stream? stream = File.Exists(path) ? CreateReadStream(path) : null;
        return Task.FromResult(stream);
    }

    public Task DeleteFileAsync(
        string storedFileName,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var path = storagePolicy.ResolveStoredFilePath(_filesPath, storedFileName);
        if (File.Exists(path))
            File.Delete(path);
        return Task.CompletedTask;
    }

    public void Publish(PlatformFileChange change)
    {
        realtimeChanges.Dispatch(RealtimeChangeRequest.For<UploadedFile>(
            RealtimeAudience.ForCompany(change.TenantId, change.CompanyId),
            change.Action,
            change.EntityId));
    }

    private async Task WriteAsync(
        string root,
        string storedFileName,
        PlatformFileUpload upload,
        CancellationToken cancellationToken)
    {
        var path = storagePolicy.ResolveStoredFilePath(root, storedFileName);
        await using var input = upload.OpenReadStream();
        await using var output = CreateWriteStream(path);
        await input.CopyToAsync(output, cancellationToken).ConfigureAwait(false);
    }

    private static UploadedFile CreateEntity(PlatformFileMetadataDraft draft) => new()
    {
        FileName = draft.FileName,
        StoredFileName = draft.StoredFileName,
        ContentType = draft.ContentType,
        FileExtension = draft.FileExtension
    };

    private static PlatformFileMetadata Map(UploadedFile file) =>
        new(
            file.Id,
            file.FileName,
            file.StoredFileName,
            file.ContentType,
            file.FileExtension,
            file.CreatedOn,
            file.CreatedByPc,
            file.CreatedById,
            file.IsDeleted,
            file.TenantId,
            file.CompanyId);

    private static FileStream CreateReadStream(string path) => new(
        path,
        FileMode.Open,
        FileAccess.Read,
        FileShare.Read,
        bufferSize: 64 * 1024,
        FileOptions.Asynchronous | FileOptions.SequentialScan);

    private static FileStream CreateWriteStream(string path) => new(
        path,
        FileMode.CreateNew,
        FileAccess.Write,
        FileShare.None,
        bufferSize: 64 * 1024,
        FileOptions.Asynchronous | FileOptions.SequentialScan);
}
