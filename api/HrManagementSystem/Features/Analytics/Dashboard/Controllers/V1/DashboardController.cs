namespace HrManagementSystem.Features.Analytics.Dashboard.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]

public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    private readonly IDashboardService _dashboardService = dashboardService;

    [HttpGet]
    public async Task<IActionResult> GetUsersCount(CancellationToken cancellationToken)
    {
        var response = await _dashboardService.GetUsersCountAsync(cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

}
