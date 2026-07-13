namespace HrManagementSystem.Features.Platform.Notifications.Services;

public interface INotificationDeliveryService
{
    Task DeliverPendingAsync(CancellationToken cancellationToken = default);
    Task CleanupAsync(CancellationToken cancellationToken = default);
}
