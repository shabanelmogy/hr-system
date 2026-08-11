using HrManagementSystem.Application.Features.Platform.Notifications.Contracts;

namespace HrManagementSystem.Application.Features.Platform.Notifications.Services;

public interface INotificationPublisher
{
    Task<Result<int>> PublishToPermissionAsync(
        NotificationPublishRequest request,
        CancellationToken cancellationToken = default);
}
