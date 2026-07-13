namespace HrManagementSystem.Features.Platform.Files.Services;

public class FileService(IWebHostEnvironment webHostEnvironment, ApplicationDbContext context) : IFileService
{
    private readonly string _filesPath = $"{webHostEnvironment.WebRootPath}/uploads";
    private readonly string _imagesPath = $"{webHostEnvironment.WebRootPath}/images";
    private readonly ApplicationDbContext _context = context;

    public async Task<IEnumerable<UploadFileResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var files = await _context.Files
                                 .AsNoTracking()
                                 .ProjectToType<UploadFileResponse>()
                                 .ToListAsync(cancellationToken);

        return files;
    }

    public async Task<string> UploadAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        var uploadedFile = await SaveFile(file, cancellationToken);

        await _context.AddAsync(uploadedFile, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return uploadedFile.StoredFileName;
    }

    public async Task<IEnumerable<Guid>> UploadManyAsync(IFormFileCollection files, CancellationToken cancellationToken = default)
    {
        List<UploadedFile> uploadedFiles = [];

        foreach (var file in files)
        {
            var uploadedFile = await SaveFile(file, cancellationToken);
            uploadedFiles.Add(uploadedFile);
        }

        await _context.AddRangeAsync(uploadedFiles, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return uploadedFiles.Select(x => x.Id).ToList();
    }

    public async Task UploadImageAsync(IFormFile image, CancellationToken cancellationToken = default)
    {
        var path = Path.Combine(_imagesPath, image.FileName);

        using var stream = File.Create(path);
        await image.CopyToAsync(stream, cancellationToken);
    }

        public async Task<(byte[] fileContent, string contentType, string fileName)> DownloadAsync(
    string storedFilename,
    CancellationToken cancellationToken = default)
        {
            var file = await _context.Files
                .FirstOrDefaultAsync(x => x.StoredFileName == storedFilename, cancellationToken);

            if (file is null)
                return ([], string.Empty, string.Empty);

        var path = Path.Combine(_filesPath, file.StoredFileName);

            var memoryStream = new MemoryStream();
            using (var stream = new FileStream(path, FileMode.Open))
            {
                await stream.CopyToAsync(memoryStream);
            }

            memoryStream.Position = 0;

            return (memoryStream.ToArray(), file.ContentType, file.FileName);
        }

    public async Task<(FileStream? stream, string contentType, string fileName)> StreamAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var file = await _context.Files.FindAsync(id);

        if (file is null)
            return (null, string.Empty, string.Empty);

        var path = Path.Combine(_filesPath, file.StoredFileName);

        var fileStream = File.OpenRead(path);

        return (fileStream, file.ContentType, file.FileName);
    }

    private async Task<UploadedFile> SaveFile(IFormFile file, CancellationToken cancellationToken = default)
    {
        var randomFileName = Path.GetRandomFileName();

        var uploadedFile = new UploadedFile
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            StoredFileName = randomFileName,
            FileExtension = Path.GetExtension(file.FileName)
        };

        var path = Path.Combine(_filesPath, randomFileName);

        using var stream = File.Create(path);
        await file.CopyToAsync(stream, cancellationToken);

        return uploadedFile;
    }

    public async Task<bool> DeleteAsync(string storedFilename, CancellationToken cancellationToken = default)
    {
        // Find the file in the database
        var file = await _context.Files.FirstOrDefaultAsync(x => x.StoredFileName == storedFilename);

        if (file is null)
            return false; // Return false if the file is not found

        // Delete the file from the file system
        var filePath = Path.Combine(_filesPath, file.StoredFileName);

        if (File.Exists(filePath))
        {
            File.Delete(filePath); // Delete the file from disk
        }

        // Remove the file from the database
        _context.Files.Remove(file);

        // Save the changes to the database
        await _context.SaveChangesAsync(cancellationToken);

        return true; // Return true if the file was successfully deleted
    }

}