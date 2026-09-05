using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Commands;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Queries;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Queries.GetFiscalYears;
using MediatR;

namespace HrManagementSystem.Api.Features.Finance.FiscalYears.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/fiscal-years")]
[ApiController]
[TenantMember]
public sealed class FiscalYearsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewFiscalYears)]
    [ProducesResponseType(typeof(PageResponse<FiscalYearListItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage([FromQuery] GetFiscalYearsQuery query, CancellationToken cancellationToken) =>
        Ok(await sender.Send(query, cancellationToken));

    [HttpGet("lookup")]
    [HasPermission(Permissions.ViewFiscalYears)]
    [ProducesResponseType(typeof(IReadOnlyList<FiscalYearLookupResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLookup(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetFiscalYearLookupQuery(), cancellationToken));

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewFiscalYears)]
    [ProducesResponseType(typeof(FiscalYearDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetFiscalYearByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateFiscalYears)]
    [ProducesResponseType(typeof(FiscalYearDetailResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateFiscalYearRequest request, CancellationToken cancellationToken)
    {
        var command = new CreateFiscalYearCommand(request.Code, request.NameAr, request.NameEn, request.StartDate, request.EndDate, request.PeriodFrequency);
        var result = await sender.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.EditFiscalYears)]
    [ProducesResponseType(typeof(FiscalYearDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateFiscalYearRequest request, CancellationToken cancellationToken)
    {
        var command = new UpdateFiscalYearCommand(id, request.Code, request.NameAr, request.NameEn, request.StartDate, request.EndDate, request.PeriodFrequency, request.RowVersion);
        var result = await sender.Send(command, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.DeleteFiscalYears)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Archive([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveFiscalYearCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("{id:int}/restore")]
    [HasPermission(Permissions.DeleteFiscalYears)]
    [ProducesResponseType(typeof(FiscalYearDetailResponse), StatusCodes.Status200OK)]
    public Task<IActionResult> Restore([FromRoute] int id, [FromBody] FiscalYearConcurrencyRequest request, CancellationToken cancellationToken) =>
        SendLifecycleResult(new RestoreFiscalYearCommand(id, request.RowVersion), cancellationToken);

    [HttpPost("{id:int}/open")]
    [HasPermission(Permissions.ManageFiscalYearLifecycle)]
    public Task<IActionResult> Open([FromRoute] int id, [FromBody] FiscalYearConcurrencyRequest request, CancellationToken cancellationToken) =>
        ChangeLifecycle(id, request, FiscalYearLifecycleAction.Open, cancellationToken);

    [HttpPost("{id:int}/begin-closing")]
    [HasPermission(Permissions.ManageFiscalYearLifecycle)]
    public Task<IActionResult> BeginClosing([FromRoute] int id, [FromBody] FiscalYearConcurrencyRequest request, CancellationToken cancellationToken) =>
        ChangeLifecycle(id, request, FiscalYearLifecycleAction.BeginClosing, cancellationToken);

    [HttpPost("{id:int}/close")]
    [HasPermission(Permissions.ManageFiscalYearLifecycle)]
    public Task<IActionResult> Close([FromRoute] int id, [FromBody] FiscalYearConcurrencyRequest request, CancellationToken cancellationToken) =>
        ChangeLifecycle(id, request, FiscalYearLifecycleAction.Close, cancellationToken);

    [HttpPost("{id:int}/lock")]
    [HasPermission(Permissions.ManageFiscalYearLifecycle)]
    public Task<IActionResult> Lock([FromRoute] int id, [FromBody] FiscalYearConcurrencyRequest request, CancellationToken cancellationToken) =>
        ChangeLifecycle(id, request, FiscalYearLifecycleAction.Lock, cancellationToken);

    private Task<IActionResult> ChangeLifecycle(int id, FiscalYearConcurrencyRequest request, FiscalYearLifecycleAction action, CancellationToken cancellationToken) =>
        SendLifecycleResult(new ChangeFiscalYearLifecycleCommand(id, request.RowVersion, action), cancellationToken);

    private async Task<IActionResult> SendLifecycleResult(IRequest<Result<FiscalYearDetailResponse>> command, CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
