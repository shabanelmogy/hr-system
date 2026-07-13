using HrManagementSystem.Features.Catalog.SubCategories.Contracts;

namespace HrManagementSystem.Features.Catalog.SubCategories.Services
{
    public interface ISubCategoryService
    {
        Task<IEnumerable<SubCategoryResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<SubCategoryResponse>> GetAllAsyncRelatedToCategeory(int CategoryId, CancellationToken cancellationToken = default);
        Task<Result<SubCategoryResponse>> GetAsync(int id, CancellationToken cancellationToken);
        Task<Result<SubCategoryResponse>> AddAsync(SubCategoryRequest request, CancellationToken cancellationToken = default);
        Task<Result<SubCategoryResponse>> UpdateAsync(SubCategoryRequest request, CancellationToken cancellationToken);
        Task<Result> ToggleAsync(int id, CancellationToken cancellationToken);
    }
}
