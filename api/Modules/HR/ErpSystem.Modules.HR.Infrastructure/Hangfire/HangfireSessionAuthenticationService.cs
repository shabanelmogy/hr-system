using ErpSystem.Modules.Platform.Contracts.BackgroundJobs;

namespace ErpSystem.Modules.HR.Infrastructure.Hangfire;

public sealed class HangfireSessionAuthenticationService : IBackgroundJobDashboardSession
{
    public string DashboardPath => HangfireSessionAuthentication.DashboardPath;

    public BackgroundJobDashboardSessionCookie CreateAccessTokenCookie(
        string accessToken,
        DateTimeOffset expiresAt) =>
        new(
            HangfireSessionAuthentication.CookieName,
            accessToken,
            expiresAt,
            HangfireSessionAuthentication.DashboardPath);
}
