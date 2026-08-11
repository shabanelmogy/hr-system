using HrManagementSystem.Application.Features.Platform.Files.Contracts;
using HrManagementSystem.Application.Features.Platform.Files.Services;

namespace HrManagementSystem.Api.Features.Platform.Files.V1;

[Route(ApiRoutes.BaseRoute)]
[ApiVersion("1.0")]
[ApiController]
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
    public async Task<IActionResult> Upload(
        [FromForm(Name = "File")] IFormFile file,
        CancellationToken cancellationToken)
    {
        var request = new UploadFileRequest(file.ToFileUpload());
        await _uploadFileValidator.ValidateAndThrowAsync(request, cancellationToken);
        var storedFileName = await _fileService.UploadAsync(request.File, cancellationToken);

        return CreatedAtAction(nameof(Download), new { storedFileName = storedFileName }, null);
    }

    [HttpPost]
    public async Task<IActionResult> UploadMany(
        [FromForm(Name = "Files")] List<IFormFile> files,
        CancellationToken cancellationToken)
    {
        var request = new UploadManyFilesRequest(files.Select(file => file.ToFileUpload()).ToArray());
        await _uploadManyFilesValidator.ValidateAndThrowAsync(request, cancellationToken);
        var filesIds = await _fileService.UploadManyAsync(request.Files, cancellationToken);

        return Ok(filesIds);
    }

    [HttpPost]
    public async Task<IActionResult> UploadImage(
        [FromForm(Name = "Image")] IFormFile image,
        CancellationToken cancellationToken)
    {
        var request = new UploadImageRequest(image.ToFileUpload());
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
        var (fileStream, contentType, fileName) = await _fileService.StreamAsync(id, cancellationToken);
        return fileStream is null
            ? NotFound()
            : File(fileStream, contentType, fileName, enableRangeProcessing: true);
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
