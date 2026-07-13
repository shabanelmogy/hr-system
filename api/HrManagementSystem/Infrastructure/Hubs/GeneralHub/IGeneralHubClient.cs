using HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;

namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

public interface IGeneralHubClient
{
    Task ReceiveUserUpdate(Result<UsersCountResponse> usersCount);
    Task ReceiveCountryUpdate(CountriesCountResponse countriesCount);
    Task ReceiveStateUpdate(StatesCountResponse statesCount);
    Task ReceiveDistrictUpdate(Result<DistrictsCountResponse> districtsCount);
    Task ReceiveAddressTypeUpdate(Result<AddressTypesCountResponse> addressTypesCount);
    Task ReceiveAddressUpdate(Result<AddressesCountResponse> addressesCount);
    Task ReceiveTokenRevoked(string message); 
}
