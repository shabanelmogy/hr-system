using HrManagementSystem.Application.Common.Paginations;

namespace HrManagementSystem.Application.Features.Platform.Notifications.Contracts;

public enum NotificationSeverity
{
    Info = 1,
    Success = 2,
    Warning = 3,
    Critical = 4
}

public enum NotificationReadStatus
{
    All = 0,
    Unread = 1,
    Read = 2
}

public sealed record NotificationQueryRequest : PaginationRequest
{
    public NotificationReadStatus Status { get; init; } = NotificationReadStatus.All;
    public string? Category { get; init; }
    public NotificationSeverity? Severity { get; init; }
}

public sealed record NotificationResponse(
    long Id,
    string Category,
    string EventType,
    NotificationSeverity Severity,
    string TitleKey,
    string MessageKey,
    IReadOnlyDictionary<string, string> Parameters,
    string? EntityType,
    string? EntityId,
    string? ActionUrl,
    string? ActorUserId,
    Guid CorrelationId,
    DateTime CreatedOn,
    DateTime? ReadOn,
    DateTime? ExpiresOn);

public sealed record NotificationPageResponse(
    IReadOnlyList<NotificationResponse> Items,
    MetaData MetaData);

public sealed record NotificationRealtimeResponse(
    long Id,
    string Category,
    string EventType,
    NotificationSeverity Severity,
    string TitleKey,
    string MessageKey,
    IReadOnlyDictionary<string, string> Parameters,
    string? EntityType,
    string? EntityId,
    string? ActionUrl,
    Guid CorrelationId,
    DateTime CreatedOn,
    string? ActorUserId);

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
