using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Services;

namespace HrManagementSystem.Api.Features.Platform.EntityChangeLogs.V1;

[ApiVersion("1.0", Deprecated = true)]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]

public class EntityChangeLogsController(IEntityChangeLogService entityChangeLogService) : ControllerBase
{
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;

    [HttpGet]
    [HasPermission(Permissions.ViewChangeLogs)]
    public async Task<IActionResult> GetAllChangesLogs()
    {
        var changeLogs = await _entityChangeLogService.GetChangeLogKeyValuesAsync();
        return Ok(changeLogs);
    }
}
