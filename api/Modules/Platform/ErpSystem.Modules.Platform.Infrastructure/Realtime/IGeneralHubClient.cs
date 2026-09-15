using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Contracts;

namespace ErpSystem.Modules.Platform.Infrastructure.Realtime;

public interface IGeneralHubClient
{
    Task ReceiveTokenRevoked(string message);
    Task ReceiveNotification(NotificationRealtimeResponse notification);
    Task ReceiveEntityChanged(RealtimeEntityChanged change);
}
