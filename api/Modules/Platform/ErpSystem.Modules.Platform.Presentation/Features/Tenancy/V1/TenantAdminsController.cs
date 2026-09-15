using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using ErpSystem.Modules.Platform.Presentation.Tenancy;

namespace ErpSystem.Modules.Platform.Presentation.Features.Tenancy.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize(Roles = PlatformRoleNames.SuperAdmin)]
public sealed class TenantAdminsController(ISender sender)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPage(
        [FromQuery] TenantAdministrationPageRequest request,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetTenantAdministratorsPageQuery(request), cancellationToken));

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetAllTenantAdministratorsQuery(), cancellationToken));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetTenantAdministratorQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateTenantAdministratorRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateTenantAdministratorCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(Get), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        [FromRoute] string id,
        [FromBody] UpdateTenantAdministratorRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateTenantAdministratorCommand(id, request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveTenantAdministratorCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/tenantAdmins/restore/{id}")]
    public async Task<IActionResult> Restore(
        [FromRoute] string version,
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RestoreTenantAdministratorCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
