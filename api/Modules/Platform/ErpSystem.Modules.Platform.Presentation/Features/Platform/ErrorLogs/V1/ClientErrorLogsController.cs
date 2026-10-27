using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.ErrorLogs.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/error-logs/client")]
[ApiController]
[Authorize]
[AllowTenantReadOnly]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class ClientErrorLogsController(ISender sender) : ControllerBase
{
    [HttpPost]
    [Consumes("application/json")]
    [RequestSizeLimit(2048)]
    [EnableRateLimiting("errorLogClient")]
    public async Task<IActionResult> Report([FromBody] ClientErrorLogReport report, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ReportClientErrorCommand(report), cancellationToken);
        return result.IsSuccess ? Accepted() : result.ToProblem();
    }
}
