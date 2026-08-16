using HrManagementSystem.Application.Features.Security.Invitations.Contracts;
using HrManagementSystem.Application.Features.Security.Invitations.Services;

namespace HrManagementSystem.Api.Features.Security.Invitations.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
public sealed class UserInvitationsController(IUserInvitationService invitations) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewUsers)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await invitations.GetAllAsync(cancellationToken));

    [HttpPost]
    [HasPermission(Permissions.CreateUsers)]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserInvitationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await invitations.CreateAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:guid}")]
    [HasPermission(Permissions.EditUsers)]
    public async Task<IActionResult> Resend(Guid id, CancellationToken cancellationToken)
    {
        var result = await invitations.ResendAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.DeleteUsers)]
    public async Task<IActionResult> Revoke(Guid id, CancellationToken cancellationToken)
    {
        var result = await invitations.RevokeAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/account-invitations/accept")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Accept(
        [FromBody] AcceptUserInvitationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await invitations.AcceptAsync(request, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
