namespace HrManagementSystem.Features.Security.Authentication.Jobs;

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class SessionRevokedJob(IHubContext<GeneralHub, IGeneralHubClient> hubContext)
{
    public Task ExecuteAsync(string userId, string message) =>
        hubContext.Clients.User(userId).ReceiveTokenRevoked(message);
}
