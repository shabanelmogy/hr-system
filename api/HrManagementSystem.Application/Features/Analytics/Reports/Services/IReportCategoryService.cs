using HrManagementSystem.Application.Features.Analytics.Reports.Contracts;

namespace HrManagementSystem.Application.Features.Analytics.Reports.Services
{
    public interface IReportCategoryService
    {
        Task<IEnumerable<ReportCategoryResponse>> GetAllAsync(CancellationToken cancellationToken);
        Task<Result<ReportCategoryResponse>> GetAsync(int id, CancellationToken cancellationToken);
        Task<Result<ReportCategoryResponse>> AddAsync(ReportCategoryRequest request, CancellationToken cancellationToken);
        Task<Result<ReportCategoryResponse>> UpdateAsync(ReportCategoryRequest request, CancellationToken cancellationToken = default);
        Task<Result> ToggleAsync(int id, CancellationToken cancellationToken);
    }
}
