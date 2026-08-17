using HrManagementSystem.Application.Features.Platform.Files.Contracts;
using HrManagementSystem.Application.Features.Platform.Files.Services;
using HrManagementSystem.Application.Common.Settings;

namespace HrManagementSystem.Api.Features.Platform.Files.V1;

[Route(ApiRoutes.BaseRoute)]
[ApiVersion("1.0")]
[ApiController]
[TenantMember]
[EnableRateLimiting("fileOperations")]
public class FilesController(
    IFileService fileService,
    IValidator<UploadFileRequest> uploadFileValidator,
    IValidator<UploadManyFilesRequest> uploadManyFilesValidator,
    IValidator<UploadImageRequest> uploadImageValidator) : ControllerBase
{
    private readonly IFileService _fileService = fileService;
    private readonly IValidator<UploadFileRequest> _uploadFileValidator = uploadFileValidator;
    private readonly IValidator<UploadManyFilesRequest> _uploadManyFilesValidator = uploadManyFilesValidator;
    private readonly IValidator<UploadImageRequest> _uploadImageValidator = uploadImageValidator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var files = await _fileService.GetAllAsync(cancellationToken);
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
        var storedFileName = await _fileService.UploadAsync(request.File, cancellationToken);

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
        var filesIds = await _fileService.UploadManyAsync(request.Files, cancellationToken);

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
        await _fileService.UploadImageAsync(request.Image, cancellationToken);

        return Created();
    }

    [HttpGet("{storedFilename}")]
    public async Task<IActionResult> Download([FromRoute] string storedFilename, CancellationToken cancellationToken)
    {
        var (stream, contentType, fileName) = await _fileService.DownloadAsync(storedFilename, cancellationToken);

        return stream is null ? NotFound() : File(stream, contentType, fileName, enableRangeProcessing: true);
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
        var (fileStream, contentType, _) = await _fileService.StreamAsync(id, cancellationToken);
        return fileStream is null
            ? NotFound()
            : File(fileStream, contentType, enableRangeProcessing: true);
    }

    [HttpDelete("{storedFilename}")]
    public async Task<IActionResult> Delete([FromRoute] string storedFilename, CancellationToken cancellationToken)
    {
        var result = await _fileService.DeleteAsync(storedFilename, cancellationToken);

        if (result)
        {
            return NoContent();
        }

        return NotFound();
    }
}
