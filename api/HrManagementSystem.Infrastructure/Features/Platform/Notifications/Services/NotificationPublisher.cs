using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Application.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Entities;
using HrManagementSystem.Application.Features.Platform.Notifications.Errors;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Mapping;

namespace HrManagementSystem.Infrastructure.Features.Platform.Notifications.Services;

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

        var recipients = await (
                from access in context.UserCompanyAccesses.IgnoreQueryFilters().AsNoTracking()
                join company in context.Companies.IgnoreQueryFilters().AsNoTracking()
                    on new { access.TenantId, access.CompanyId }
                    equals new { company.TenantId, CompanyId = company.Id }
                join user in context.Users.AsNoTracking() on access.UserId equals user.Id
                join userRole in context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
                join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                join roleClaim in context.RoleClaims.AsNoTracking() on role.Id equals roleClaim.RoleId
                where !user.IsDisabled &&
                      !user.IsLocked &&
                      company.IsActive &&
                      user.TenantId == access.TenantId &&
                      !role.IsDeleted &&
                      roleClaim.ClaimType == Permissions.Type &&
                      roleClaim.ClaimValue == request.RequiredPermission &&
                      (request.TenantId == null || access.TenantId == request.TenantId) &&
                      (request.CompanyId == null || access.CompanyId == request.CompanyId)
                select new
                {
                    access.TenantId,
                    access.CompanyId,
                    RecipientUserId = user.Id
                })
            .Distinct()
            .ToListAsync(cancellationToken);

        if (recipients.Count == 0)
            return Result.Success(0);

        var notificationsToPublish = new List<Notification>();
        if (!string.IsNullOrWhiteSpace(request.DeduplicationKey))
        {
            var recipientUserIds = recipients.Select(recipient => recipient.RecipientUserId).Distinct().ToList();
            var existingNotifications = await context.Set<Notification>()
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(notification =>
                    recipientUserIds.Contains(notification.RecipientUserId) &&
                    notification.DeduplicationKey == request.DeduplicationKey)
                .ToListAsync(cancellationToken);

            var recipientKeys = recipients
                .Select(recipient => RecipientKey(
                    recipient.TenantId,
                    recipient.CompanyId,
                    recipient.RecipientUserId))
                .ToHashSet(StringComparer.Ordinal);
            notificationsToPublish.AddRange(existingNotifications.Where(notification =>
                recipientKeys.Contains(RecipientKey(
                    notification.TenantId,
                    notification.CompanyId,
                    notification.RecipientUserId))));

            var existingKeys = existingNotifications
                .Select(notification => RecipientKey(
                    notification.TenantId,
                    notification.CompanyId,
                    notification.RecipientUserId))
                .ToHashSet(StringComparer.Ordinal);
            recipients = recipients
                .Where(recipient => !existingKeys.Contains(RecipientKey(
                    recipient.TenantId,
                    recipient.CompanyId,
                    recipient.RecipientUserId)))
                .ToList();
        }

        var now = DateTime.UtcNow;
        var correlationId = request.CorrelationId ?? Guid.NewGuid();
        var parametersJson = NotificationParameters.Serialize(request.Parameters);

        if (parametersJson.Length > 2000)
            return Result.Failure<int>(errors.InvalidNotificationRequest);

        var newNotifications = recipients.Select(recipient => new Notification
        {
            TenantId = recipient.TenantId,
            CompanyId = recipient.CompanyId,
            RecipientUserId = recipient.RecipientUserId,
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
            await hubContext.Clients.Group(GeneralHubGroups.ForUserCompany(
                    notification.TenantId,
                    notification.CompanyId,
                    notification.RecipientUserId))
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
               IsOptionalWithinLength(request.TenantId, 32) &&
               (!request.CompanyId.HasValue ||
                request.CompanyId.Value > 0 && !string.IsNullOrWhiteSpace(request.TenantId)) &&
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

    private static string RecipientKey(string tenantId, int companyId, string userId) =>
        $"{tenantId}\u001f{companyId}\u001f{userId}";
}
