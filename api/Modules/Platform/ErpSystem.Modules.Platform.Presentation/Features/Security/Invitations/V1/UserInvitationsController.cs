using ErpSystem.Modules.Platform.Application.Features.Security.Invitations;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Contracts;

namespace ErpSystem.Modules.Platform.Presentation.Features.Security.Invitations.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
public sealed class UserInvitationsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(PlatformPermissions.ViewUserInvitations)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetUserInvitationsQuery(), cancellationToken));

    [HttpPost]
    [HasPermission(PlatformPermissions.CreateUserInvitations)]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserInvitationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateUserInvitationCommand(request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:guid}")]
    [HasPermission(PlatformPermissions.ResendUserInvitations)]
    public async Task<IActionResult> Resend(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ResendUserInvitationCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(PlatformPermissions.RevokeUserInvitations)]
    public async Task<IActionResult> Revoke(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RevokeUserInvitationCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/account-invitations/accept")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Accept(
        [FromRoute] string version,
        [FromBody] AcceptUserInvitationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new AcceptUserInvitationCommand(request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
