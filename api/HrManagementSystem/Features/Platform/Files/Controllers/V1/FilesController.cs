namespace HrManagementSystem.Features.Platform.Files.Controllers.V1;

[Route(ApiRoutes.BaseRoute)]
[ApiVersion("1.0")]
[ApiController]
[EnableRateLimiting("fileOperations")]
public class FilesController(IFileService fileService) : ControllerBase
{
    private readonly IFileService _fileService = fileService;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var files = await _fileService.GetAllAsync(cancellationToken);
        return Ok(files);
    }

    [HttpPost]
    public async Task<IActionResult> Upload([FromForm] UploadFileRequest request, CancellationToken cancellationToken)
    {
        var storedFileName = await _fileService.UploadAsync(request.File, cancellationToken);

        return CreatedAtAction(nameof(Download), new { storedFileName = storedFileName }, null);
    }

    [HttpPost]
    public async Task<IActionResult> UploadMany([FromForm] UploadManyFilesRequest request, CancellationToken cancellationToken)
    {
        var filesIds = await _fileService.UploadManyAsync(request.Files, cancellationToken);

        return Ok(filesIds);
    }

    [HttpPost]
    public async Task<IActionResult> UploadImage([FromForm] UploadImageRequest request, CancellationToken cancellationToken)
    {
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
