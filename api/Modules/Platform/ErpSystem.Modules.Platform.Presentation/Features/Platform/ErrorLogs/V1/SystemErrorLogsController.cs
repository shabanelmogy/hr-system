using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.ErrorLogs.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/system-error-logs")]
[ApiController]
[Authorize(Roles = PlatformRoleNames.SuperAdmin)]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class SystemErrorLogsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(PlatformPermissions.ViewSystemErrorLogs)]
    public async Task<IActionResult> List([FromQuery] ErrorLogCriteria criteria, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ListErrorLogsQuery(criteria, true), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:guid}")]
    [HasPermission(PlatformPermissions.ViewSystemErrorLogDetails)]
    public async Task<IActionResult> Detail(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetErrorLogDetailQuery(id, true), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("export")]
    [HasPermission(PlatformPermissions.ExportSystemErrorLogs)]
    public async Task<IActionResult> Export([FromQuery] ErrorLogCriteria criteria, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ExportErrorLogsQuery(criteria, true), cancellationToken);
        return result.IsSuccess ? File(result.Value.Contents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", result.Value.FileName) : result.ToProblem();
    }

    [HttpGet("settings")]
    [HasPermission(PlatformPermissions.ViewErrorLogSettings)]
    public async Task<IActionResult> Settings(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetErrorLogSettingsQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut("settings")]
    [HasPermission(PlatformPermissions.EditErrorLogSettings)]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateErrorLogSettingsRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateErrorLogSettingsCommand(request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
