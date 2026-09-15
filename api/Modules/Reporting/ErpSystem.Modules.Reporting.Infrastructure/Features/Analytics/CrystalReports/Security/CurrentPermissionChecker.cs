using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Security;

public sealed class CurrentPermissionChecker(IHttpContextAccessor accessor) : ICurrentPermissionChecker
{
    public bool HasPermission(string permission) =>
        accessor.HttpContext?.User.HasClaim(PermissionClaimNames.Permission, permission) == true;
}
