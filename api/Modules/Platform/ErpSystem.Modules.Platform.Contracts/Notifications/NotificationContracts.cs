namespace ErpSystem.Modules.Platform.Contracts.Notifications;

public enum NotificationSeverity
{
    Info = 1,
    Success = 2,
    Warning = 3,
    Critical = 4
}

public sealed record NotificationPublishRequest(
    string RequiredPermission,
    string Category,
    string EventType,
    NotificationSeverity Severity,
    string TitleKey,
    string MessageKey,
    IReadOnlyDictionary<string, string>? Parameters = null,
    string? EntityType = null,
    string? EntityId = null,
    string? ActionUrl = null,
    string? ActorUserId = null,
    string? DeduplicationKey = null,
    Guid? CorrelationId = null,
    DateTime? ExpiresOn = null,
    string? TenantId = null,
    int? CompanyId = null);

public sealed record NotificationPublishError(string Code);

public sealed record NotificationPublishResult(
    bool IsSuccess,
    int Value,
    NotificationPublishError Error)
{
    public bool IsFailure => !IsSuccess;

    public static NotificationPublishResult Success(int value) =>
        new(true, value, new NotificationPublishError(string.Empty));

    public static NotificationPublishResult Failure(string errorCode) =>
        new(false, 0, new NotificationPublishError(errorCode));
}

public static class NotificationPublishErrorCodes
{
    public const string InvalidRequest = "Notification.InvalidNotificationRequest";
    public const string PublishFailed = "Notification.NotificationPublishFailed";
}

public interface INotificationPublisher
{
    Task<NotificationPublishResult> PublishToPermissionAsync(
        NotificationPublishRequest request,
        CancellationToken cancellationToken = default);
}
