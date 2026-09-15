using ErpSystem.Modules.Platform.Application.Features.Platform.Files.Contracts;
using ErpSystem.Modules.Platform.Application.Files;
using ErpSystem.Modules.Platform.Contracts.Files;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Platform.Application.Files.Settings;
using ErpSystem.Modules.Platform.Presentation.Common.Files;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.Files.V1;

[Route(ApiRoutes.BaseRoute)]
[ApiVersion("1.0")]
[ApiController]
[TenantMember]
[EnableRateLimiting("fileOperations")]
public class FilesController(
    ISender sender,
    IValidator<UploadFileRequest> uploadFileValidator,
    IValidator<UploadManyFilesRequest> uploadManyFilesValidator,
    IValidator<UploadImageRequest> uploadImageValidator) : ControllerBase
{
    private readonly ISender _sender = sender;
    private readonly IValidator<UploadFileRequest> _uploadFileValidator = uploadFileValidator;
    private readonly IValidator<UploadManyFilesRequest> _uploadManyFilesValidator = uploadManyFilesValidator;
    private readonly IValidator<UploadImageRequest> _uploadImageValidator = uploadImageValidator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var files = (await _sender.Send(new GetFilesQuery(), cancellationToken))
            .Select(MapResponse)
            .ToArray();
        return Ok(files);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        [FromForm] SingleFileUploadForm form,
        CancellationToken cancellationToken)
    {
        var request = new UploadFileRequest(form.File.ToFileUpload());
        await _uploadFileValidator.ValidateAndThrowAsync(request, cancellationToken);
        var storedFileName = await _sender.Send(
            new UploadFileCommand(MapUpload(request.File)),
            cancellationToken);

        return CreatedAtAction(nameof(Download), new { storedFileName = storedFileName }, null);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(FileSettings.MaxUploadRequestSizeInBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = FileSettings.MaxUploadRequestSizeInBytes)]
    public async Task<IActionResult> UploadMany(
        [FromForm] MultipleFilesUploadForm form,
        CancellationToken cancellationToken)
    {
        var request = new UploadManyFilesRequest(
            form.Files.Select(file => file.ToFileUpload()).ToArray());
        await _uploadManyFilesValidator.ValidateAndThrowAsync(request, cancellationToken);
        var filesIds = await _sender.Send(
            new UploadManyFilesCommand(request.Files.Select(MapUpload).ToArray()),
            cancellationToken);

        return Ok(filesIds);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(
        [FromForm] ImageUploadForm form,
        CancellationToken cancellationToken)
    {
        var request = new UploadImageRequest(form.Image.ToFileUpload());
        await _uploadImageValidator.ValidateAndThrowAsync(request, cancellationToken);
        await _sender.Send(new UploadImageCommand(MapUpload(request.Image)), cancellationToken);

        return Created();
    }

    [HttpGet("{storedFilename}")]
    public async Task<IActionResult> Download([FromRoute] string storedFilename, CancellationToken cancellationToken)
    {
        var download = await _sender.Send(new DownloadFileQuery(storedFilename), cancellationToken);

        return download.Stream is null
            ? NotFound()
            : File(download.Stream, download.ContentType, download.FileName, enableRangeProcessing: true);
    }

    [HttpGet()]
    [Authorize]
    public IActionResult CheckAuthorization()
    {
        return Ok();
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Stream([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var download = await _sender.Send(new StreamFileQuery(id), cancellationToken);
        return download.Stream is null
            ? NotFound()
            : File(download.Stream, download.ContentType, enableRangeProcessing: true);
    }

    [HttpDelete("{storedFilename}")]
    public async Task<IActionResult> Delete([FromRoute] string storedFilename, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new DeleteFileCommand(storedFilename), cancellationToken);

        if (result)
        {
            return NoContent();
        }

        return NotFound();
    }

    private static PlatformFileUpload MapUpload(FileUpload file) =>
        new(file.FileName, file.ContentType, file.Length, file.OpenReadStream);

    private static UploadFileResponse MapResponse(PlatformFileMetadata file) =>
        new(
            file.Id.ToString(),
            file.FileName,
            file.StoredFileName,
            file.ContentType,
            file.FileExtension,
            file.CreatedOn,
            file.CreatedByPc,
            file.CreatedById,
            file.IsDeleted);
}
