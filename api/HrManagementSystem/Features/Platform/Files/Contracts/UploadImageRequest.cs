namespace HrManagementSystem.Features.Platform.Files.Contracts
{
    public record UploadImageRequest(
        IFormFile Image
    );
}