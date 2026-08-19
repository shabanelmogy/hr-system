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
        var eventActionName = action == "BulkAdd" ? "BulkCreated" : actionName;
        var eventType = $"{eventCollection}.{eventActionName}";
        var messageEntity = action == "BulkAdd" ? eventCollection : entityType;

        return new NotificationPublishRequest(
            requiredPermission,
            category,
            eventType,
            action is "Archive" or "Delete" or "Disable"
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
