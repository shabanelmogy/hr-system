

using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Commands;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Queries;
using MediatR;

namespace ErpSystem.Modules.Inventory.Presentation.Features.Catalog.SubCategories.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
public class SubcategoriesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(InventoryPermissions.ViewSubCategories)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var subcategories = await sender.Send(new GetSubCategoriesQuery(), cancellationToken);
        return Ok(subcategories);
    }

    [HttpGet]
    [HasPermission(InventoryPermissions.ViewSubCategories)]
    public async Task<IActionResult> GetAllRelatedToCategory(int CategoryId, CancellationToken cancellationToken = default)
    {
        var subcategories = await sender.Send(new GetSubCategoriesByCategoryQuery(CategoryId), cancellationToken);
        return Ok(subcategories);
    }

    [HttpGet("{id}")]
    [HasPermission(InventoryPermissions.ViewSubCategories)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetSubCategoryByIdQuery(id), cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(InventoryPermissions.CreateSubCategories)]
    public async Task<IActionResult> Add([FromBody] SubCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateSubCategoryCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(InventoryPermissions.EditSubCategories)]
    public async Task<IActionResult> Update([FromBody] SubCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateSubCategoryCommand(request), cancellationToken);
        return result.IsSuccess
        ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
        : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(InventoryPermissions.DeleteSubCategories)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ToggleSubCategoryCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
