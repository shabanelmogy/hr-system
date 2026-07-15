using HrManagementSystem.Features.Analytics.Reports.Contracts;
using HrManagementSystem.Features.Analytics.Reports.Services;

namespace HrManagementSystem.Features.Analytics.Reports.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]

public class ReportsCategoriesController(IReportCategoryService reportCategoryService) : ControllerBase
{
    private readonly IReportCategoryService _reportCategoryService = reportCategoryService;

    [HttpGet]
    [HasPermission(Permissions.ViewReportsCategories)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var servers = await _reportCategoryService.GetAllAsync(cancellationToken);
        return Ok(servers);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ViewReportsCategories)]
    public async Task<IActionResult> GetByID([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _reportCategoryService.GetAsync(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateReportsCategories)]
    public async Task<IActionResult> Add([FromBody] ReportCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await _reportCategoryService.AddAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("")]
    [HasPermission(Permissions.EditReportsCategories)]
    public async Task<IActionResult> Update([FromBody] ReportCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await _reportCategoryService.UpdateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteReportsCategories)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _reportCategoryService.ToggleAsync(id, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

}
