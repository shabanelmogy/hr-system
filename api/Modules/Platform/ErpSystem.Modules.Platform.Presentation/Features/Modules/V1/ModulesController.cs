using Asp.Versioning;
using ErpSystem.Modules.Platform.Application.Modules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Platform.Presentation.Features.Modules.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/modules")]
[ApiController]
[Authorize]
public sealed class ModulesController(IModuleCatalogQueries catalog) : ControllerBase
{
    [HttpGet("installed")]
    [Authorize(Roles = "super_admin")]
    public IActionResult GetInstalled() => Ok(catalog.GetInstalled());

    [HttpGet("accessible")]
    public async Task<IActionResult> GetAccessible(CancellationToken cancellationToken)
    {
        var result = await catalog.GetAccessibleAsync(cancellationToken).ConfigureAwait(false);
        return result is null ? Unauthorized() : Ok(result);
    }
}
