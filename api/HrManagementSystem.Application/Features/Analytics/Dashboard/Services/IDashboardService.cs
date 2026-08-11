using HrManagementSystem.Application.Features.Analytics.Dashboard.Contracts;

namespace HrManagementSystem.Application.Features.Analytics.Dashboard.Services
{
    public interface IDashboardService
    {
        Task<Result<UsersCountResponse>> GetUsersCountAsync(CancellationToken cancellationToken = default);
    }
}
