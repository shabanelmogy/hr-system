using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Commands;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Queries;
using MediatR;

namespace ErpSystem.Modules.Inventory.Presentation.Features.Catalog.Categories.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]

public class CategoriesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(InventoryPermissions.ViewCategories)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var categories = await sender.Send(new GetCategoriesQuery(), cancellationToken);
        return Ok(categories);
    }

    [HttpGet("{id}")]
    [HasPermission(InventoryPermissions.ViewCategories)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetCategoryByIdQuery(id), cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(InventoryPermissions.CreateCategories)]
    public async Task<IActionResult> Add([FromBody] CategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateCategoryCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(InventoryPermissions.EditCategories)]
    public async Task<IActionResult> Update([FromBody] CategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateCategoryCommand(request), cancellationToken);
        return result.IsSuccess
           ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
           : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(InventoryPermissions.DeleteCategories)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ToggleCategoryCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
