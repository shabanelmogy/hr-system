using ErpSystem.Modules.Platform.Application.Features.Security.UserPermissions;
using MediatR;

namespace ErpSystem.Modules.Platform.Presentation.Features.Security.UserPermissions.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/user-permissions")]
[ApiController]
[TenantMember]
public sealed class UserPermissionsController(ISender sender) : ControllerBase
{
    [HttpGet("{userId}")]
    [HasPermission(PlatformPermissions.ViewUserPermissions)]
    public async Task<IActionResult> Get(string userId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetUserCompanyPermissionsQuery(userId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut("{userId}")]
    [HasPermission(PlatformPermissions.EditUserPermissions)]
    public async Task<IActionResult> Put(string userId, ReplaceUserCompanyPermissionsRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ReplaceUserCompanyPermissionsCommand(userId, request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
