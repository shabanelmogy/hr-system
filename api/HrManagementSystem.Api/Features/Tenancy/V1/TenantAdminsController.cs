using HrManagementSystem.Application.Features.Tenancy.Contracts;
using HrManagementSystem.Application.Features.Tenancy.Services;

namespace HrManagementSystem.Api.Features.Tenancy.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize(Roles = AppRoles.super_admin)]
public sealed class TenantAdminsController(ITenantAdminService tenantAdminService)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPage(
        [FromQuery] TenantAdminQuery request,
        CancellationToken cancellationToken) =>
        Ok(await tenantAdminService.GetPageAsync(request, cancellationToken));

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await tenantAdminService.GetAllAsync(cancellationToken));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await tenantAdminService.GetAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateTenantAdminRequest request,
        CancellationToken cancellationToken)
    {
        var result = await tenantAdminService.CreateAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(Get), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        [FromRoute] string id,
        [FromBody] UpdateTenantAdminRequest request,
        CancellationToken cancellationToken)
    {
        var result = await tenantAdminService.UpdateAsync(id, request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await tenantAdminService.DeleteAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("~/api/v{version:apiVersion}/tenantAdmins/restore/{id}")]
    public async Task<IActionResult> Restore(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        var result = await tenantAdminService.RestoreAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
