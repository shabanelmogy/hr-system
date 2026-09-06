using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

/// <summary>
/// Loads current role and permission claims for an authenticated realtime session.
/// Authorization claims stay out of the query-string JWT used by browser SignalR transports.
/// </summary>
public sealed class RealtimePrincipalClaimsLoader(ApplicationDbContext database)
{
    private static readonly HashSet<string> KnownPermissions =
        Permissions.GetAllPermissions().ToHashSet(StringComparer.Ordinal);

    public async Task LoadAsync(
        ClaimsPrincipal principal,
        string userId,
        string tenantId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(principal);
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);

        var identity = principal.Identities.FirstOrDefault(candidate => candidate.IsAuthenticated)
            ?? throw new InvalidOperationException("The realtime principal has no authenticated identity.");

        var roles = await (
            from userRole in database.UserRoles.AsNoTracking()
            join role in database.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            where userRole.UserId == userId &&
                  (role.IsSystem ||
                   (!role.IsSystem && role.TenantId == tenantId && !role.IsDeleted))
            select new { role.Id, Name = role.Name!, role.IsSystem })
            .ToArrayAsync(cancellationToken);

        var roleIds = roles.Select(role => role.Id).ToArray();
        var permissions = roleIds.Length == 0
            ? []
            : await database.RoleClaims
                .AsNoTracking()
                .Where(claim =>
                    roleIds.Contains(claim.RoleId) &&
                    claim.ClaimType == Permissions.Type &&
                    claim.ClaimValue != null)
                .Select(claim => claim.ClaimValue!)
                .Distinct()
                .ToArrayAsync(cancellationToken);

        RemoveAuthorizationClaims(identity);
        identity.AddClaims(roles
            .Where(role => !string.IsNullOrWhiteSpace(role.Name))
            .Select(role => new Claim(ClaimTypes.Role, role.Name)));
        identity.AddClaims(roles
            .Where(role => !role.IsSystem)
            .Select(role => new Claim(JwtClaimNames.TenantRoleId, role.Id)));
        identity.AddClaims(permissions
            .Where(KnownPermissions.Contains)
            .Select(permission => new Claim(Permissions.Type, permission)));
    }

    private static void RemoveAuthorizationClaims(ClaimsIdentity identity)
    {
        foreach (var claim in identity.Claims.Where(claim =>
                     claim.Type == ClaimTypes.Role ||
                     claim.Type == JwtClaimNames.TenantRoleId ||
                     claim.Type == Permissions.Type).ToArray())
        {
            identity.RemoveClaim(claim);
        }
    }
}
