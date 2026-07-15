using HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Features.Platform.Notifications.Contracts;

using HrManagementSystem.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Features.Security.Users.Contracts;

namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

public interface IGeneralHubClient
{
    Task ReceiveUserUpdate(Result<UserChangedResponse> usersUpdate);
    Task ReceiveCountryUpdate(CountriesCountResponse countriesCount);
    Task ReceiveStateUpdate(StatesCountResponse statesCount);
    Task ReceiveDistrictUpdate(Result<DistrictsCountResponse> districtsCount);
    Task ReceiveAddressTypeUpdate(Result<AddressTypesCountResponse> addressTypesCount);
    Task ReceiveAddressUpdate(Result<AddressesCountResponse> addressesCount);
    Task ReceiveTokenRevoked(string message); 
    Task ReceiveNotification(NotificationRealtimeResponse notification);
}
