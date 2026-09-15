namespace ErpSystem.Modules.Platform.Application.Files;

public interface IFileStoragePolicy
{
    string CreateStoredFileName();
    string CreateStoredImageName(string originalFileName);
    string NormalizeClientFileName(string fileName);
    string GetNormalizedExtension(string fileName);
    string ResolveStoredFilePath(string rootPath, string storedFileName);
}
