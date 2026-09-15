using ErpSystem.Modules.Reporting.Application.Features.Analytics.Views.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Views;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Views.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute2)]
[ApiController]
[TenantMember]
[HasPermission(ReportingPermissions.ManageDatabaseViews)]
public class ViewsController(ISender sender, IWebHostEnvironment environment) : ControllerBase
{
    private readonly ISender _sender = sender;
    private readonly IWebHostEnvironment _environment = environment;

    [HttpPost("create-or-alter")]
    public async Task<IActionResult> CreateOrAlterView([FromBody] ViewRequest view, CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        await _sender.Send(new CreateOrAlterViewCommand(view), cancellationToken);
        return Ok($"View {view.ViewName} created or altered successfully.");
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllViews(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        var views = await _sender.Send(new GetAllViewsQuery(), cancellationToken);
        return Ok(views);
    }

    [HttpDelete("{viewName}")]
    public async Task<IActionResult> DropView(string viewName, CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        await _sender.Send(new DropViewCommand(viewName), cancellationToken);
        return Ok($"View {viewName} dropped successfully.");
    }

    [HttpGet("tables")]
    public async Task<IActionResult> GetAllTables(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        var tables = await _sender.Send(new GetAllViewTablesQuery(), cancellationToken);
        return Ok(tables);
    }

    [HttpGet("tables/{tableName}/columns")]
    public async Task<IActionResult> GetTableColumns(string tableName, CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        var columns = await _sender.Send(new GetViewTableColumnsQuery(tableName), cancellationToken);
        return Ok(columns);
    }
}
