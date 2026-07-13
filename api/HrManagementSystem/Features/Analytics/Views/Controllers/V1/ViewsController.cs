namespace HrManagementSystem.Features.Analytics.Views.Controllers.V1;

[Route("api/[controller]")]
[ApiController]
public class ViewsController(IViewService viewService) : ControllerBase
{
    private readonly IViewService _viewService = viewService;

    [HttpPost("create-or-alter")]
    public async Task<IActionResult> CreateOrAlterView([FromBody] ViewRequest view)
    {
        await _viewService.CreateOrAlterViewAsync(view);
        return Ok($"View {view.ViewName} created or altered successfully.");
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllViews()
    {
        var views = await _viewService.GetAllViewsAsync();
        return Ok(views);
    }

    [HttpDelete("{viewName}")]
    public async Task<IActionResult> DropView(string viewName)
    {
        await _viewService.DropViewAsync(viewName);
        return Ok($"View {viewName} dropped successfully.");
    }

    [HttpGet("tables")]
    public async Task<IActionResult> GetAllTables()
    {
        var tables = await _viewService.GetAllTablesAsync();
        return Ok(tables);
    }

    [HttpGet("tables/{tableName}/columns")]
    public async Task<IActionResult> GetTableColumns(string tableName)
    {
        var columns = await _viewService.GetTableColumnsAsync(tableName);
        return Ok(columns);
    }
}