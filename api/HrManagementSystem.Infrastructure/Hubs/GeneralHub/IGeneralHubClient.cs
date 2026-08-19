using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.Platform.Notifications.Contracts;

using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.Security.Users.Contracts;
using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

public interface IGeneralHubClient
{
    Task ReceiveUserUpdate(Result<UserChangedResponse> usersUpdate);
    Task ReceiveStateUpdate(StatesCountResponse statesCount);
    Task ReceiveDistrictUpdate(Result<DistrictsCountResponse> districtsCount);
    Task ReceiveAddressTypeUpdate(Result<AddressTypesCountResponse> addressTypesCount);
    Task ReceiveAddressUpdate(Result<AddressesCountResponse> addressesCount);
    Task ReceiveTokenRevoked(string message); 
    Task ReceiveNotification(NotificationRealtimeResponse notification);
    Task ReceiveEntityChanged(RealtimeEntityChanged change);
}
