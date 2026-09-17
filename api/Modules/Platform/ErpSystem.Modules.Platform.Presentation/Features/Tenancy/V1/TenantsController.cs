using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using ErpSystem.Modules.Platform.Presentation.Tenancy;

namespace ErpSystem.Modules.Platform.Presentation.Features.Tenancy.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize(Roles = PlatformRoleNames.SuperAdmin)]
public sealed class TenantsController(ISender sender)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPage(
        [FromQuery] TenantAdministrationPageRequest request,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetTenantsPageQuery(request), cancellationToken));

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetAllTenantsQuery(), cancellationToken));

    [HttpGet]
    public async Task<IActionResult> GetDashboardSummary(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetTenantDashboardSummaryQuery(), cancellationToken));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetTenantQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] TenantManagementRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateTenantCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(Get), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        [FromRoute] string id,
        [FromBody] TenantManagementRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateTenantCommand(id, request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/tenants/archive/{id}")]
    public async Task<IActionResult> Archive(
        [FromRoute] string version,
        [FromRoute] string id,
        [FromBody] ArchiveTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveTenantCommand(id, request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/tenants/restore/{id}")]
    public async Task<IActionResult> Restore(
        [FromRoute] string version,
        [FromRoute] string id,
        [FromBody] RestoreTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RestoreTenantCommand(id, request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
