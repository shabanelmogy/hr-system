namespace ErpSystem.Modules.Platform.Contracts.Files;

public interface IFileStoragePolicy
{
    string NormalizeClientFileName(string fileName);
    string GetNormalizedExtension(string fileName);
    string CreateStoredFileName();
    string CreateStoredImageName(string fileName);
    string ResolveStoredFilePath(string root, string storedFileName);
}
