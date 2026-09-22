using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Queries;

namespace ErpSystem.Modules.Accounting.Presentation.Features.Finance.LedgerSetup.V1;
[ApiVersion("1.0")][Route("api/v{version:apiVersion}/accounting-books")][ApiController][TenantMember]
public sealed class BooksController(ISender sender) : ControllerBase
{
    [HttpGet][HasPermission(AccountingPermissions.ViewAccountingSetup)] public Task<IReadOnlyList<BookResponse>> List([FromQuery] GetBooksQuery query, CancellationToken cancellationToken) => sender.Send(query, cancellationToken);
    [HttpGet("{id:int}")][HasPermission(AccountingPermissions.ViewAccountingSetup)] public async Task<IActionResult> Get(int id, CancellationToken cancellationToken) { var result = await sender.Send(new GetBookByIdQuery(id), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPost][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Create(BookRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new CreateBookCommand(request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPut("{id:int}")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Update(int id, BookRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdateBookCommand(id, request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpDelete("{id:int}")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Archive(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new ArchiveBookCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? NoContent() : result.ToProblem(); }
    [HttpPost("{id:int}/restore")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Restore(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new RestoreBookCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
}
[ApiVersion("1.0")][Route("api/v{version:apiVersion}/accounting-journals")][ApiController][TenantMember]
public sealed class JournalDefinitionsController(ISender sender) : ControllerBase
{
    [HttpGet][HasPermission(AccountingPermissions.ViewAccountingSetup)] public Task<IReadOnlyList<JournalDefinitionResponse>> List([FromQuery] GetJournalDefinitionsQuery query, CancellationToken cancellationToken) => sender.Send(query, cancellationToken);
    [HttpPost][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Create(JournalDefinitionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new CreateJournalDefinitionCommand(request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPut("{id:int}")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Update(int id, JournalDefinitionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdateJournalDefinitionCommand(id, request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpDelete("{id:int}")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Archive(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new ArchiveJournalDefinitionCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? NoContent() : result.ToProblem(); }
    [HttpPost("{id:int}/restore")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Restore(int id, RowVersionRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new RestoreJournalDefinitionCommand(id, request.RowVersion), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
}
