namespace HrManagementSystem.Features.Analytics.Views.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute2)]
[ApiController]
[HasPermission(Permissions.ManageDatabaseViews)]
public class ViewsController(IViewService viewService, IWebHostEnvironment environment) : ControllerBase
{
    private readonly IViewService _viewService = viewService;
    private readonly IWebHostEnvironment _environment = environment;

    [HttpPost("create-or-alter")]
    public async Task<IActionResult> CreateOrAlterView([FromBody] ViewRequest view, CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        await _viewService.CreateOrAlterViewAsync(view, cancellationToken);
        return Ok($"View {view.ViewName} created or altered successfully.");
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllViews(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        var views = await _viewService.GetAllViewsAsync(cancellationToken);
        return Ok(views);
    }

    [HttpDelete("{viewName}")]
    public async Task<IActionResult> DropView(string viewName, CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        await _viewService.DropViewAsync(viewName, cancellationToken);
        return Ok($"View {viewName} dropped successfully.");
    }

    [HttpGet("tables")]
    public async Task<IActionResult> GetAllTables(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        var tables = await _viewService.GetAllTablesAsync(cancellationToken);
        return Ok(tables);
    }

    [HttpGet("tables/{tableName}/columns")]
    public async Task<IActionResult> GetTableColumns(string tableName, CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        var columns = await _viewService.GetTableColumnsAsync(tableName, cancellationToken);
        return Ok(columns);
    }
}
