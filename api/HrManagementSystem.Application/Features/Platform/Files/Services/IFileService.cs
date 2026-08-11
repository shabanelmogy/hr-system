using HrManagementSystem.Application.Features.Platform.Files.Contracts;

namespace HrManagementSystem.Application.Features.Platform.Files.Services
{
    public interface IFileService
    {
        Task<IEnumerable<UploadFileResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<string> UploadAsync(FileUpload file, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string storedFilename, CancellationToken cancellationToken = default);
        Task<IEnumerable<Guid>> UploadManyAsync(IReadOnlyCollection<FileUpload> files, CancellationToken cancellationToken = default);
        Task UploadImageAsync(FileUpload image, CancellationToken cancellationToken = default);
        Task<(Stream? stream, string contentType, string fileName)> DownloadAsync(string storedFileName, CancellationToken cancellationToken = default);
        Task<(Stream? stream, string contentType, string fileName)> StreamAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
