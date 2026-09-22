using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Queries;
using MediatR;

namespace ErpSystem.Modules.Accounting.Presentation.Features.Finance.LedgerSetup.Currencies.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/currencies")]
[ApiController]
[TenantMember]
public sealed class CurrenciesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(AccountingPermissions.ViewAccountingSetup)]
    [ProducesResponseType(typeof(PageResponse<CurrencyResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage([FromQuery] GetCurrenciesQuery query, CancellationToken cancellationToken) =>
        Ok(await sender.Send(query, cancellationToken));

    [HttpGet("lookup")]
    [HasPermission(AccountingPermissions.ViewAccountingSetup)]
    [ProducesResponseType(typeof(IReadOnlyList<CurrencyLookupResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLookup(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetCurrencyLookupQuery(), cancellationToken));

    [HttpGet("{id:int}")]
    [HasPermission(AccountingPermissions.ViewAccountingSetup)]
    [ProducesResponseType(typeof(CurrencyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCurrencyByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(AccountingPermissions.ManageAccountingSetup)]
    [ProducesResponseType(typeof(CurrencyResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateCurrencyRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateCurrencyCommand(request.CurrencyCode, request.NameEn, request.NameAr, request.Symbol),
            cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id, version = "1.0" }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(AccountingPermissions.ManageAccountingSetup)]
    [ProducesResponseType(typeof(CurrencyResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, UpdateCurrencyRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateCurrencyCommand(id, request.CurrencyCode, request.NameEn, request.NameAr, request.Symbol, request.RowVersion),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id:int}")]
    [HasPermission(AccountingPermissions.ManageAccountingSetup)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Archive(
        int id,
        [FromBody] CurrencyConcurrencyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveCurrencyCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("{id:int}/restore")]
    [HasPermission(AccountingPermissions.ManageAccountingSetup)]
    [ProducesResponseType(typeof(CurrencyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Restore(
        int id,
        [FromBody] CurrencyConcurrencyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RestoreCurrencyCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

}
