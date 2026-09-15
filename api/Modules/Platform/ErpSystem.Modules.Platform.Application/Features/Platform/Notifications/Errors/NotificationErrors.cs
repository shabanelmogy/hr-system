using ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Contracts;

namespace ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Errors;

public sealed class NotificationErrors(IStringLocalizer<NotificationQueryRequest> localizer)
{
    public Error NotificationNotFound =>
        new("Notification.NotificationNotFound", localizer[nameof(NotificationNotFound)], ErrorType.NotFound);
}
