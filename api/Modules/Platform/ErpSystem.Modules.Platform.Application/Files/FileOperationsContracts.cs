using ErpSystem.Modules.Platform.Contracts.Files;

namespace ErpSystem.Modules.Platform.Application.Files;

public sealed record PlatformFileMetadataDraft(
    string FileName,
    string StoredFileName,
    string ContentType,
    string FileExtension);

public sealed record PlatformFileMetadata(
    Guid Id,
    string FileName,
    string StoredFileName,
    string ContentType,
    string FileExtension,
    DateTime CreatedOn,
    string CreatedByPc,
    string CreatedById,
    bool IsDeleted,
    string TenantId,
    int CompanyId);

public sealed record PlatformFileDownload(
    Stream? Stream,
    string ContentType,
    string FileName)
{
    public static PlatformFileDownload Missing { get; } = new(null, string.Empty, string.Empty);
}

public sealed record PlatformFileChange(
    string TenantId,
    int CompanyId,
    string Action,
    string? EntityId);

public interface IFileMetadataStore
{
    Task<IReadOnlyList<PlatformFileMetadata>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PlatformFileMetadata?> FindByStoredFileNameAsync(
        string storedFileName,
        CancellationToken cancellationToken = default);
    Task<PlatformFileMetadata?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PlatformFileMetadata> AddAsync(
        PlatformFileMetadataDraft draft,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PlatformFileMetadata>> AddRangeAsync(
        IReadOnlyCollection<PlatformFileMetadataDraft> drafts,
        CancellationToken cancellationToken = default);
    Task<PlatformFileMetadata?> RemoveByStoredFileNameAsync(
        string storedFileName,
        CancellationToken cancellationToken = default);
}

public interface IFileBinaryStore
{
    Task WriteFileAsync(
        string storedFileName,
        PlatformFileUpload upload,
        CancellationToken cancellationToken = default);
    Task WriteImageAsync(
        string storedFileName,
        PlatformFileUpload upload,
        CancellationToken cancellationToken = default);
    Task<Stream?> OpenFileReadAsync(
        string storedFileName,
        CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string storedFileName, CancellationToken cancellationToken = default);
}

public interface IFileChangePublisher
{
    void Publish(PlatformFileChange change);
}
