using ErpSystem.Modules.Platform.Contracts.Notifications;

namespace ErpSystem.Modules.Platform.Application.Notifications;

internal sealed class NotificationInboxService(
    INotificationInboxStore store,
    INotificationInboxEffects effects,
    TimeProvider timeProvider) : INotificationInboxService
{
    public Task<NotificationInboxPage> GetAsync(
        string userId,
        NotificationScope scope,
        NotificationInboxQuery query,
        CancellationToken cancellationToken = default) =>
        scope.IsValid
            ? store.GetPageAsync(userId, scope, query, UtcNow(), cancellationToken)
            : Task.FromResult(new NotificationInboxPage([], 0, query.PageNumber, query.PageSize));

    public Task<int> GetUnreadCountAsync(
        string userId,
        NotificationScope scope,
        CancellationToken cancellationToken = default) =>
        scope.IsValid
            ? store.GetUnreadCountAsync(userId, scope, UtcNow(), cancellationToken)
            : Task.FromResult(0);

    public Task<NotificationStateMutation> MarkReadAsync(
        string userId,
        NotificationScope scope,
        long id,
        CancellationToken cancellationToken = default) =>
        SetReadStateAsync(userId, scope, id, isRead: true, "MarkRead", cancellationToken);

    public Task<NotificationStateMutation> MarkUnreadAsync(
        string userId,
        NotificationScope scope,
        long id,
        CancellationToken cancellationToken = default) =>
        SetReadStateAsync(userId, scope, id, isRead: false, "MarkUnread", cancellationToken);

    public Task<int> MarkAllReadAsync(
        string userId,
        NotificationScope scope,
        CancellationToken cancellationToken = default) =>
        SetAllReadStateAsync(userId, scope, isRead: true, "MarkAllRead", cancellationToken);

    public Task<int> MarkAllUnreadAsync(
        string userId,
        NotificationScope scope,
        CancellationToken cancellationToken = default) =>
        SetAllReadStateAsync(userId, scope, isRead: false, "MarkAllUnread", cancellationToken);

    public async Task<NotificationStateMutation> DismissAsync(
        string userId,
        NotificationScope scope,
        long id,
        CancellationToken cancellationToken = default)
    {
        if (!scope.IsValid)
            return NotificationStateMutation.Missing;

        var result = await store
            .DismissAsync(userId, scope, id, UtcNow(), cancellationToken)
            .ConfigureAwait(false);
        if (result.Changed)
            Publish(scope, userId, "Dismiss", id.ToString(System.Globalization.CultureInfo.InvariantCulture));
        return result;
    }

    public async Task<int> DismissAllAsync(
        string userId,
        NotificationScope scope,
        CancellationToken cancellationToken = default)
    {
        if (!scope.IsValid)
            return 0;

        var changed = await store
            .DismissAllAsync(userId, scope, UtcNow(), cancellationToken)
            .ConfigureAwait(false);
        if (changed > 0)
            Publish(scope, userId, "DismissAll", entityId: null);
        return changed;
    }

    private async Task<NotificationStateMutation> SetReadStateAsync(
        string userId,
        NotificationScope scope,
        long id,
        bool isRead,
        string action,
        CancellationToken cancellationToken)
    {
        if (!scope.IsValid)
            return NotificationStateMutation.Missing;

        var result = await store
            .SetReadStateAsync(userId, scope, id, isRead, UtcNow(), cancellationToken)
            .ConfigureAwait(false);
        if (result.Changed)
            Publish(scope, userId, action, id.ToString(System.Globalization.CultureInfo.InvariantCulture));
        return result;
    }

    private async Task<int> SetAllReadStateAsync(
        string userId,
        NotificationScope scope,
        bool isRead,
        string action,
        CancellationToken cancellationToken)
    {
        if (!scope.IsValid)
            return 0;

        var changed = await store
            .SetAllReadStateAsync(userId, scope, isRead, UtcNow(), cancellationToken)
            .ConfigureAwait(false);
        if (changed > 0)
            Publish(scope, userId, action, entityId: null);
        return changed;
    }

    private DateTime UtcNow() => timeProvider.GetUtcNow().UtcDateTime;

    private void Publish(NotificationScope scope, string userId, string action, string? entityId) =>
        effects.Publish(new NotificationInboxChange(
            scope.TenantId!,
            scope.CompanyId!.Value,
            userId,
            action,
            entityId));
}
