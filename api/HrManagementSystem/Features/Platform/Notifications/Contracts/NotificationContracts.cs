using HrManagementSystem.Features.Platform.Notifications.Entities;
using HrManagementSystem.Shared.Paginations;

namespace HrManagementSystem.Features.Platform.Notifications.Contracts;

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
    DateTime? ExpiresOn = null);
