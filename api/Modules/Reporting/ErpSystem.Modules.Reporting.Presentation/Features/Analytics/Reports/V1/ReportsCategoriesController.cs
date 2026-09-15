using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Queries;
using MediatR;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Reports.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]

public class ReportsCategoriesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(ReportingPermissions.ViewReportsCategories)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var categories = await sender.Send(new GetReportCategoriesQuery(), cancellationToken);
        return Ok(categories);
    }

    [HttpGet("{id}")]
    [HasPermission(ReportingPermissions.ViewReportsCategories)]
    public async Task<IActionResult> GetByID([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetReportCategoryByIdQuery(id), cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(ReportingPermissions.CreateReportsCategories)]
    public async Task<IActionResult> Add([FromBody] ReportCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateReportCategoryCommand(request), cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("")]
    [HasPermission(ReportingPermissions.EditReportsCategories)]
    public async Task<IActionResult> Update([FromBody] ReportCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateReportCategoryCommand(request), cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(ReportingPermissions.DeleteReportsCategories)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ToggleReportCategoryCommand(id), cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

}
