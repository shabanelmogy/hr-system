namespace HrManagementSystem.Api.Common.Files;

public sealed class ProfilePictureUploadForm
{
    public IFormFile? ProfilePicture { get; init; }
    public bool Remove { get; init; }
}

public sealed class SingleFileUploadForm
{
    public IFormFile File { get; init; } = default!;
}

public sealed class MultipleFilesUploadForm
{
    public IReadOnlyCollection<IFormFile> Files { get; init; } = [];
}

public sealed class ImageUploadForm
{
    public IFormFile Image { get; init; } = default!;
}
