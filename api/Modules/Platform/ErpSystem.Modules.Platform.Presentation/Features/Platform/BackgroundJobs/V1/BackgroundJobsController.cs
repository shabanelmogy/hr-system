using ErpSystem.Modules.Platform.Application.BackgroundJobs;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.BackgroundJobs.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public sealed class BackgroundJobsController(
    ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpGet]
    [HasPermission(PlatformPermissions.ViewHangfireDashboard)]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetBackgroundJobDashboardQuery(), cancellationToken));
}
