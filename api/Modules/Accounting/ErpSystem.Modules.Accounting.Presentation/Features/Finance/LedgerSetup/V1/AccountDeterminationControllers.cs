using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Queries;

namespace ErpSystem.Modules.Accounting.Presentation.Features.Finance.LedgerSetup.V1;
[ApiVersion("1.0")][Route("api/v{version:apiVersion}/account-mappings")][ApiController][TenantMember]
public sealed class AccountMappingsController(ISender sender) : ControllerBase
{
    [HttpGet][HasPermission(AccountingPermissions.ViewAccountingSetup)] public Task<IReadOnlyList<AccountMappingResponse>> List([FromQuery] GetAccountMappingsQuery query, CancellationToken cancellationToken) => sender.Send(query, cancellationToken);
    [HttpPost][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Create(AccountMappingRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new CreateAccountMappingCommand(request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPut("{id:int}")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Update(int id, AccountMappingRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdateAccountMappingCommand(id, request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
}
[ApiVersion("1.0")][Route("api/v{version:apiVersion}/posting-profiles")][ApiController][TenantMember]
public sealed class PostingProfilesController(ISender sender) : ControllerBase
{
    [HttpGet][HasPermission(AccountingPermissions.ViewAccountingSetup)] public Task<IReadOnlyList<PostingProfileResponse>> List([FromQuery] GetPostingProfilesQuery query, CancellationToken cancellationToken) => sender.Send(query, cancellationToken);
    [HttpPost][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Create(PostingProfileRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new CreatePostingProfileCommand(request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPut("{id:int}")][HasPermission(AccountingPermissions.ManageAccountingSetup)] public async Task<IActionResult> Update(int id, PostingProfileRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdatePostingProfileCommand(id, request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
    [HttpPost("resolve-preview")][HasPermission(AccountingPermissions.ViewAccountingSetup)] public async Task<IActionResult> Resolve(ResolveAccountPreviewRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new ResolveAccountPreviewQuery(request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }
}
