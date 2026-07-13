namespace HrManagementSystem.Features.Platform.Files.Services;

public class FileService(IWebHostEnvironment webHostEnvironment, ApplicationDbContext context) : IFileService
{
    private readonly string _filesPath = ProtectedFileStorage.GetUploadsPath(webHostEnvironment);
    private readonly string _imagesPath = ProtectedFileStorage.GetImagesPath(webHostEnvironment);
    private readonly ApplicationDbContext _context = context;

    public async Task<IEnumerable<UploadFileResponse>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Files
            .AsNoTracking()
            .ProjectToType<UploadFileResponse>()
            .ToListAsync(cancellationToken);

    public async Task<string> UploadAsync(IFormFile file, CancellationToken cancellationToken = default)
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

        return uploadedFile.StoredFileName;
    }

    public async Task<IEnumerable<Guid>> UploadManyAsync(
        IFormFileCollection files,
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

        return uploadedFiles.Select(file => file.Id).ToList();
    }

    public async Task UploadImageAsync(IFormFile image, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var path = GetSafePath(_imagesPath, storedFileName);

        await using var stream = CreateWriteStream(path);
        await image.CopyToAsync(stream, cancellationToken);
    }

    public async Task<(FileStream? stream, string contentType, string fileName)> DownloadAsync(
        string storedFilename,
        CancellationToken cancellationToken = default)
    {
        var file = await _context.Files
            .AsNoTracking()
            .FirstOrDefaultAsync(candidate => candidate.StoredFileName == storedFilename, cancellationToken);

        if (file is null)
            return (null, string.Empty, string.Empty);

        var path = GetSafePath(_filesPath, file.StoredFileName);
        return File.Exists(path)
            ? (CreateReadStream(path), file.ContentType, file.FileName)
            : (null, string.Empty, string.Empty);
    }

    public async Task<(FileStream? stream, string contentType, string fileName)> StreamAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var file = await _context.Files.FindAsync([id], cancellationToken);
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
            candidate => candidate.StoredFileName == storedFilename,
            cancellationToken);

        if (file is null)
            return false;

        _context.Files.Remove(file);
        await _context.SaveChangesAsync(cancellationToken);
        DeletePhysicalFile(file.StoredFileName);
        return true;
    }

    private async Task<UploadedFile> SaveFile(
        IFormFile file,
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
        await using var stream = CreateWriteStream(path);
        await file.CopyToAsync(stream, cancellationToken);
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
