using System.Globalization;
using System.Net.Http.Headers;

using HrManagementSystem.Application.Features.Platform.BackgroundJobs.Services;
using HrManagementSystem.Infrastructure.Hangfire;

namespace HrManagementSystem.Api.Features.Platform.BackgroundJobs.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public sealed class BackgroundJobsController(
    IBackgroundJobDashboardService backgroundJobDashboardService) : ControllerBase
{
    private readonly IBackgroundJobDashboardService _backgroundJobDashboardService =
        backgroundJobDashboardService;

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

        HangfireSessionAuthentication.WriteAccessTokenCookie(
            HttpContext,
            authorization.Parameter,
            expiresAt);

        return Redirect(HangfireSessionAuthentication.DashboardPath);
    }
}
