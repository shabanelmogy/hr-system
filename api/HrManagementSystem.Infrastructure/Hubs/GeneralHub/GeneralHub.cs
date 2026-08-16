namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

[Authorize(AuthenticationSchemes = JwtAuthenticationSchemes.Realtime)]
public class GeneralHub : Hub<IGeneralHubClient>
{
    private static readonly HashSet<string> KnownPermissions =
        Permissions.GetAllPermissions().ToHashSet(StringComparer.Ordinal);
    private static readonly HashSet<string> SystemRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        AppRoles.super_admin,
        AppRoles.admin,
        AppRoles.user
    };

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        var tenantId = Context.User?.FindFirstValue(JwtClaimNames.TenantId);
        var companyIdValue = Context.User?.FindFirstValue(JwtClaimNames.CompanyId);

        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            !int.TryParse(companyIdValue, out var companyId) ||
            companyId <= 0)
        {
            Context.Abort();
            return;
        }

        var groups = ResolveGroups(Context.User!, userId, tenantId, companyId);
        await Task.WhenAll(groups.Select(group =>
            Groups.AddToGroupAsync(Context.ConnectionId, group)));

        await base.OnConnectedAsync();
    }

    internal static IReadOnlyCollection<string> ResolveGroups(
        ClaimsPrincipal principal,
        string userId,
        string tenantId,
        int companyId)
    {
        ArgumentNullException.ThrowIfNull(principal);
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        if (companyId <= 0)
            throw new ArgumentOutOfRangeException(nameof(companyId));

        var permissions = principal.FindAll(Permissions.Type)
            .Select(claim => claim.Value)
            .Where(KnownPermissions.Contains)
            .Distinct(StringComparer.Ordinal)
            .ToArray();
        var systemRoles = principal.FindAll(ClaimTypes.Role)
            .Select(claim => claim.Value)
            .Where(SystemRoles.Contains)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var tenantRoleIds = principal.FindAll(JwtClaimNames.TenantRoleId)
            .Select(claim => claim.Value)
            .Where(roleId => !string.IsNullOrWhiteSpace(roleId))
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        var groups = new HashSet<string>(StringComparer.Ordinal)
        {
            GeneralHubGroups.ForTenant(tenantId),
            GeneralHubGroups.ForCompany(tenantId, companyId),
            GeneralHubGroups.ForUserCompany(tenantId, companyId, userId)
        };
        groups.EnsureCapacity(
            3 + permissions.Length * 3 + systemRoles.Length + tenantRoleIds.Length);

        foreach (var permission in permissions)
        {
            groups.Add(GeneralHubGroups.ForPermission(permission));
            groups.Add(GeneralHubGroups.ForTenantPermission(tenantId, permission));
            groups.Add(GeneralHubGroups.ForCompanyPermission(tenantId, companyId, permission));
        }

        foreach (var role in systemRoles)
            groups.Add(GeneralHubGroups.ForRole(role));

        foreach (var roleId in tenantRoleIds)
            groups.Add(GeneralHubGroups.ForTenantRole(tenantId, roleId));

        return groups;
    }
}
