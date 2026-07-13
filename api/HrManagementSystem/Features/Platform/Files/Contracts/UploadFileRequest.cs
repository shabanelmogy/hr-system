namespace HrManagementSystem.Features.Platform.Files.Contracts
{
    public record UploadFileRequest(
        IFormFile File
    );
}