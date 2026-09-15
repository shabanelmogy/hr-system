using ErpSystem.Modules.Platform.Application.Modules;

namespace ErpSystem.Modules.Platform.Infrastructure.Realtime;

[Authorize(AuthenticationSchemes = JwtAuthenticationSchemes.Realtime)]
public class GeneralHub(IModuleCatalogPolicy moduleCatalog) : Hub<IGeneralHubClient>
{
    private static readonly HashSet<string> SystemRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        PlatformRoleNames.SuperAdmin,
        PlatformRoleNames.Admin,
        PlatformRoleNames.User
    };

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        var tenantId = Context.User?.FindFirstValue(AuthenticationTokenClaimNames.TenantId);
        var companyIdValue = Context.User?.FindFirstValue(AuthenticationTokenClaimNames.CompanyId);

        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            !int.TryParse(companyIdValue, out var companyId) ||
            companyId <= 0)
        {
            Context.Abort();
            return;
        }

        var groups = ResolveGroups(
            Context.User!,
            userId,
            tenantId,
            companyId,
            moduleCatalog.GetKnownPermissions());
        await Task.WhenAll(groups.Select(group =>
            Groups.AddToGroupAsync(Context.ConnectionId, group)));

        await base.OnConnectedAsync();
    }

    internal static IReadOnlyCollection<string> ResolveGroups(
        ClaimsPrincipal principal,
        string userId,
        string tenantId,
        int companyId,
        IReadOnlySet<string> knownPermissions)
    {
        ArgumentNullException.ThrowIfNull(principal);
        ArgumentNullException.ThrowIfNull(knownPermissions);
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        if (companyId <= 0)
            throw new ArgumentOutOfRangeException(nameof(companyId));

        var permissions = principal.FindAll(PermissionClaimNames.Permission)
            .Select(claim => claim.Value)
            .Where(knownPermissions.Contains)
            .Distinct(StringComparer.Ordinal)
            .ToArray();
        var systemRoles = principal.FindAll(ClaimTypes.Role)
            .Select(claim => claim.Value)
            .Where(SystemRoles.Contains)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var tenantRoleIds = principal.FindAll(AuthenticationTokenClaimNames.TenantRoleId)
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
