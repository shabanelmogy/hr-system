using ErpSystem.Modules.Reporting.Application.Features.Analytics.Dashboard.Queries;
using ErpSystem.Modules.Reporting.Contracts.Authorization;
using MediatR;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Dashboard.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
public class DashboardController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(ReportingPermissions.ViewDashboard)]
    public async Task<IActionResult> GetUsersCount(CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetUsersCountQuery(), cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }
}
