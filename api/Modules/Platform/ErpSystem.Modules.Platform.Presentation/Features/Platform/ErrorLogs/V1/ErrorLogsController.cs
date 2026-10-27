using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.ErrorLogs.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/error-logs")]
[ApiController]
[Authorize]
[TenantMember]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class ErrorLogsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(PlatformPermissions.ViewErrorLogs)]
    public async Task<IActionResult> List([FromQuery] ErrorLogCriteria criteria, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ListErrorLogsQuery(criteria, false), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:guid}")]
    [HasPermission(PlatformPermissions.ViewErrorLogDetails)]
    public async Task<IActionResult> Detail(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetErrorLogDetailQuery(id, false), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("export")]
    [HasPermission(PlatformPermissions.ExportErrorLogs)]
    public async Task<IActionResult> Export([FromQuery] ErrorLogCriteria criteria, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ExportErrorLogsQuery(criteria, false), cancellationToken);
        return result.IsSuccess ? File(result.Value.Contents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", result.Value.FileName) : result.ToProblem();
    }
}
