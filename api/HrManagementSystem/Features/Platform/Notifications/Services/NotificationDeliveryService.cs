using HrManagementSystem.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Features.Platform.Notifications.Entities;
using HrManagementSystem.Features.Platform.Notifications.Settings;

namespace HrManagementSystem.Features.Platform.Notifications.Services;

public sealed class NotificationDeliveryService(
    ApplicationDbContext context,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext,
    IMapper mapper,
    IOptions<NotificationSettings> settings,
    ILogger<NotificationDeliveryService> logger) : INotificationDeliveryService
{
    private readonly NotificationSettings _settings = settings.Value;

    public async Task DeliverPendingAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var ids = await context.Set<Notification>()
            .AsNoTracking()
            .Where(notification =>
                notification.DeliveredOn == null &&
                notification.DeliveryAttempts < _settings.MaxDeliveryAttempts &&
                (notification.ExpiresOn == null || notification.ExpiresOn > now) &&
                (notification.NextDeliveryAttemptOn == null || notification.NextDeliveryAttemptOn <= now) &&
                (notification.DeliveryClaimedUntil == null || notification.DeliveryClaimedUntil <= now))
            .OrderBy(notification => notification.CreatedOn)
            .Select(notification => notification.Id)
            .Take(_settings.DeliveryBatchSize)
            .ToListAsync(cancellationToken);

        foreach (var id in ids)
        {
            cancellationToken.ThrowIfCancellationRequested();
            await DeliverOneAsync(id, cancellationToken);
        }
    }

    public async Task CleanupAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var retentionThreshold = now.AddDays(-_settings.RetentionDays);
        var dismissedThreshold = now.AddDays(-_settings.DismissedRetentionDays);

        var deleted = await context.Set<Notification>()
            .Where(notification =>
                notification.ExpiresOn <= now ||
                notification.DismissedOn <= dismissedThreshold ||
                notification.CreatedOn <= retentionThreshold)
            .ExecuteDeleteAsync(cancellationToken);

        logger.LogInformation("Deleted {NotificationCount} expired notification records", deleted);
    }

    private async Task DeliverOneAsync(long id, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var claimed = await context.Set<Notification>()
            .Where(notification =>
                notification.Id == id &&
                notification.DeliveredOn == null &&
                (notification.DeliveryClaimedUntil == null || notification.DeliveryClaimedUntil <= now))
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(
                    notification => notification.DeliveryClaimedUntil,
                    now.AddSeconds(_settings.DeliveryLeaseSeconds)),
                cancellationToken);

        if (claimed == 0)
            return;

        var notification = await context.Set<Notification>()
            .AsNoTracking()
            .FirstAsync(item => item.Id == id, cancellationToken);

        if (!await HasCurrentPermissionAsync(notification, cancellationToken))
        {
            await context.Set<Notification>()
                .Where(item => item.Id == id)
                .ExecuteUpdateAsync(
                    setters => setters
                        .SetProperty(item => item.DismissedOn, DateTime.UtcNow)
                        .SetProperty(item => item.DeliveryClaimedUntil, (DateTime?)null),
                    cancellationToken);
            return;
        }

        try
        {
            await hubContext.Clients.User(notification.RecipientUserId)
                .ReceiveNotification(mapper.Map<NotificationRealtimeResponse>(notification));

            await context.Set<Notification>()
                .Where(item => item.Id == id)
                .ExecuteUpdateAsync(
                    setters => setters
                        .SetProperty(item => item.DeliveredOn, DateTime.UtcNow)
                        .SetProperty(item => item.DeliveryClaimedUntil, (DateTime?)null)
                        .SetProperty(item => item.LastDeliveryError, (string?)null),
                    cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            var attempts = notification.DeliveryAttempts + 1;
            var retryDelayMinutes = Math.Min(Math.Pow(2, attempts), 60);
            var error = exception.Message.Length <= 500
                ? exception.Message
                : exception.Message[..500];

            await context.Set<Notification>()
                .Where(item => item.Id == id)
                .ExecuteUpdateAsync(
                    setters => setters
                        .SetProperty(item => item.DeliveryAttempts, attempts)
                        .SetProperty(item => item.NextDeliveryAttemptOn, DateTime.UtcNow.AddMinutes(retryDelayMinutes))
                        .SetProperty(item => item.DeliveryClaimedUntil, (DateTime?)null)
                        .SetProperty(item => item.LastDeliveryError, error),
                    cancellationToken);

            logger.LogWarning(
                exception,
                "Notification {NotificationId} delivery failed on attempt {Attempt}",
                id,
                attempts);
        }
    }

    private Task<bool> HasCurrentPermissionAsync(
        Notification notification,
        CancellationToken cancellationToken)
    {
        return (
            from user in context.Users.AsNoTracking()
            join userRole in context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
            join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            join roleClaim in context.RoleClaims.AsNoTracking() on role.Id equals roleClaim.RoleId
            where user.Id == notification.RecipientUserId &&
                  !user.IsDisabled &&
                  !user.IsLocked &&
                  !role.IsDeleted &&
                  roleClaim.ClaimType == Permissions.Type &&
                  roleClaim.ClaimValue == notification.RequiredPermission
            select roleClaim.Id)
            .AnyAsync(cancellationToken);
    }
}
