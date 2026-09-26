using Asp.Versioning;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Platform.Application.OfflineOperations;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Platform.Presentation.Features.OfflineOperations.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/offline-operations")]
[ApiController]
[Authorize]
public sealed class OfflineOperationsController(ISender sender)
    : ControllerBase
{
    [HttpGet("policy")]
    [TenantMember]
    [HasPermission(PlatformPermissions.ViewOfflineOperations)]
    public async Task<ActionResult<OfflineOperationsPolicyResponse>> GetPolicy(
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await sender.Send(new GetOfflineOperationsPolicyQuery(), cancellationToken)
                .ConfigureAwait(false));
        }
        catch (OfflineOperationsPolicyScopeException exception)
        {
            return BadRequest(CreateProblem(StatusCodes.Status400BadRequest, exception.Message));
        }
    }

    [HttpPut("policy")]
    [TenantMember]
    [HasPermission(PlatformPermissions.EditOfflineOperations)]
    public async Task<ActionResult<OfflineOperationsPolicyResponse>> UpdatePolicy(
        [FromBody] UpdateOfflineOperationsPolicyRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await sender.Send(new UpdateOfflineOperationsPolicyCommand(request), cancellationToken)
                .ConfigureAwait(false));
        }
        catch (OfflineOperationsPolicyValidationException exception)
        {
            return BadRequest(CreateProblem(StatusCodes.Status400BadRequest, exception.Message));
        }
        catch (OfflineOperationsPolicyScopeException exception)
        {
            return BadRequest(CreateProblem(StatusCodes.Status400BadRequest, exception.Message));
        }
        catch (OfflineOperationsPolicyConflictException exception)
        {
            return Conflict(CreateProblem(StatusCodes.Status409Conflict, exception.Message));
        }
    }

    private static ProblemDetails CreateProblem(int status, string detail) => new()
    {
        Status = status,
        Title = status == StatusCodes.Status409Conflict
            ? "Offline operations policy conflict"
            : "Invalid offline operations policy request",
        Detail = detail
    };
}
