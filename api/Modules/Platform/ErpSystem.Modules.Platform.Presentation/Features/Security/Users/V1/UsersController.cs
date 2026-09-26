using ErpSystem.Modules.Platform.Application.Features.Security.Users.Commands;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Queries;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Profile;
using MediatR;

namespace ErpSystem.Modules.Platform.Presentation.Features.Security.Users.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
public class UsersController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpGet]
    [HasPermission(PlatformPermissions.ViewUsers)]
    public async Task<IActionResult> GetPage(
        [FromQuery] UserManagementQuery request,
        CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(new GetUsersPageQuery(request), cancellationToken));
    }

    [HttpGet]
    [HasPermission(PlatformPermissions.ViewUsers)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(new GetAllUsersQuery(), cancellationToken));
    }

    [HttpGet]
    [HasPermission(PlatformPermissions.ViewUsers)]
    public async Task<IActionResult> GetCompanyOptions(CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(new GetUserCompanyOptionsQuery(), cancellationToken));
    }

    [HttpGet("{id}")]
    [HasPermission(PlatformPermissions.ViewUsers)]
    public async Task<IActionResult> Get([FromRoute] string id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetUserByIdQuery(id), cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(PlatformPermissions.CreateUsers)]
    public async Task<IActionResult> Add([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new CreateUserCommand(request), cancellationToken);

        return result.IsSuccess ? CreatedAtAction(nameof(Get), new { result.Value.Id }, result.Value) : result.ToProblem();
    }

    [HttpPut("{id}")]
    [HasPermission(PlatformPermissions.EditUsers)]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new UpdateUserCommand(id, request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut("{id}")]
    [HasPermission(PlatformPermissions.ResetUserPasswords)]
    public async Task<IActionResult> ChangePassword(
        [FromRoute] string id,
        [FromBody] ChangeUserPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new ChangeManagedUserPasswordCommand(id, request),
            cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut("{id}")]
    [HasPermission(PlatformPermissions.SetUserStatus)]
    public async Task<IActionResult> Toggle(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ToggleUserStatusCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut("{id}")]
    [HasPermission(PlatformPermissions.UnlockUsers)]
    public async Task<IActionResult> Unlock(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new UnlockUserCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/users/archive/{id}")]
    [HasPermission(PlatformPermissions.ArchiveUsers)]
    public async Task<IActionResult> Archive(
        [FromRoute] string version,
        [FromRoute] string id,
        [FromBody] ArchiveUserRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ArchiveUserCommand(id, request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/users/restore/{id}")]
    [HasPermission(PlatformPermissions.RestoreUsers)]
    public async Task<IActionResult> Restore(
        [FromRoute] string version,
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new RestoreUserCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet("{id}")]
    [HasPermission(PlatformPermissions.ViewUsers)]
    public async Task<IActionResult> GetUserPhoto([FromRoute] string id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetUserPhotoQuery(id), cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
