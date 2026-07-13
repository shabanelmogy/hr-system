using HrManagementSystem.Features.Platform.Notifications.Contracts;

namespace HrManagementSystem.Features.Platform.Notifications.Services;

public interface INotificationPublisher
{
    Task<Result<int>> PublishToPermissionAsync(
        NotificationPublishRequest request,
        CancellationToken cancellationToken = default);
}
