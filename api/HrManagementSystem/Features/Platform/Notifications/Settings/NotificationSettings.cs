namespace HrManagementSystem.Features.Platform.Notifications.Settings;

public sealed class NotificationSettings
{
    public const string SectionName = "NotificationSettings";

    public int DeliveryBatchSize { get; init; } = 100;
    public int MaxDeliveryAttempts { get; init; } = 5;
    public int DeliveryLeaseSeconds { get; init; } = 120;
    public int RetentionDays { get; init; } = 90;
    public int DismissedRetentionDays { get; init; } = 30;
}
