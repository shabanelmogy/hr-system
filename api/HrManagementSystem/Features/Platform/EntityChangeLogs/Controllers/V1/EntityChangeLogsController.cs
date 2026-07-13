namespace HrManagementSystem.Features.Platform.EntityChangeLogs.Controllers.V1;

[ApiVersion("1.0", Deprecated = true)]
[Route(ApiRoutes.BaseRoute)]
[ApiController]

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
