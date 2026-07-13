

namespace HrManagementSystem.Features.Catalog.SubCategories.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public class SubcategoriesController(ISubCategoryService subcategoryService) : ControllerBase
{
    private readonly ISubCategoryService _subcategoryService = subcategoryService;

    [HttpGet]
    [HasPermission(Permissions.ViewSubCategories)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var subcategories = await _subcategoryService.GetAllAsync(cancellationToken);
        return Ok(subcategories);
    }

    [HttpGet]
    [HasPermission(Permissions.ViewSubCategories)]
    public async Task<IActionResult> GetAllRelatedToCategory(int CategoryId, CancellationToken cancellationToken = default)
    {
        var subcategories = await _subcategoryService.GetAllAsyncRelatedToCategeory(CategoryId, cancellationToken);
        return Ok(subcategories);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ViewSubCategories)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _subcategoryService.GetAsync(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateSubCategories)]
    public async Task<IActionResult> Add([FromBody] SubCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await _subcategoryService.AddAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.EditSubCategories)]
    public async Task<IActionResult> Update([FromBody] SubCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await _subcategoryService.UpdateAsync(request, cancellationToken);
        return result.IsSuccess
        ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
        : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteSubCategories)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _subcategoryService.ToggleAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}