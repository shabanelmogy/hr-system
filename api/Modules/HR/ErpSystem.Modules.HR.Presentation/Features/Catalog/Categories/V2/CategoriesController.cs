using ErpSystem.Modules.HR.Application.Features.Catalog.Categories.Services;

namespace ErpSystem.Modules.HR.Presentation.Features.Catalog.Categories.V2
{
    [ApiVersion("2.0")]
    [Route(ApiRoutes.BaseRoute)]
    [ApiController]
    [TenantMember]
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
    }
}
