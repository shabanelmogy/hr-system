using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Queries;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;

namespace ErpSystem.Modules.Accounting.Presentation.Features.Finance.LedgerSetup.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/accounts")]
[ApiController]
[TenantMember]
public sealed class AccountsController(ISender sender) : ControllerBase
{
    [HttpGet] [HasPermission(AccountingPermissions.ViewAccounts)] public Task<PageResponse<AccountResponse>> List([FromQuery] GetAccountsQuery query, CancellationToken cancellationToken) => sender.Send(query, cancellationToken);
    [HttpGet("code-proposal")] [HasPermission(AccountingPermissions.ViewAccounts)] public async Task<IActionResult> CodeProposal(CancellationToken cancellationToken) { var result = await sender.Send(new GetAccountCodeProposalQuery(), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpGet("tree")] [HasPermission(AccountingPermissions.ViewAccounts)] public Task<IReadOnlyList<AccountTreeNodeResponse>> Tree(CancellationToken cancellationToken) => sender.Send(new GetAccountTreeQuery(), cancellationToken);
    [HttpGet("lookup")] [HasPermission(AccountingPermissions.ViewAccounts)] public Task<IReadOnlyList<AccountLookupResponse>> Lookup(CancellationToken cancellationToken) => sender.Send(new GetAccountLookupQuery(), cancellationToken);
    [HttpGet("hierarchy-levels")] [HasPermission(AccountingPermissions.ViewAccounts)] public Task<IReadOnlyList<AccountHierarchyLevelResponse>> Levels([FromQuery] GetAccountHierarchyLevelsQuery query, CancellationToken cancellationToken) => sender.Send(query, cancellationToken);
    [HttpGet("{id:int}")] [HasPermission(AccountingPermissions.ViewAccounts)] public async Task<IActionResult> Get(int id, CancellationToken cancellationToken) { var result = await sender.Send(new GetAccountByIdQuery(id), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPost("hierarchy-levels")] [HasPermission(AccountingPermissions.ManageAccounts)] public async Task<IActionResult> CreateLevel(AccountHierarchyLevelRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new CreateAccountHierarchyLevelCommand(request.LevelNumber, request.NameAr, request.NameEn, request.CanPost), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPut("hierarchy-levels/{id:int}")] [HasPermission(AccountingPermissions.ManageAccounts)] public async Task<IActionResult> UpdateLevel(int id, AccountHierarchyLevelRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdateAccountHierarchyLevelCommand(id, request.LevelNumber, request.NameAr, request.NameEn, request.CanPost, request.RowVersion ?? string.Empty), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpDelete("hierarchy-levels/{id:int}")] [HasPermission(AccountingPermissions.ManageAccounts)] public async Task<IActionResult> ArchiveLevel(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new ArchiveAccountHierarchyLevelCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? NoContent() : result.ToProblem(); }
    [HttpPost("hierarchy-levels/{id:int}/restore")] [HasPermission(AccountingPermissions.ManageAccounts)] public async Task<IActionResult> RestoreLevel(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new RestoreAccountHierarchyLevelCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPost] [HasPermission(AccountingPermissions.ManageAccounts)] public async Task<IActionResult> Create(AccountRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new CreateAccountCommand(request), cancellationToken); return result.IsSuccess ? CreatedAtAction(nameof(Get), new { id = result.Value.Id }, result.Value) : result.ToProblem(); }
    [HttpPut("{id:int}")] [HasPermission(AccountingPermissions.ManageAccounts)] public async Task<IActionResult> Update(int id, AccountRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdateAccountCommand(id, request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpDelete("{id:int}")] [HasPermission(AccountingPermissions.ManageAccounts)] public async Task<IActionResult> Archive(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new ArchiveAccountCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? NoContent() : result.ToProblem(); }
    [HttpPost("{id:int}/restore")] [HasPermission(AccountingPermissions.ManageAccounts)] public async Task<IActionResult> Restore(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new RestoreAccountCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
}
