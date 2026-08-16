using HrManagementSystem.Application.Features.Platform.BackgroundJobs.Contracts;

namespace HrManagementSystem.Application.Features.Platform.BackgroundJobs.Services;

public interface IBackgroundJobDashboardService
{
    BackgroundJobDashboardResponse GetDashboard();
}
