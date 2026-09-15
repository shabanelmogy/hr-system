using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using ErpSystem.Modules.Platform.Application.EntityChangeLogs;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.EntityChangeLogs.V1;

[ApiVersion("1.0", Deprecated = true)]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]

public class EntityChangeLogsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(PlatformPermissions.ViewChangeLogs)]
    public async Task<IActionResult> GetAllChangesLogs(CancellationToken cancellationToken)
    {
        var changeLogs = await sender.Send(new GetAllEntityChangeLogsQuery(), cancellationToken);
        return Ok(changeLogs);
    }

    [HttpGet("{entityName}/{entityId:int}")]
    [HasPermission(PlatformPermissions.ViewChangeLogs)]
    public async Task<IActionResult> GetEntityChangeLogs(
        [FromRoute] string entityName,
        [FromRoute] int entityId,
        CancellationToken cancellationToken)
    {
        var changeLogs = await sender.Send(new GetEntityChangeLogsQuery(entityName, entityId), cancellationToken);
        return Ok(changeLogs);
    }
}
