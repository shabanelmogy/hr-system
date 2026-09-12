using ErpSystem.Modules.HR.Application.Common.Files;

namespace ErpSystem.Modules.HR.Presentation.Common.Files;

public static class FormFileExtensions
{
    public static FileUpload ToFileUpload(this IFormFile file)
    {
        ArgumentNullException.ThrowIfNull(file);

        return new FileUpload(
            file.FileName,
            file.ContentType,
            file.Length,
            file.OpenReadStream);
    }
}
