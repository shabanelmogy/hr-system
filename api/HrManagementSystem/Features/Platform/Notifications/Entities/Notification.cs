namespace HrManagementSystem.Features.Platform.Notifications.Entities;

public enum NotificationSeverity
{
    Info = 1,
    Success = 2,
    Warning = 3,
    Critical = 4
}

public sealed class Notification
{
    public long Id { get; set; }
    public string RecipientUserId { get; set; } = string.Empty;
    public string? ActorUserId { get; set; }
    public string RequiredPermission { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public NotificationSeverity Severity { get; set; }
    public string TitleKey { get; set; } = string.Empty;
    public string MessageKey { get; set; } = string.Empty;
    public string ParametersJson { get; set; } = "{}";
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? ActionUrl { get; set; }
    public Guid CorrelationId { get; set; }
    public string? DeduplicationKey { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? ReadOn { get; set; }
    public DateTime? DismissedOn { get; set; }
    public DateTime? ExpiresOn { get; set; }
    public DateTime? DeliveredOn { get; set; }
    public int DeliveryAttempts { get; set; }
    public DateTime? NextDeliveryAttemptOn { get; set; }
    public DateTime? DeliveryClaimedUntil { get; set; }
    public string? LastDeliveryError { get; set; }

    public ApplicationUser RecipientUser { get; set; } = default!;
    public ApplicationUser? ActorUser { get; set; }
}
