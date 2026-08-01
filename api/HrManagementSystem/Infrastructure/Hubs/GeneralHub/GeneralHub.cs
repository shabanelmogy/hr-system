namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

[Authorize(AuthenticationSchemes = JwtAuthenticationSchemes.Realtime)]
public class GeneralHub : Hub<IGeneralHubClient>
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        var tenantId = Context.User?.FindFirstValue(JwtClaimNames.TenantId);
        var companyIdValue = Context.User?.FindFirstValue(JwtClaimNames.CompanyId);

        if (!string.IsNullOrWhiteSpace(userId) &&
            !string.IsNullOrWhiteSpace(tenantId) &&
            int.TryParse(companyIdValue, out var companyId) &&
            companyId > 0)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                GeneralHubGroups.ForCompany(tenantId, companyId));
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                GeneralHubGroups.ForUserCompany(tenantId, companyId, userId));
        }

        await base.OnConnectedAsync();
    }
}
