using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Addresses.Contracts;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Districts.Contracts;
using ErpSystem.Modules.HR.Application.Features.Platform.Notifications.Contracts;

using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.States.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.HR.Application.Common.Realtime;

namespace ErpSystem.Modules.HR.Infrastructure.Hubs.GeneralHub;

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
