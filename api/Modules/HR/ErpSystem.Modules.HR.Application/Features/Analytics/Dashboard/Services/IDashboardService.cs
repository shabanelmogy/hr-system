using ErpSystem.Modules.HR.Application.Features.Analytics.Dashboard.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Analytics.Dashboard.Services
{
    public interface IDashboardService
    {
        Task<Result<UsersCountResponse>> GetUsersCountAsync(CancellationToken cancellationToken = default);
    }
}
