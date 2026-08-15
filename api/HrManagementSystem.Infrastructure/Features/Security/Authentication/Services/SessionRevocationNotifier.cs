using HrManagementSystem.Infrastructure.Features.Security.Authentication.Jobs;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class SessionRevocationNotifier(IBackgroundJobClient backgroundJobs)
{
    public void Queue(string userId, string message)
    {
        backgroundJobs.Enqueue<SessionRevokedJob>(
            job => job.ExecuteAsync(userId, message));
    }
}
