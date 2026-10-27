using ErpSystem.Modules.Platform.Application.Features.MessageLogs;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.MessageLogs.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/message-logs")]
[ApiController, Authorize, TenantMember]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class MessageLogsController(ISender sender) : ControllerBase
{
    [HttpGet, HasPermission(PlatformPermissions.ViewMessageLogs)]
    public async Task<IActionResult> List([FromQuery] MessageLogCriteria criteria, CancellationToken token)
    { var result = await sender.Send(new ListMessageLogsQuery(criteria), token); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpGet("{id:guid}"), HasPermission(PlatformPermissions.ViewMessageLogs)]
    public async Task<IActionResult> Detail(Guid id, CancellationToken token)
    { var result = await sender.Send(new GetMessageLogQuery(id), token); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpGet("export"), HasPermission(PlatformPermissions.ExportMessageLogs)]
    public async Task<IActionResult> Export([FromQuery] MessageLogCriteria criteria, CancellationToken token)
    { var result = await sender.Send(new ExportMessageLogsQuery(criteria), token); return result.IsSuccess ? File(result.Value.Contents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", result.Value.FileName) : result.ToProblem(); }
}
