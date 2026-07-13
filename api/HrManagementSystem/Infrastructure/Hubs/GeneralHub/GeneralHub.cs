namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

[Authorize(AuthenticationSchemes = JwtAuthenticationSchemes.Realtime)]
public class GeneralHub : Hub<IGeneralHubClient>
{
}
