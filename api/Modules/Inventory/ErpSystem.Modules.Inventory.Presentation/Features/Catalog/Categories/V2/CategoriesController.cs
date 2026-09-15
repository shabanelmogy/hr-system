using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Queries;
using MediatR;

namespace ErpSystem.Modules.Inventory.Presentation.Features.Catalog.Categories.V2
{
    [ApiVersion("2.0")]
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
    }
}
