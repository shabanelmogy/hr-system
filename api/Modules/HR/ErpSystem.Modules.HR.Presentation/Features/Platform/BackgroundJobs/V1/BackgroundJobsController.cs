using System.Globalization;
using System.Net.Http.Headers;

using ErpSystem.Modules.Platform.Contracts.BackgroundJobs;

namespace ErpSystem.Modules.HR.Presentation.Features.Platform.BackgroundJobs.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public sealed class BackgroundJobsController(
    IBackgroundJobDashboardService backgroundJobDashboardService,
    IBackgroundJobDashboardSession sessionAuthentication) : ControllerBase
{
    private readonly IBackgroundJobDashboardService _backgroundJobDashboardService =
        backgroundJobDashboardService;
    private readonly IBackgroundJobDashboardSession _sessionAuthentication = sessionAuthentication;

    [HttpGet]
    [HasPermission(Permissions.ViewHangfireDashboard)]
    public IActionResult GetDashboard() =>
        Ok(_backgroundJobDashboardService.GetDashboard());

    [HttpGet]
    [HasPermission(Permissions.ViewHangfireDashboard)]
    public IActionResult OpenDashboard()
    {
        if (!AuthenticationHeaderValue.TryParse(
                Request.Headers.Authorization.ToString(),
                out var authorization) ||
            !string.Equals(authorization.Scheme, "Bearer", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(authorization.Parameter) ||
            !long.TryParse(
                User.FindFirstValue(JwtRegisteredClaimNames.Exp),
                CultureInfo.InvariantCulture,
                out var expiresAtSeconds))
        {
            return Unauthorized();
        }

        var expiresAt = DateTimeOffset.FromUnixTimeSeconds(expiresAtSeconds);
        if (expiresAt <= DateTimeOffset.UtcNow)
            return Unauthorized();

        var cookie = _sessionAuthentication.CreateAccessTokenCookie(
            authorization.Parameter,
            expiresAt);
        Response.Cookies.Append(
            cookie.Name,
            cookie.Value,
            new CookieOptions
            {
                Expires = cookie.Expires,
                HttpOnly = true,
                IsEssential = true,
                Path = cookie.Path,
                SameSite = SameSiteMode.Lax,
                Secure = true
            });

        return Redirect(_sessionAuthentication.DashboardPath);
    }
}
