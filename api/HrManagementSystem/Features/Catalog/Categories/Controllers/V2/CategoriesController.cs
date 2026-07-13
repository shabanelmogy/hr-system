using HrManagementSystem.Features.Catalog.Categories.Services;

namespace HrManagementSystem.Features.Catalog.Categories.Controllers.V2
{
    [ApiVersion("2.0")]
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
    }
}