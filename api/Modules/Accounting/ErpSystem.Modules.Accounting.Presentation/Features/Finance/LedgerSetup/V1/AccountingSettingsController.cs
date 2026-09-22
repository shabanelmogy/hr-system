using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Queries;

namespace ErpSystem.Modules.Accounting.Presentation.Features.Finance.LedgerSetup.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/accounting-settings")]
[ApiController]
[TenantMember]
public sealed class AccountingSettingsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(AccountingPermissions.ViewAccountingSetup)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken) { var result = await sender.Send(new GetAccountingSettingsQuery(), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }

    [HttpPut]
    [HasPermission(AccountingPermissions.ManageAccountingSetup)]
    public async Task<IActionResult> Save(SaveAccountingSettingsRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new SaveAccountingSettingsCommand(request.FunctionalCurrencyId, request.PrimaryBookId, request.RowVersion), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
}
