using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authorization.Services;

public sealed class TenantRoleAssignmentService(ApplicationDbContext context)
{
    private static readonly string AdminName = AppRoles.admin.ToUpperInvariant();
    private static readonly string UserName = AppRoles.user.ToUpperInvariant();
    private static readonly string SuperAdminName = AppRoles.super_admin.ToUpperInvariant();

    public async Task<IReadOnlyList<ApplicationRole>?> ResolveAssignableRolesAsync(
        string tenantId,
        IEnumerable<string> roleNames,
        CancellationToken cancellationToken = default)
    {
        var normalizedNames = roleNames
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name.Trim().ToUpperInvariant())
            .Distinct(StringComparer.Ordinal)
            .ToArray();
        if (normalizedNames.Length == 0)
            return [];

        var roles = await context.Roles
            .AsNoTracking()
            .Where(role =>
                !role.IsDeleted &&
                role.NormalizedName != null &&
                normalizedNames.Contains(role.NormalizedName) &&
                ((role.IsSystem &&
                  (role.NormalizedName == AdminName || role.NormalizedName == UserName)) ||
                 (!role.IsSystem && role.TenantId == tenantId)))
            .ToArrayAsync(cancellationToken);

        return roles.Length == normalizedNames.Length ? roles : null;
    }

    public async Task<IReadOnlyList<string>> GetScopedRoleNamesAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default) =>
        await (
            from userRole in context.UserRoles.AsNoTracking()
            join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            where userRole.UserId == userId &&
                  (role.IsSystem || (!role.IsSystem && role.TenantId == tenantId))
            select role.Name!)
        .Distinct()
        .ToArrayAsync(cancellationToken);

    public Task<bool> IsSuperAdminAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        (from userRole in context.UserRoles.AsNoTracking()
         join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
         where userRole.UserId == userId &&
               role.IsSystem &&
               role.NormalizedName == SuperAdminName
         select userRole).AnyAsync(cancellationToken);

    public void AddAssignments(string userId, IEnumerable<ApplicationRole> roles)
    {
        foreach (var roleId in roles.Select(role => role.Id).Distinct(StringComparer.Ordinal))
        {
            context.UserRoles.Add(new IdentityUserRole<string>
            {
                UserId = userId,
                RoleId = roleId
            });
        }
    }

    public async Task SynchronizeAssignmentsAsync(
        string userId,
        string tenantId,
        IReadOnlyCollection<ApplicationRole> requestedRoles,
        CancellationToken cancellationToken = default)
    {
        var currentAssignments = await (
            from userRole in context.UserRoles
            join role in context.Roles on userRole.RoleId equals role.Id
            where userRole.UserId == userId
            select new
            {
                Assignment = userRole,
                IsManaged = !role.IsSystem && role.TenantId == tenantId
            })
            .ToArrayAsync(cancellationToken);

        var requestedRoleIds = requestedRoles
            .Select(role => role.Id)
            .ToHashSet(StringComparer.Ordinal);
        context.UserRoles.RemoveRange(
            currentAssignments
                .Where(item => item.IsManaged && !requestedRoleIds.Contains(item.Assignment.RoleId))
                .Select(item => item.Assignment));

        // System assignments are global. A tenant-scoped update may add an assignable
        // system role, but it must never revoke an existing system assignment because
        // that would silently change the user's access in every other tenant.
        var existingRoleIds = currentAssignments
            .Select(item => item.Assignment.RoleId)
            .ToHashSet(StringComparer.Ordinal);
        foreach (var roleId in requestedRoleIds.Where(roleId => !existingRoleIds.Contains(roleId)))
        {
            context.UserRoles.Add(new IdentityUserRole<string>
            {
                UserId = userId,
                RoleId = roleId
            });
        }
    }
}
