using HrManagementSystem.Features.Platform.Files.Contracts;

namespace HrManagementSystem.Features.Platform.Files.Services
{
    public interface IFileService
    {
        Task<IEnumerable<UploadFileResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<string> UploadAsync(IFormFile file, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string storedFilename, CancellationToken cancellationToken = default);
        Task<IEnumerable<Guid>> UploadManyAsync(IFormFileCollection files, CancellationToken cancellationToken = default);
        Task UploadImageAsync(IFormFile image, CancellationToken cancellationToken = default);
        Task<(FileStream? stream, string contentType, string fileName)> DownloadAsync(string storedFileName, CancellationToken cancellationToken = default);
        Task<(FileStream? stream, string contentType, string fileName)> StreamAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
