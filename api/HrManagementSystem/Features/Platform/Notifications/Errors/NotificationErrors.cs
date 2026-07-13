using HrManagementSystem.Features.Platform.Notifications.Contracts;

namespace HrManagementSystem.Features.Platform.Notifications.Errors;

public sealed class NotificationErrors(IStringLocalizer<NotificationQueryRequest> localizer)
{
    public Error NotificationNotFound =>
        new("Notification.NotificationNotFound", localizer[nameof(NotificationNotFound)], StatusCodes.Status404NotFound);

    public Error InvalidNotificationRequest =>
        new("Notification.InvalidNotificationRequest", localizer[nameof(InvalidNotificationRequest)], StatusCodes.Status400BadRequest);

    public Error NotificationPublishFailed =>
        new("Notification.NotificationPublishFailed", localizer[nameof(NotificationPublishFailed)], StatusCodes.Status500InternalServerError);
}
