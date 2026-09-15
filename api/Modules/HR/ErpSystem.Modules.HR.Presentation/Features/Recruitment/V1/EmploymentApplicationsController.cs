using Asp.Versioning;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

public sealed record MoveStageRequest(ApplicationStatusFilter TargetStatus, string? Reason);
public sealed record ApplicationReasonRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/applications")]
[ApiController]
[TenantMember]
public sealed class EmploymentApplicationsController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpGet]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<EmploymentApplicationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? jobOpeningId = null,
        [FromQuery] ApplicationStatusFilter? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetEmploymentApplicationsPageQuery(pageNumber, pageSize, search, jobOpeningId, status),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetEmploymentApplicationByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(HrPermissions.ManageApplications)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Submit([FromBody] SubmitApplicationMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new SubmitEmploymentApplicationCommand(mutation), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/move-stage")]
    [HasPermission(HrPermissions.ManageApplications)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> MoveStage(int id, [FromBody] MoveStageRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new MoveEmploymentApplicationStageCommand(id, request.TargetStatus, request.Reason),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(HrPermissions.ManageApplications)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(int id, [FromBody] ApplicationReasonRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new RejectEmploymentApplicationCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/withdraw")]
    [HasPermission(HrPermissions.ManageApplications)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Withdraw(int id, [FromBody] ApplicationReasonRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new WithdrawEmploymentApplicationCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/hire")]
    [HasPermission(HrPermissions.HireCandidate)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Hire(int id, [FromBody] HireCandidateMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new HireEmploymentApplicationCommand(id, mutation), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
