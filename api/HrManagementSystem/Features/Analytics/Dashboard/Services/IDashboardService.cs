using HrManagementSystem.Features.Analytics.Dashboard.Contracts;

namespace HrManagementSystem.Features.Analytics.Dashboard.Services
{
    public interface IDashboardService
    {
        Task<Result<UsersCountResponse>> GetUsersCountAsync(CancellationToken cancellationToken = default);
    }
}
