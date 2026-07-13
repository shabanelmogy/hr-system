using HrManagementSystem.Features.Catalog.Categories.Contracts;

namespace HrManagementSystem.Features.Catalog.Categories.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken);
        Task<Result<CategoryResponse>> GetAsync(int id, CancellationToken cancellationToken);
        Task<Result<CategoryResponse>> AddAsync(CategoryRequest request, CancellationToken cancellationToken = default);
        Task<Result<CategoryResponse>> UpdateAsync(CategoryRequest request, CancellationToken cancellationToken = default);
        Task<Result> ToggleAsync(int id, CancellationToken cancellationToken);
    }
}