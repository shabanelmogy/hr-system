using ErpSystem.Modules.HR.Presentation.Common.Errors;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.WorkforcePlanning.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workforce-planning/trace")]
[ApiController]
[TenantMember]
public sealed class WorkforceTraceController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    private bool IncludeFinancials() =>
        User.Claims.Any(claim => claim.Type == Permissions.Type && claim.Value == Permissions.ViewWorkforceFinancials);

    [HttpGet("application/{applicationId:int}")]
    [HasPermission(Permissions.ViewWorkforceTrace)]
    [ProducesResponseType(typeof(HiringTraceResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByApplication([FromRoute] int applicationId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetHiringTraceByApplicationQuery(applicationId, IncludeFinancials()), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("offer/{offerId:int}")]
    [HasPermission(Permissions.ViewWorkforceTrace)]
    [ProducesResponseType(typeof(HiringTraceResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByOffer([FromRoute] int offerId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetHiringTraceByOfferQuery(offerId, IncludeFinancials()), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("employee/{employeeId:int}")]
    [HasPermission(Permissions.ViewWorkforceTrace)]
    [ProducesResponseType(typeof(HiringTraceResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByEmployee([FromRoute] int employeeId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetHiringTraceByEmployeeQuery(employeeId, IncludeFinancials()), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("plan-commitment")]
    [HasPermission(Permissions.ViewWorkforceTrace)]
    [ProducesResponseType(typeof(PageResponse<PlanCommitmentRowResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<PlanCommitmentRowResponse>> GetPlanCommitment(
        [FromQuery] int fiscalYearId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? positionId = null,
        [FromQuery] int? branchId = null,
        CancellationToken cancellationToken = default) =>
        _sender.Send(new GetPlanCommitmentSummaryQuery
        {
            FiscalYearId = fiscalYearId,
            PageNumber = pageNumber,
            PageSize = pageSize,
            PositionId = positionId,
            BranchId = branchId,
            IncludeFinancials = IncludeFinancials(),
        }, cancellationToken);
}

