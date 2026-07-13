using HrManagementSystem.Features.Platform.Notifications.Contracts;

namespace HrManagementSystem.Features.Platform.Notifications.Services;

public interface INotificationService
{
    Task<Result<NotificationPageResponse>> GetAsync(
        string userId,
        NotificationQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<int>> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default);
    Task<Result> MarkReadAsync(string userId, long id, CancellationToken cancellationToken = default);
    Task<Result> MarkUnreadAsync(string userId, long id, CancellationToken cancellationToken = default);
    Task<Result> MarkAllReadAsync(string userId, CancellationToken cancellationToken = default);
    Task<Result> MarkAllUnreadAsync(string userId, CancellationToken cancellationToken = default);
    Task<Result> DismissAsync(string userId, long id, CancellationToken cancellationToken = default);
    Task<Result> DismissAllAsync(string userId, CancellationToken cancellationToken = default);
}
