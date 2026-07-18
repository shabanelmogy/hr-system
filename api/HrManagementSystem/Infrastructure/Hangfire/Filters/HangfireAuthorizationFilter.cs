using Hangfire.Dashboard;

namespace HrManagementSystem.Infrastructure.Hangfire.Filters;

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    private readonly HangfireSettings _settings;

    public HangfireAuthorizationFilter(IOptions<HangfireSettings> settings)
    {
        _settings = settings.Value;
    }

    public bool Authorize(DashboardContext context)
    {
        return Authorize(context.GetHttpContext());
    }

    public bool Authorize(HttpContext httpContext)
    {
        var user = httpContext.User;
        var currentHost = httpContext.Request.Host.Host;

        return user.Identity?.IsAuthenticated == true &&
            user.HasClaim(Permissions.Type, Permissions.ViewHangfireDashboard) &&
            _settings.AllowedHosts.Contains(currentHost, StringComparer.OrdinalIgnoreCase);
    }
}
