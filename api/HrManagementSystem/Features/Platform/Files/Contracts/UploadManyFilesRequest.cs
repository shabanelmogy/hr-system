namespace HrManagementSystem.Features.Platform.Files.Contracts
{
    public record UploadManyFilesRequest(
        IFormFileCollection Files
    );
}