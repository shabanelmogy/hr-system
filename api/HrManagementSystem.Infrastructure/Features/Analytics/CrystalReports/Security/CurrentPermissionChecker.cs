using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Security;

public sealed class CurrentPermissionChecker(IHttpContextAccessor accessor) : ICurrentPermissionChecker
{
    public bool HasPermission(string permission) =>
        accessor.HttpContext?.User.HasClaim(Permissions.Type, permission) == true;
}
