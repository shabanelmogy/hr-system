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
        var httpContext = context.GetHttpContext();
        var currentHost = httpContext.Request.Host.Host;

        return _settings.AllowedHosts.Contains(currentHost, StringComparer.OrdinalIgnoreCase);
    }
}