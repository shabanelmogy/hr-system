using HrManagementSystem.Application.Features.Platform.Files.Services;
using HrManagementSystem.Application.Features.Platform.Files.Contracts;
using HrManagementSystem.Application.Common.Files;
using HrManagementSystem.Domain.Platform.Files.Entities;
using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Features.Platform.Files.Services;

public class FileService(
    IWebHostEnvironment webHostEnvironment,
    ApplicationDbContext context,
    IRealtimeChangeDispatcher realtimeChanges) : IFileService
{
    private readonly string _filesPath = ProtectedFileStorage.GetUploadsPath(webHostEnvironment);
    private readonly string _imagesPath = ProtectedFileStorage.GetImagesPath(webHostEnvironment);
    private readonly ApplicationDbContext _context = context;

    public async Task<IEnumerable<UploadFileResponse>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Files
            .Where(file => !file.IsDeleted)
            .AsNoTracking()
            .ProjectToType<UploadFileResponse>()
            .ToListAsync(cancellationToken);

    public async Task<string> UploadAsync(FileUpload file, CancellationToken cancellationToken = default)
    {
        var uploadedFile = await SaveFile(file, cancellationToken);

        try
        {
            await _context.AddAsync(uploadedFile, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            DeletePhysicalFile(uploadedFile.StoredFileName);
            throw;
        }

        DispatchChange("Create", uploadedFile, uploadedFile.Id.ToString());

        return uploadedFile.StoredFileName;
    }

    public async Task<IEnumerable<Guid>> UploadManyAsync(
        IReadOnlyCollection<FileUpload> files,
        CancellationToken cancellationToken = default)
    {
        List<UploadedFile> uploadedFiles = [];

        try
        {
            foreach (var file in files)
            {
                cancellationToken.ThrowIfCancellationRequested();
                uploadedFiles.Add(await SaveFile(file, cancellationToken));
            }

            await _context.AddRangeAsync(uploadedFiles, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            foreach (var uploadedFile in uploadedFiles)
                DeletePhysicalFile(uploadedFile.StoredFileName);

            throw;
        }

        if (uploadedFiles.Count > 0)
            DispatchChange("BulkCreate", uploadedFiles[0], entityId: null);

        return uploadedFiles.Select(file => file.Id).ToList();
    }

    public async Task UploadImageAsync(FileUpload image, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var path = GetSafePath(_imagesPath, storedFileName);

        await using var input = image.OpenReadStream();
        await using var stream = CreateWriteStream(path);
        await input.CopyToAsync(stream, cancellationToken);
    }

    public async Task<(Stream? stream, string contentType, string fileName)> DownloadAsync(
        string storedFilename,
        CancellationToken cancellationToken = default)
    {
        var file = await _context.Files
            .AsNoTracking()
            .FirstOrDefaultAsync(
                candidate => candidate.StoredFileName == storedFilename && !candidate.IsDeleted,
                cancellationToken);

        if (file is null)
            return (null, string.Empty, string.Empty);

        var path = GetSafePath(_filesPath, file.StoredFileName);
        return File.Exists(path)
            ? (CreateReadStream(path), file.ContentType, file.FileName)
            : (null, string.Empty, string.Empty);
    }

    public async Task<(Stream? stream, string contentType, string fileName)> StreamAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var file = await _context.Files
            .AsNoTracking()
            .FirstOrDefaultAsync(candidate => candidate.Id == id && !candidate.IsDeleted, cancellationToken);
        if (file is null)
            return (null, string.Empty, string.Empty);

        var path = GetSafePath(_filesPath, file.StoredFileName);
        return File.Exists(path)
            ? (CreateReadStream(path), file.ContentType, file.FileName)
            : (null, string.Empty, string.Empty);
    }

    public async Task<bool> DeleteAsync(
        string storedFilename,
        CancellationToken cancellationToken = default)
    {
        var file = await _context.Files.FirstOrDefaultAsync(
            candidate => candidate.StoredFileName == storedFilename && !candidate.IsDeleted,
            cancellationToken);

        if (file is null)
            return false;

        _context.Files.Remove(file);
        await _context.SaveChangesAsync(cancellationToken);
        DeletePhysicalFile(file.StoredFileName);
        DispatchChange("Delete", file, file.Id.ToString());
        return true;
    }

    private void DispatchChange(
        string action,
        UploadedFile file,
        string? entityId)
    {
        if (string.IsNullOrWhiteSpace(file.TenantId) || file.CompanyId <= 0)
            throw new InvalidOperationException("A tenant and company are required for file realtime updates.");

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<UploadedFile>(
            RealtimeAudience.ForCompany(file.TenantId, file.CompanyId),
            action,
            entityId));
    }

    private async Task<UploadedFile> SaveFile(
        FileUpload file,
        CancellationToken cancellationToken = default)
    {
        var randomFileName = Path.GetRandomFileName();
        var uploadedFile = new UploadedFile
        {
            FileName = Path.GetFileName(file.FileName),
            ContentType = file.ContentType,
            StoredFileName = randomFileName,
            FileExtension = Path.GetExtension(file.FileName).ToLowerInvariant()
        };

        var path = GetSafePath(_filesPath, randomFileName);
        await using var input = file.OpenReadStream();
        await using var stream = CreateWriteStream(path);
        await input.CopyToAsync(stream, cancellationToken);
        return uploadedFile;
    }

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

    private static string GetSafePath(string root, string storedFileName)
    {
        if (string.IsNullOrWhiteSpace(storedFileName) || Path.GetFileName(storedFileName) != storedFileName)
            throw new InvalidOperationException("Invalid stored file name.");

        var fullRoot = Path.GetFullPath(root) + Path.DirectorySeparatorChar;
        var fullPath = Path.GetFullPath(Path.Combine(root, storedFileName));
        if (!fullPath.StartsWith(fullRoot, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("The file path is outside the protected storage root.");

        return fullPath;
    }

    private void DeletePhysicalFile(string storedFileName)
    {
        var path = GetSafePath(_filesPath, storedFileName);
        if (File.Exists(path))
            File.Delete(path);
    }
}
