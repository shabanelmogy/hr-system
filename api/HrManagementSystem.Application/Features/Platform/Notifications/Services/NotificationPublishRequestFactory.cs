using HrManagementSystem.Application.Features.Platform.Notifications.Contracts;

namespace HrManagementSystem.Application.Features.Platform.Notifications.Services;

public static class NotificationPublishRequestFactory
{
    public static NotificationPublishRequest Create(
        string requiredPermission,
        string category,
        string entityType,
        string eventCollection,
        string action,
        IReadOnlyDictionary<string, string> parameters,
        string? entityId,
        string? actionUrl,
        string? actorUserId,
        Guid operationId,
        string? tenantId = null,
        int? companyId = null)
    {
        var actionName = GetActionName(action);
        var isBulk = action.StartsWith("Bulk", StringComparison.Ordinal);
        var eventActionName = isBulk ? $"Bulk{actionName}" : actionName;
        var eventType = $"{eventCollection}.{eventActionName}";
        var messageEntity = isBulk ? eventCollection : entityType;

        return new NotificationPublishRequest(
            requiredPermission,
            category,
            eventType,
            action is "Archive" or "BulkArchive" or "Delete" or "BulkDelete" or "Disable"
                ? NotificationSeverity.Warning
                : NotificationSeverity.Success,
            $"{entityType}NotificationTitle",
            $"{messageEntity}{actionName}NotificationMessage",
            parameters,
            entityType,
            entityId,
            actionUrl,
            actorUserId,
            $"{eventType}:{entityId ?? "bulk"}:{operationId:N}",
            TenantId: tenantId,
            CompanyId: companyId);
    }

    private static string GetActionName(string action) => action switch
    {
        "Add" => "Created",
        "BulkAdd" => "Created",
        "BulkArchive" => "Archived",
        "BulkDelete" => "Deleted",
        "Update" => "Updated",
        "Delete" => "Deleted",
        "Archive" => "Archived",
        "Restore" => "Restored",
        "Disable" => "Disabled",
        "Enable" => "Enabled",
        "Unlock" => "Unlocked",
        _ => "Changed"
    };
}
