using Asp.Versioning;
using ErpSystem.Modules.Platform.Application.Modules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Platform.Presentation.Features.Modules.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/modules")]
[ApiController]
[Authorize]
public sealed class ModulesController(ISender sender) : ControllerBase
{
    [HttpGet("installed")]
    [Authorize(Roles = "super_admin")]
    public async Task<IActionResult> GetInstalled(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetInstalledModulesQuery(), cancellationToken).ConfigureAwait(false));

    [HttpGet("tenant-entitlements")]
    [Authorize(Roles = "super_admin")]
    public async Task<IActionResult> GetTenantEntitlements(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetTenantEntitlementModulesQuery(), cancellationToken).ConfigureAwait(false));

    [HttpGet("accessible")]
    public async Task<IActionResult> GetAccessible(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAccessibleModulesQuery(), cancellationToken).ConfigureAwait(false);
        return result is null ? Unauthorized() : Ok(result);
    }
}
