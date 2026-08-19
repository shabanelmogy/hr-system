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
        if (IsStaticDashboardAsset(httpContext.Request.Path))
            return true;

        var user = httpContext.User;
        var currentHost = httpContext.Request.Host.Host;

        return user.Identity?.IsAuthenticated == true &&
            user.HasClaim(Permissions.Type, Permissions.ViewHangfireDashboard) &&
            _settings.AllowedHosts.Contains(currentHost, StringComparer.OrdinalIgnoreCase);
    }

    private static bool IsStaticDashboardAsset(PathString path)
    {
        var value = path.Value?.TrimStart('/');
        if (string.IsNullOrWhiteSpace(value) ||
            !value.StartsWith("hangfire/", StringComparison.OrdinalIgnoreCase))
            return false;

        var asset = value["hangfire/".Length..];
        return IsVersionedAsset(asset, "css") ||
            IsVersionedAsset(asset, "js") ||
            IsVersionedAsset(asset, "css-dark") ||
            asset.Equals("fonts/glyphicons-halflings-regular/eot", StringComparison.OrdinalIgnoreCase) ||
            asset.Equals("fonts/glyphicons-halflings-regular/svg", StringComparison.OrdinalIgnoreCase) ||
            asset.Equals("fonts/glyphicons-halflings-regular/ttf", StringComparison.OrdinalIgnoreCase) ||
            asset.Equals("fonts/glyphicons-halflings-regular/woff", StringComparison.OrdinalIgnoreCase) ||
            asset.Equals("fonts/glyphicons-halflings-regular/woff2", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsVersionedAsset(string asset, string prefix)
    {
        if (!asset.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            return false;

        var version = asset[prefix.Length..];
        return version.Length > 0 && version.All(char.IsDigit);
    }
}
