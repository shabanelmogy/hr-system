namespace HrManagementSystem.Shared.Storage;

public static class ProtectedFileStorage
{
    private const string ProtectedRoot = "App_Data";
    private const string ProtectedFiles = "ProtectedFiles";

    public static string GetUploadsPath(IWebHostEnvironment environment) =>
        EnsureDirectory(Path.Combine(environment.ContentRootPath, ProtectedRoot, ProtectedFiles, "uploads"));

    public static string GetImagesPath(IWebHostEnvironment environment) =>
        EnsureDirectory(Path.Combine(environment.ContentRootPath, ProtectedRoot, ProtectedFiles, "images"));

    public static void MigrateLegacyFiles(IWebHostEnvironment environment)
    {
        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        MigrateDirectory(Path.Combine(webRoot, "uploads"), GetUploadsPath(environment));
        MigrateDirectory(Path.Combine(webRoot, "images"), GetImagesPath(environment));
    }

    private static void MigrateDirectory(string source, string destination)
    {
        if (!Directory.Exists(source))
            return;

        foreach (var sourceFile in Directory.EnumerateFiles(source, "*", SearchOption.TopDirectoryOnly))
        {
            var fileName = Path.GetFileName(sourceFile);
            var destinationFile = Path.Combine(destination, fileName);

            if (File.Exists(destinationFile))
            {
                if (FilesMatch(sourceFile, destinationFile))
                {
                    File.Delete(sourceFile);
                    continue;
                }

                throw new IOException($"Cannot migrate legacy file '{fileName}' because the protected destination already exists.");
            }

            File.Move(sourceFile, destinationFile);
        }
    }

    private static bool FilesMatch(string first, string second)
    {
        var firstInfo = new FileInfo(first);
        var secondInfo = new FileInfo(second);
        if (firstInfo.Length != secondInfo.Length)
            return false;

        using var firstStream = File.OpenRead(first);
        using var secondStream = File.OpenRead(second);
        return SHA256.HashData(firstStream).SequenceEqual(SHA256.HashData(secondStream));
    }

    private static string EnsureDirectory(string path)
    {
        var fullPath = Path.GetFullPath(path);
        Directory.CreateDirectory(fullPath);
        return fullPath;
    }
}
