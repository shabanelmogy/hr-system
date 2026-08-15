namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

[Authorize(AuthenticationSchemes = JwtAuthenticationSchemes.Realtime)]
public class GeneralHub : Hub<IGeneralHubClient>
{
    private static readonly HashSet<string> KnownPermissions =
        Permissions.GetAllPermissions().ToHashSet(StringComparer.Ordinal);

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

        var permissions = Context.User?.FindAll(Permissions.Type)
            .Select(claim => claim.Value)
            .Where(KnownPermissions.Contains)
            .Distinct(StringComparer.Ordinal)
            .ToArray() ?? [];
        var roles = Context.User?.FindAll(ClaimTypes.Role)
            .Select(claim => claim.Value)
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray() ?? [];

        var groupTasks = new List<Task>(3 + permissions.Length * 2 + roles.Length)
        {
            Groups.AddToGroupAsync(
                Context.ConnectionId,
                GeneralHubGroups.ForTenant(tenantId)),
            Groups.AddToGroupAsync(
                Context.ConnectionId,
                GeneralHubGroups.ForCompany(tenantId, companyId)),
            Groups.AddToGroupAsync(
                Context.ConnectionId,
                GeneralHubGroups.ForUserCompany(tenantId, companyId, userId))
        };

        foreach (var permission in permissions)
        {
            groupTasks.Add(Groups.AddToGroupAsync(
                Context.ConnectionId,
                GeneralHubGroups.ForPermission(permission)));
            groupTasks.Add(Groups.AddToGroupAsync(
                Context.ConnectionId,
                GeneralHubGroups.ForCompanyPermission(tenantId, companyId, permission)));
        }

        foreach (var role in roles)
        {
            groupTasks.Add(Groups.AddToGroupAsync(
                Context.ConnectionId,
                GeneralHubGroups.ForRole(role)));
        }

        await Task.WhenAll(groupTasks);

        await base.OnConnectedAsync();
    }
}
