namespace HrManagementSystem.Application.Features.Platform.Files.Contracts
{
    public record UploadManyFilesRequest(
        IReadOnlyCollection<FileUpload> Files
    );
}
