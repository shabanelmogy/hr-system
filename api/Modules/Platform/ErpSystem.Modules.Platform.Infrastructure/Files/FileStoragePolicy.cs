using ErpSystem.Modules.Platform.Application.Files;

namespace ErpSystem.Modules.Platform.Infrastructure.Files;

public sealed class FileStoragePolicy : IFileStoragePolicy
{
    public string NormalizeClientFileName(string fileName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fileName);
        return Path.GetFileName(fileName);
    }

    public string GetNormalizedExtension(string fileName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fileName);
        return Path.GetExtension(fileName).ToLowerInvariant();
    }

    public string CreateStoredFileName() => Path.GetRandomFileName();

    public string CreateStoredImageName(string fileName) =>
        $"{Guid.NewGuid():N}{GetNormalizedExtension(fileName)}";

    public string ResolveStoredFilePath(string root, string storedFileName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(root);
        ArgumentException.ThrowIfNullOrWhiteSpace(storedFileName);

        if (!string.Equals(Path.GetFileName(storedFileName), storedFileName, StringComparison.Ordinal))
            throw new InvalidOperationException("Invalid stored file name.");

        var fullRoot = Path.GetFullPath(root) + Path.DirectorySeparatorChar;
        var fullPath = Path.GetFullPath(Path.Combine(root, storedFileName));
        if (!fullPath.StartsWith(fullRoot, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("The file path is outside the protected storage root.");

        return fullPath;
    }
}
