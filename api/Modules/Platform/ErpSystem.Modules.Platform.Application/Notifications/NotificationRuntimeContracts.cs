using ErpSystem.Modules.Platform.Contracts.Notifications;

namespace ErpSystem.Modules.Platform.Application.Notifications;

public interface INotificationPublicationPolicy
{
    bool IsValid(NotificationPublishRequest request, DateTime utcNow);
}

public enum NotificationInboxReadStatus
{
    All = 0,
    Unread = 1,
    Read = 2
}

public sealed record NotificationScope(string? TenantId, int? CompanyId)
{
    public bool IsValid => !string.IsNullOrWhiteSpace(TenantId) && CompanyId is > 0;
}

public sealed record NotificationInboxQuery(
    int PageNumber,
    int PageSize,
    NotificationInboxReadStatus Status = NotificationInboxReadStatus.All,
    string? Category = null,
    NotificationSeverity? Severity = null,
    string? ColumnName = null,
    string? SortDirection = null);

public sealed record NotificationRecord(
    long Id,
    string TenantId,
    int CompanyId,
    string RecipientUserId,
    string? ActorUserId,
    string RequiredPermission,
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
    string? DeduplicationKey,
    DateTime CreatedOn,
    DateTime? ReadOn,
    DateTime? DismissedOn,
    DateTime? ExpiresOn);

public sealed record NotificationDraft(
    string TenantId,
    int CompanyId,
    string RecipientUserId,
    string? ActorUserId,
    string RequiredPermission,
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
    string? DeduplicationKey,
    DateTime CreatedOn,
    DateTime? ExpiresOn);

public sealed record NotificationRecipient(string TenantId, int CompanyId, string UserId)
{
    public string Key => $"{TenantId}\u001f{CompanyId}\u001f{UserId}";
}

public sealed record NotificationInboxPage(
    IReadOnlyList<NotificationRecord> Items,
    int TotalCount,
    int PageNumber,
    int PageSize);

public sealed record NotificationStateMutation(bool Found, bool Changed, NotificationRecord? Record)
{
    public static NotificationStateMutation Missing { get; } = new(false, false, null);
}

public sealed record NotificationInboxChange(
    string TenantId,
    int CompanyId,
    string UserId,
    string Action,
    string? EntityId);

public interface INotificationInboxStore
{
    Task<NotificationInboxPage> GetPageAsync(
        string userId,
        NotificationScope scope,
        NotificationInboxQuery query,
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<int> GetUnreadCountAsync(
        string userId,
        NotificationScope scope,
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<NotificationStateMutation> SetReadStateAsync(
        string userId,
        NotificationScope scope,
        long id,
        bool isRead,
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<int> SetAllReadStateAsync(
        string userId,
        NotificationScope scope,
        bool isRead,
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<NotificationStateMutation> DismissAsync(
        string userId,
        NotificationScope scope,
        long id,
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<int> DismissAllAsync(
        string userId,
        NotificationScope scope,
        DateTime utcNow,
        CancellationToken cancellationToken = default);
}

public interface INotificationInboxEffects
{
    void Publish(NotificationInboxChange change);
}

public interface INotificationInboxService
{
    Task<NotificationInboxPage> GetAsync(
        string userId,
        NotificationScope scope,
        NotificationInboxQuery query,
        CancellationToken cancellationToken = default);

    Task<int> GetUnreadCountAsync(
        string userId,
        NotificationScope scope,
        CancellationToken cancellationToken = default);

    Task<NotificationStateMutation> MarkReadAsync(
        string userId,
        NotificationScope scope,
        long id,
        CancellationToken cancellationToken = default);

    Task<NotificationStateMutation> MarkUnreadAsync(
        string userId,
        NotificationScope scope,
        long id,
        CancellationToken cancellationToken = default);

    Task<int> MarkAllReadAsync(
        string userId,
        NotificationScope scope,
        CancellationToken cancellationToken = default);

    Task<int> MarkAllUnreadAsync(
        string userId,
        NotificationScope scope,
        CancellationToken cancellationToken = default);

    Task<NotificationStateMutation> DismissAsync(
        string userId,
        NotificationScope scope,
        long id,
        CancellationToken cancellationToken = default);

    Task<int> DismissAllAsync(
        string userId,
        NotificationScope scope,
        CancellationToken cancellationToken = default);
}

public interface INotificationPermissionCatalog
{
    bool IsKnown(string permission);
}

public interface INotificationRecipientResolver
{
    Task<IReadOnlyList<NotificationRecipient>> ResolveAsync(
        string permission,
        string? tenantId,
        int? companyId,
        DateTimeOffset utcNow,
        CancellationToken cancellationToken = default);
}

public interface INotificationPublicationStore
{
    Task<IReadOnlyList<NotificationRecord>> FindByDeduplicationKeyAsync(
        string deduplicationKey,
        IReadOnlyCollection<NotificationRecipient> recipients,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificationRecord>> AddAsync(
        IReadOnlyCollection<NotificationDraft> notifications,
        CancellationToken cancellationToken = default);
}

public interface INotificationDeliveryEffects
{
    Task PublishAsync(NotificationRecord notification, CancellationToken cancellationToken = default);
}
