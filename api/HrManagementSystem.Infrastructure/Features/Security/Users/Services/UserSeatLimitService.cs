using HrManagementSystem.Application.Features.Security.Users.Errors;
using HrManagementSystem.Application.Features.Security.Users.Services;
using HrManagementSystem.Domain.Security.Users.Enums;

namespace HrManagementSystem.Infrastructure.Features.Security.Users.Services;

public sealed class UserSeatLimitService(
    ApplicationDbContext context,
    UserErrors userErrors) : IUserSeatLimitService
{
    public async Task<Error?> GetLimitErrorAsync(
        string tenantId,
        IEnumerable<string> roles,
        CancellationToken cancellationToken = default)
    {
        var roleNames = roles.ToArray();
        var needsAdminSeat = roleNames.Contains(AppRoles.admin, StringComparer.OrdinalIgnoreCase);
        var needsUserSeat = roleNames.Contains(AppRoles.user, StringComparer.OrdinalIgnoreCase);
        if (!needsAdminSeat && !needsUserSeat)
            return null;

        var limits = await context.Tenants
            .AsNoTracking()
            .Where(tenant => tenant.Id == tenantId)
            .Select(tenant => new { tenant.MaxAdmins, tenant.MaxUsers })
            .SingleOrDefaultAsync(cancellationToken);
        if (limits is null)
            return userErrors.InvalidCompanySelection;

        var counts = await (
            from tenantAccess in context.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
            join user in context.Users.IgnoreQueryFilters().AsNoTracking() on tenantAccess.UserId equals user.Id
            join userRole in context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
            join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            where tenantAccess.TenantId == tenantId &&
                  user.LifecycleStatus == UserLifecycleStatus.Active &&
                  role.IsSystem &&
                  (role.NormalizedName == AppRoles.admin.ToUpper() || role.NormalizedName == AppRoles.user.ToUpper())
            group tenantAccess by role.NormalizedName into roleGroup
            select new { Role = roleGroup.Key, Count = roleGroup.Select(access => access.UserId).Distinct().Count() })
            .ToDictionaryAsync(item => item.Role!, item => item.Count, cancellationToken);

        if (needsAdminSeat && counts.GetValueOrDefault(AppRoles.admin.ToUpper()) >= limits.MaxAdmins)
            return userErrors.AdminSeatLimitReached;
        if (needsUserSeat && counts.GetValueOrDefault(AppRoles.user.ToUpper()) >= limits.MaxUsers)
            return userErrors.UserSeatLimitReached;
        return null;
    }
}
