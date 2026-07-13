using HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;

namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

[Authorize(AuthenticationSchemes = JwtAuthenticationSchemes.Realtime)]
public class GeneralHub : Hub<IGeneralHubClient>
{
    public async Task SendUserNotification(Result<UsersCountResponse> usersCount)
    {
        await Clients.All.ReceiveUserUpdate(usersCount);
    }

    // Add the new method for token revocation notification
    public async Task SendTokenRevokedNotification(string userId, string message)
    {
        await Clients.User(userId).ReceiveTokenRevoked(message);
    }
    public async Task SendCountryNotification(CountriesCountResponse countryData)
    {
        await Clients.All.ReceiveCountryUpdate(countryData);
    }
    public async Task SendStateNotification(StatesCountResponse statesCount)
    {
        await Clients.All.ReceiveStateUpdate(statesCount);
    }

    public async Task SendDistrictNotification(Result<DistrictsCountResponse> districtsCount)
    {
        await Clients.All.ReceiveDistrictUpdate(districtsCount);
    }
    public async Task SendAddressTypeNotification(Result<AddressTypesCountResponse> addressTypesCount)
    {
        await Clients.All.ReceiveAddressTypeUpdate(addressTypesCount);
    }
    public async Task SendAddressNotification(Result<AddressesCountResponse> addressesCount)
    {
        await Clients.All.ReceiveAddressUpdate(addressesCount);
    }
}
