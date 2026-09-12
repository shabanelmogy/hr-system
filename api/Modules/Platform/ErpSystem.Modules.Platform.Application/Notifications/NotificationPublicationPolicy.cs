using ErpSystem.Modules.Platform.Contracts.Notifications;

namespace ErpSystem.Modules.Platform.Application.Notifications;

internal sealed class NotificationPublicationPolicy : INotificationPublicationPolicy
{
    public bool IsValid(NotificationPublishRequest request, DateTime utcNow)
    {
        ArgumentNullException.ThrowIfNull(request);

        return IsWithinLength(request.RequiredPermission, 150) &&
               IsWithinLength(request.Category, 100) &&
               IsWithinLength(request.EventType, 150) &&
               IsWithinLength(request.TitleKey, 150) &&
               IsWithinLength(request.MessageKey, 150) &&
               IsOptionalWithinLength(request.EntityType, 100) &&
               IsOptionalWithinLength(request.EntityId, 100) &&
               IsOptionalWithinLength(request.DeduplicationKey, 250) &&
               IsOptionalWithinLength(request.TenantId, 32) &&
               (!request.CompanyId.HasValue ||
                request.CompanyId.Value > 0 && !string.IsNullOrWhiteSpace(request.TenantId)) &&
               IsSafeActionUrl(request.ActionUrl) &&
               (!request.ExpiresOn.HasValue || request.ExpiresOn.Value > utcNow);
    }

    private static bool IsWithinLength(string value, int maxLength) =>
        !string.IsNullOrWhiteSpace(value) && value.Length <= maxLength;

    private static bool IsOptionalWithinLength(string? value, int maxLength) =>
        string.IsNullOrWhiteSpace(value) || value.Length <= maxLength;

    private static bool IsSafeActionUrl(string? actionUrl) =>
        string.IsNullOrWhiteSpace(actionUrl) ||
        actionUrl.Length <= 500 && actionUrl.StartsWith('/') && !actionUrl.StartsWith("//", StringComparison.Ordinal);
}
