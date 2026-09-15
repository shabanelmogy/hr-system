using ErpSystem.Modules.Platform.Contracts.Files.Models;

namespace ErpSystem.Modules.Platform.Presentation.Common.Files;

public static class FormFileExtensions
{
    public static FileUpload ToFileUpload(this IFormFile file)
    {
        ArgumentNullException.ThrowIfNull(file);
        return new FileUpload(file.FileName, file.ContentType, file.Length, file.OpenReadStream);
    }
}
