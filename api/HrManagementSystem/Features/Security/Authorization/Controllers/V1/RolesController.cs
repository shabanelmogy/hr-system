using HrManagementSystem.Features.Security.Authorization.Contracts;
using HrManagementSystem.Features.Security.Authorization.Services;

namespace HrManagementSystem.Features.Security.Authorization.Controllers.V1;

[Route(ApiRoutes.BaseRoute)]
[ApiVersion("1.0")]
[ApiController]
[Authorize]

public class RolesController(IRoleService roleService) : ControllerBase
{
    private readonly IRoleService _roleService = roleService;

    [HttpGet]
    [HasPermission(Permissions.ViewRoles)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var response = await _roleService.GetAllAsync(cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ViewRoles)]
    public async Task<IActionResult> Get([FromRoute] string id, CancellationToken cancellationToken)
    {
        var result = await _roleService.GetAsync(id, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("")]
    [HasPermission(Permissions.CreateRoles)]
    public async Task<IActionResult> Add([FromBody] RoleRequest request, CancellationToken cancellationToken)
    {
        var result = await _roleService.AddAsync(request, cancellationToken);

        return result.IsSuccess ? CreatedAtAction(nameof(Get), new { result.Value.Id }, result.Value) : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.EditRoles)]
    public async Task<IActionResult> Update([FromBody] RoleRequest request, CancellationToken cancellationToken)
    {
        var result = await _roleService.UpdateAsync(request, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.DeleteRoles)]
    public async Task<IActionResult> Toggle([FromRoute] string id, CancellationToken cancellationToken)
    {
        var result = await _roleService.ToggleStatusAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet]
    [HasPermission(Permissions.ViewRoles)]
    public async Task<IActionResult> GetRoleClaims([FromQuery] RoleIdQuery query, CancellationToken cancellationToken)
    {
        var result = await _roleService.GetRoleClaims(query.RoleId, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.EditRoles)]
    public async Task<IActionResult> UpdateRoleClaims([FromBody] RoleRequest roleRequest, CancellationToken cancellationToken)
    {
        var result = await _roleService.UpdateRoleClaims(roleRequest, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
