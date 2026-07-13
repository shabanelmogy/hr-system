namespace HrManagementSystem.Features.Platform.Notifications.Services;

public static class NotificationJobConfiguration
{
    public static void RegisterNotificationJobs()
    {
        RecurringJob.AddOrUpdate<INotificationDeliveryService>(
            "notifications-delivery",
            service => service.DeliverPendingAsync(CancellationToken.None),
            Cron.Minutely);

        RecurringJob.AddOrUpdate<INotificationDeliveryService>(
            "notifications-cleanup",
            service => service.CleanupAsync(CancellationToken.None),
            Cron.Daily);
    }
}
