namespace ErpSystem.Modules.HR.Application.Features.Platform.Files.Contracts
{
    public record UploadManyFilesRequest(
        IReadOnlyCollection<FileUpload> Files
    );
}
