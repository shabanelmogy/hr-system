using ErpSystem.Modules.Platform.Contracts.Notifications;

namespace ErpSystem.Modules.Platform.Application.Notifications;

internal sealed class NotificationPublisher(
    INotificationPublicationPolicy policy,
    INotificationPermissionCatalog permissions,
    INotificationRecipientResolver recipients,
    INotificationPublicationStore store,
    INotificationDeliveryEffects effects,
    TimeProvider timeProvider) : INotificationPublisher
{
    public async Task<NotificationPublishResult> PublishToPermissionAsync(
        NotificationPublishRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow();
        if (!policy.IsValid(request, now.UtcDateTime) || !permissions.IsKnown(request.RequiredPermission))
            return NotificationPublishResult.Failure(NotificationPublishErrorCodes.InvalidRequest);

        var resolved = await recipients
            .ResolveAsync(request.RequiredPermission, request.TenantId, request.CompanyId, now, cancellationToken)
            .ConfigureAwait(false);
        if (resolved.Count == 0)
            return NotificationPublishResult.Success(0);

        IReadOnlyList<NotificationRecord> existing = [];
        var pendingRecipients = resolved;
        if (!string.IsNullOrWhiteSpace(request.DeduplicationKey))
        {
            existing = await store
                .FindByDeduplicationKeyAsync(request.DeduplicationKey, resolved, cancellationToken)
                .ConfigureAwait(false);
            var existingKeys = existing
                .Select(item => new NotificationRecipient(item.TenantId, item.CompanyId, item.RecipientUserId).Key)
                .ToHashSet(StringComparer.Ordinal);
            pendingRecipients = resolved.Where(item => !existingKeys.Contains(item.Key)).ToArray();
        }

        var correlationId = request.CorrelationId ?? Guid.NewGuid();
        var parameters = request.Parameters ?? new Dictionary<string, string>();
        if (System.Text.Json.JsonSerializer.Serialize(parameters).Length > 2000)
            return NotificationPublishResult.Failure(NotificationPublishErrorCodes.InvalidRequest);

        var drafts = pendingRecipients.Select(recipient => new NotificationDraft(
            recipient.TenantId,
            recipient.CompanyId,
            recipient.UserId,
            request.ActorUserId,
            request.RequiredPermission,
            request.Category,
            request.EventType,
            request.Severity,
            request.TitleKey,
            request.MessageKey,
            parameters,
            request.EntityType,
            request.EntityId,
            request.ActionUrl,
            correlationId,
            request.DeduplicationKey,
            now.UtcDateTime,
            request.ExpiresOn)).ToArray();

        IReadOnlyList<NotificationRecord> created;
        try
        {
            created = drafts.Length == 0
                ? []
                : await store.AddAsync(drafts, cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            return NotificationPublishResult.Failure(NotificationPublishErrorCodes.PublishFailed);
        }

        foreach (var notification in existing.Concat(created))
            await effects.PublishAsync(notification, cancellationToken).ConfigureAwait(false);

        return NotificationPublishResult.Success(created.Count);
    }
}
