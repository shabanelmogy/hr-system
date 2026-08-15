using HrManagementSystem.Application.Features.Tenancy.Contracts;
using HrManagementSystem.Application.Features.Tenancy.Services;

namespace HrManagementSystem.Api.Features.Tenancy.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize(Roles = AppRoles.super_admin)]
public sealed class TenantsController(ITenantManagementService tenantManagementService)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPage(
        [FromQuery] TenantManagementQuery request,
        CancellationToken cancellationToken) =>
        Ok(await tenantManagementService.GetPageAsync(request, cancellationToken));

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await tenantManagementService.GetAllAsync(cancellationToken));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await tenantManagementService.GetAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] TenantManagementRequest request,
        CancellationToken cancellationToken)
    {
        var result = await tenantManagementService.CreateAsync(request, cancellationToken);
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
        var result = await tenantManagementService.UpdateAsync(id, request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/tenants/archive/{id}")]
    public async Task<IActionResult> Archive(
        [FromRoute] string id,
        [FromBody] ArchiveTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await tenantManagementService.ArchiveAsync(id, request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/tenants/restore/{id}")]
    public async Task<IActionResult> Restore(
        [FromRoute] string id,
        [FromBody] RestoreTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await tenantManagementService.RestoreAsync(id, request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
