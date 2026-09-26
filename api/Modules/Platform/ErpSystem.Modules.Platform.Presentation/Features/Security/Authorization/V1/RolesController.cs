using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Commands;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Queries;
using MediatR;

namespace ErpSystem.Modules.Platform.Presentation.Features.Security.Authorization.V1;

[Route(ApiRoutes.BaseRoute)]
[ApiVersion("1.0")]
[ApiController]
[TenantMember]

public class RolesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(PlatformPermissions.ViewRoles)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetAllRolesQuery(), cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id}")]
    [HasPermission(PlatformPermissions.ViewRoles)]
    public async Task<IActionResult> Get([FromRoute] string id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetRoleQuery(id), cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("")]
    [HasPermission(PlatformPermissions.CreateRoles)]
    public async Task<IActionResult> Add([FromBody] RoleRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateRoleCommand(request), cancellationToken);

        return result.IsSuccess ? CreatedAtAction(nameof(Get), new { result.Value.Id }, result.Value) : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(PlatformPermissions.EditRoles)]
    public async Task<IActionResult> Update([FromBody] RoleRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateRoleCommand(request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut("{id}")]
    [HasPermission(PlatformPermissions.SetRoleStatus)]
    public async Task<IActionResult> Toggle([FromRoute] string id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ToggleRoleStatusCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet]
    [HasPermission(PlatformPermissions.ViewRolePermissions)]
    public async Task<IActionResult> GetRoleClaims([FromQuery] RoleIdQuery query, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetRoleClaimsQuery(query.RoleId), cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(PlatformPermissions.EditRolePermissions)]
    public async Task<IActionResult> UpdateRoleClaims([FromBody] RoleRequest roleRequest, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateRoleClaimsCommand(roleRequest), cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
