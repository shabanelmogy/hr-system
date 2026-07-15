using HrManagementSystem.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Features.Platform.Notifications.Entities;
using HrManagementSystem.Features.Platform.Notifications.Errors;
using HrManagementSystem.Features.Platform.Notifications.Mapping;

namespace HrManagementSystem.Features.Platform.Notifications.Services;

public sealed class NotificationPublisher(
    ApplicationDbContext context,
    NotificationErrors errors,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext,
    IMapper mapper,
    ILogger<NotificationPublisher> logger) : INotificationPublisher
{
    public async Task<Result<int>> PublishToPermissionAsync(
        NotificationPublishRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!IsValid(request))
            return Result.Failure<int>(errors.InvalidNotificationRequest);

        var recipientIds = await (
                from user in context.Users.AsNoTracking()
                join userRole in context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
                join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                join roleClaim in context.RoleClaims.AsNoTracking() on role.Id equals roleClaim.RoleId
                where !user.IsDisabled &&
                      !user.IsLocked &&
                      !role.IsDeleted &&
                      roleClaim.ClaimType == Permissions.Type &&
                      roleClaim.ClaimValue == request.RequiredPermission
                select user.Id)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (recipientIds.Count == 0)
            return Result.Success(0);

        var notificationsToPublish = new List<Notification>();
        if (!string.IsNullOrWhiteSpace(request.DeduplicationKey))
        {
            var existingNotifications = await context.Set<Notification>()
                .AsNoTracking()
                .Where(notification =>
                    recipientIds.Contains(notification.RecipientUserId) &&
                    notification.DeduplicationKey == request.DeduplicationKey)
                .ToListAsync(cancellationToken);

            notificationsToPublish.AddRange(existingNotifications);
            recipientIds = recipientIds
                .Except(existingNotifications.Select(notification => notification.RecipientUserId))
                .ToList();
        }

        var now = DateTime.UtcNow;
        var correlationId = request.CorrelationId ?? Guid.NewGuid();
        var parametersJson = NotificationParameters.Serialize(request.Parameters);

        if (parametersJson.Length > 2000)
            return Result.Failure<int>(errors.InvalidNotificationRequest);

        var newNotifications = recipientIds.Select(recipientId => new Notification
        {
            RecipientUserId = recipientId,
            ActorUserId = request.ActorUserId,
            RequiredPermission = request.RequiredPermission,
            Category = request.Category,
            EventType = request.EventType,
            Severity = request.Severity,
            TitleKey = request.TitleKey,
            MessageKey = request.MessageKey,
            ParametersJson = parametersJson,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            ActionUrl = request.ActionUrl,
            CorrelationId = correlationId,
            DeduplicationKey = request.DeduplicationKey,
            CreatedOn = now,
            ExpiresOn = request.ExpiresOn
        }).ToList();

        if (newNotifications.Count > 0)
        {
            try
            {
                await context.Set<Notification>().AddRangeAsync(newNotifications, cancellationToken);
                await context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException exception)
            {
                logger.LogError(
                    exception,
                    "Failed to persist notification event {EventType} for permission {Permission}",
                    request.EventType,
                    request.RequiredPermission);
                return Result.Failure<int>(errors.NotificationPublishFailed);
            }

            notificationsToPublish.AddRange(newNotifications);
        }

        foreach (var notification in notificationsToPublish)
        {
            await hubContext.Clients.User(notification.RecipientUserId)
                .ReceiveNotification(mapper.Map<NotificationRealtimeResponse>(notification));
        }

        return Result.Success(newNotifications.Count);
    }

    private static bool IsValid(NotificationPublishRequest request)
    {
        return Permissions.GetAllPermissions().Contains(request.RequiredPermission, StringComparer.Ordinal) &&
               IsWithinLength(request.Category, 100) &&
               IsWithinLength(request.EventType, 150) &&
               IsWithinLength(request.TitleKey, 150) &&
               IsWithinLength(request.MessageKey, 150) &&
               IsOptionalWithinLength(request.EntityType, 100) &&
               IsOptionalWithinLength(request.EntityId, 100) &&
               IsOptionalWithinLength(request.DeduplicationKey, 250) &&
               IsSafeActionUrl(request.ActionUrl) &&
               (!request.ExpiresOn.HasValue || request.ExpiresOn.Value > DateTime.UtcNow);
    }

    private static bool IsWithinLength(string value, int maxLength) =>
        !string.IsNullOrWhiteSpace(value) && value.Length <= maxLength;

    private static bool IsOptionalWithinLength(string? value, int maxLength) =>
        string.IsNullOrWhiteSpace(value) || value.Length <= maxLength;

    private static bool IsSafeActionUrl(string? actionUrl) =>
        string.IsNullOrWhiteSpace(actionUrl) ||
        actionUrl.Length <= 500 && actionUrl.StartsWith('/') && !actionUrl.StartsWith("//", StringComparison.Ordinal);
}
