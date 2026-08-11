using HrManagementSystem.Application.Features.Platform.Notifications.Contracts;

namespace HrManagementSystem.Application.Features.Platform.Notifications.Errors;

public sealed class NotificationErrors(IStringLocalizer<NotificationQueryRequest> localizer)
{
    public Error NotificationNotFound =>
        new("Notification.NotificationNotFound", localizer[nameof(NotificationNotFound)], ErrorType.NotFound);

    public Error InvalidNotificationRequest =>
        new("Notification.InvalidNotificationRequest", localizer[nameof(InvalidNotificationRequest)], ErrorType.Validation);

    public Error NotificationPublishFailed =>
        new("Notification.NotificationPublishFailed", localizer[nameof(NotificationPublishFailed)], ErrorType.Unexpected);
}
