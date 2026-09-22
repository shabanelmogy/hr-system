using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Queries;

namespace ErpSystem.Modules.Accounting.Presentation.Features.Finance.LedgerSetup.V1;
[ApiVersion("1.0")][Route("api/v{version:apiVersion}/accounting-exchange-rate-types")][ApiController][TenantMember]
public sealed class ExchangeRateTypesController(ISender sender) : ControllerBase
{
    [HttpGet][HasPermission(AccountingPermissions.ViewAccountingSetup)] public Task<IReadOnlyList<ExchangeRateTypeResponse>> List([FromQuery] GetExchangeRateTypesQuery query, CancellationToken cancellationToken) => sender.Send(query, cancellationToken);
    [HttpPost][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Create(ExchangeRateTypeRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new CreateExchangeRateTypeCommand(request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPut("{id:int}")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Update(int id, ExchangeRateTypeRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdateExchangeRateTypeCommand(id, request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpDelete("{id:int}")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Archive(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new ArchiveExchangeRateTypeCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? NoContent() : result.ToProblem(); }
    [HttpPost("{id:int}/restore")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Restore(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new RestoreExchangeRateTypeCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
}
[ApiVersion("1.0")][Route("api/v{version:apiVersion}/accounting-exchange-rates")][ApiController][TenantMember]
public sealed class ExchangeRatesController(ISender sender) : ControllerBase
{
    [HttpGet][HasPermission(AccountingPermissions.ViewAccountingSetup)] public Task<IReadOnlyList<ExchangeRateResponse>> List([FromQuery] GetExchangeRatesQuery query, CancellationToken cancellationToken) => sender.Send(query, cancellationToken);
    [HttpPost][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Create(ExchangeRateRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new CreateExchangeRateCommand(request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPut("{id:int}")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Update(int id, ExchangeRateRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdateExchangeRateCommand(id, request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
}
