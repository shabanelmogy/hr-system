namespace HrManagementSystem.Features.Catalog.Categories.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]

public class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    private readonly ICategoryService _categoryService = categoryService;

    [HttpGet]
    [HasPermission(Permissions.ViewCategories)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var categories = await _categoryService.GetAllAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _categoryService.GetAsync(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateCategories)]
    public async Task<IActionResult> Add([FromBody] CategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await _categoryService.AddAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.EditCategories)]
    public async Task<IActionResult> Update([FromBody] CategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await _categoryService.UpdateAsync(request, cancellationToken);
        return result.IsSuccess
           ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
           : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteCategories)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _categoryService.ToggleAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}