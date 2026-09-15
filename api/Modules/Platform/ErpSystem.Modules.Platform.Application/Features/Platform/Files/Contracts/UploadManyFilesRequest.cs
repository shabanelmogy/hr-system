namespace ErpSystem.Modules.Platform.Application.Features.Platform.Files.Contracts
{
    public record UploadManyFilesRequest(
        IReadOnlyCollection<FileUpload> Files
    );
}
