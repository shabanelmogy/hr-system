namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Files.Storage;

public static class PlatformFileStoragePaths
{
    private const string ProtectedRoot = "App_Data";
    private const string ProtectedFiles = "ProtectedFiles";

    public static string GetUploadsPath(IWebHostEnvironment environment) =>
        EnsureDirectory(Path.Combine(environment.ContentRootPath, ProtectedRoot, ProtectedFiles, "uploads"));

    public static string GetImagesPath(IWebHostEnvironment environment) =>
        EnsureDirectory(Path.Combine(environment.ContentRootPath, ProtectedRoot, ProtectedFiles, "images"));

    private static string EnsureDirectory(string path)
    {
        var fullPath = Path.GetFullPath(path);
        Directory.CreateDirectory(fullPath);
        return fullPath;
    }
}
