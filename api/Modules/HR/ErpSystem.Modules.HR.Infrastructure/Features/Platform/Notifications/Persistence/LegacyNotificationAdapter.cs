using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.Platform.Notifications.Contracts;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Notifications.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Notifications.Mapping;
using ErpSystem.Modules.HR.Infrastructure.Hubs.GeneralHub;
using ErpSystem.Modules.Platform.Contracts.Notifications;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.Notifications.Persistence;

/// <summary>
/// Compatibility adapter for the historical hr.Notifications table, ASP.NET
/// Identity permission graph, and SignalR transport. Generic workflow policy is
/// owned by Platform Application.
/// </summary>
public sealed class LegacyNotificationAdapter(
    ApplicationDbContext context,
    IRealtimeChangeDispatcher realtimeChanges,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext) :
    INotificationInboxStore,
    INotificationInboxEffects,
    INotificationPermissionCatalog,
    INotificationRecipientResolver,
    INotificationPublicationStore,
    INotificationDeliveryEffects
{
    public bool IsKnown(string permission) =>
        Permissions.GetAllPermissions().Contains(permission, StringComparer.Ordinal);

    public async Task<NotificationInboxPage> GetPageAsync(
        string userId,
        NotificationScope scope,
        NotificationInboxQuery request,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        var query = Accessible(userId, scope)
            .Where(item => item.DismissedOn == null && (item.ExpiresOn == null || item.ExpiresOn > utcNow));
        query = request.Status switch
        {
            NotificationInboxReadStatus.Unread => query.Where(item => item.ReadOn == null),
            NotificationInboxReadStatus.Read => query.Where(item => item.ReadOn != null),
            _ => query
        };
        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(item => item.Category == request.Category);
        if (request.Severity.HasValue)
            query = query.Where(item => item.Severity == request.Severity.Value);

        query = ApplyOrdering(query, request.ColumnName, request.SortDirection);
        var count = await query.CountAsync(cancellationToken).ConfigureAwait(false);
        var rows = await query.AsNoTracking()
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken).ConfigureAwait(false);
        return new NotificationInboxPage(rows.Select(ToRecord).ToArray(), count, request.PageNumber, request.PageSize);
    }

    public Task<int> GetUnreadCountAsync(
        string userId,
        NotificationScope scope,
        DateTime utcNow,
        CancellationToken cancellationToken = default) =>
        Accessible(userId, scope).AsNoTracking().CountAsync(item =>
            item.ReadOn == null && item.DismissedOn == null &&
            (item.ExpiresOn == null || item.ExpiresOn > utcNow), cancellationToken);

    public async Task<NotificationStateMutation> SetReadStateAsync(
        string userId,
        NotificationScope scope,
        long id,
        bool isRead,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        if (!await Accessible(userId, scope).AnyAsync(item => item.Id == id && item.DismissedOn == null, cancellationToken))
            return NotificationStateMutation.Missing;
        var item = await context.Notifications.FirstAsync(
            n => n.Id == id && n.RecipientUserId == userId && n.TenantId == scope.TenantId && n.CompanyId == scope.CompanyId,
            cancellationToken).ConfigureAwait(false);
        var changed = isRead ? item.ReadOn is null : item.ReadOn is not null;
        if (changed)
        {
            item.ReadOn = isRead ? utcNow : null;
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
        return new NotificationStateMutation(true, changed, ToRecord(item));
    }

    public Task<int> SetAllReadStateAsync(
        string userId,
        NotificationScope scope,
        bool isRead,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        var query = Accessible(userId, scope).Where(item =>
            item.DismissedOn == null && (item.ExpiresOn == null || item.ExpiresOn > utcNow));
        query = isRead ? query.Where(item => item.ReadOn == null) : query.Where(item => item.ReadOn != null);
        return query.ExecuteUpdateAsync(
            setters => setters.SetProperty(item => item.ReadOn, isRead ? utcNow : (DateTime?)null),
            cancellationToken);
    }

    public async Task<NotificationStateMutation> DismissAsync(
        string userId,
        NotificationScope scope,
        long id,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        if (!await Accessible(userId, scope).AnyAsync(item => item.Id == id, cancellationToken))
            return NotificationStateMutation.Missing;
        var item = await context.Notifications.FirstAsync(
            n => n.Id == id && n.RecipientUserId == userId && n.TenantId == scope.TenantId && n.CompanyId == scope.CompanyId,
            cancellationToken).ConfigureAwait(false);
        var changed = item.DismissedOn is null;
        if (changed)
        {
            item.DismissedOn = utcNow;
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
        return new NotificationStateMutation(true, changed, ToRecord(item));
    }

    public Task<int> DismissAllAsync(
        string userId,
        NotificationScope scope,
        DateTime utcNow,
        CancellationToken cancellationToken = default) =>
        Accessible(userId, scope).Where(item => item.DismissedOn == null).ExecuteUpdateAsync(
            setters => setters.SetProperty(item => item.DismissedOn, utcNow), cancellationToken);

    public void Publish(NotificationInboxChange change) =>
        realtimeChanges.Dispatch(new RealtimeChangeRequest(
            RealtimeAudience.ForUserCompany(change.TenantId, change.CompanyId, change.UserId),
            "notifications",
            change.Action,
            change.EntityId,
            Guid.NewGuid()));

    public async Task<IReadOnlyList<NotificationRecipient>> ResolveAsync(
        string permission,
        string? tenantId,
        int? companyId,
        DateTimeOffset utcNow,
        CancellationToken cancellationToken = default) =>
        await (from access in context.UserCompanyAccesses.IgnoreQueryFilters().AsNoTracking()
               join company in context.Companies.IgnoreQueryFilters().AsNoTracking()
                   on new { access.TenantId, access.CompanyId } equals new { company.TenantId, CompanyId = company.Id }
               join user in context.Users.AsNoTracking() on access.UserId equals user.Id
               join userRole in context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
               join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
               join claim in context.RoleClaims.AsNoTracking() on role.Id equals claim.RoleId
               where !user.IsDisabled && (!user.LockoutEnd.HasValue || user.LockoutEnd <= utcNow) && company.IsActive &&
                     user.TenantId == access.TenantId && !role.IsDeleted &&
                     (role.IsSystem || role.TenantId == access.TenantId) &&
                     claim.ClaimType == Permissions.Type && claim.ClaimValue == permission &&
                     (tenantId == null || access.TenantId == tenantId) &&
                     (companyId == null || access.CompanyId == companyId)
               select new NotificationRecipient(access.TenantId, access.CompanyId, user.Id))
            .Distinct().ToListAsync(cancellationToken).ConfigureAwait(false);

    public async Task<IReadOnlyList<NotificationRecord>> FindByDeduplicationKeyAsync(
        string deduplicationKey,
        IReadOnlyCollection<NotificationRecipient> recipients,
        CancellationToken cancellationToken = default)
    {
        var userIds = recipients.Select(item => item.UserId).Distinct().ToArray();
        var rows = await context.Notifications.IgnoreQueryFilters().AsNoTracking()
            .Where(item => userIds.Contains(item.RecipientUserId) && item.DeduplicationKey == deduplicationKey)
            .ToListAsync(cancellationToken).ConfigureAwait(false);
        var keys = recipients.Select(item => item.Key).ToHashSet(StringComparer.Ordinal);
        return rows.Where(item => keys.Contains(new NotificationRecipient(item.TenantId, item.CompanyId, item.RecipientUserId).Key))
            .Select(ToRecord).ToArray();
    }

    public async Task<IReadOnlyList<NotificationRecord>> AddAsync(
        IReadOnlyCollection<NotificationDraft> notifications,
        CancellationToken cancellationToken = default)
    {
        var rows = notifications.Select(item => new Notification
        {
            TenantId = item.TenantId,
            CompanyId = item.CompanyId,
            RecipientUserId = item.RecipientUserId,
            ActorUserId = item.ActorUserId,
            RequiredPermission = item.RequiredPermission,
            Category = item.Category,
            EventType = item.EventType,
            Severity = item.Severity,
            TitleKey = item.TitleKey,
            MessageKey = item.MessageKey,
            ParametersJson = NotificationParameters.Serialize(item.Parameters),
            EntityType = item.EntityType,
            EntityId = item.EntityId,
            ActionUrl = item.ActionUrl,
            CorrelationId = item.CorrelationId,
            DeduplicationKey = item.DeduplicationKey,
            CreatedOn = item.CreatedOn,
            ExpiresOn = item.ExpiresOn
        }).ToArray();
        await context.Notifications.AddRangeAsync(rows, cancellationToken).ConfigureAwait(false);
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return rows.Select(ToRecord).ToArray();
    }

    public Task PublishAsync(NotificationRecord item, CancellationToken cancellationToken = default) =>
        hubContext.Clients.Group(GeneralHubGroups.ForUserCompany(item.TenantId, item.CompanyId, item.RecipientUserId))
            .ReceiveNotification(new NotificationRealtimeResponse(
                item.Id, item.Category, item.EventType, item.Severity, item.TitleKey, item.MessageKey,
                item.Parameters, item.EntityType, item.EntityId, item.ActionUrl, item.CorrelationId,
                item.CreatedOn, item.ActorUserId));

    private IQueryable<Notification> Accessible(string userId, NotificationScope scope)
    {
        if (!scope.IsValid)
            return context.Notifications.Where(_ => false);
        return context.Notifications.Where(item =>
            item.TenantId == scope.TenantId && item.CompanyId == scope.CompanyId && item.RecipientUserId == userId &&
            (from userRole in context.UserRoles.AsNoTracking()
             join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
             join claim in context.RoleClaims.AsNoTracking() on role.Id equals claim.RoleId
             where userRole.UserId == userId && !role.IsDeleted &&
                   (role.IsSystem || role.TenantId == item.TenantId) &&
                   claim.ClaimType == Permissions.Type && claim.ClaimValue == item.RequiredPermission
             select claim).Any());
    }

    private static IQueryable<Notification> ApplyOrdering(IQueryable<Notification> query, string? column, string? direction)
    {
        var descending = !string.Equals(direction, "ASC", StringComparison.OrdinalIgnoreCase);
        return (column?.ToUpperInvariant(), descending) switch
        {
            ("READON", false) => query.OrderBy(item => item.ReadOn).ThenBy(item => item.Id),
            ("READON", true) => query.OrderByDescending(item => item.ReadOn).ThenByDescending(item => item.Id),
            ("SEVERITY", false) => query.OrderBy(item => item.Severity).ThenByDescending(item => item.Id),
            ("SEVERITY", true) => query.OrderByDescending(item => item.Severity).ThenByDescending(item => item.Id),
            ("CATEGORY", false) => query.OrderBy(item => item.Category).ThenByDescending(item => item.Id),
            ("CATEGORY", true) => query.OrderByDescending(item => item.Category).ThenByDescending(item => item.Id),
            ("CREATEDON", false) => query.OrderBy(item => item.CreatedOn).ThenBy(item => item.Id),
            _ => query.OrderByDescending(item => item.CreatedOn).ThenByDescending(item => item.Id)
        };
    }

    private static NotificationRecord ToRecord(Notification item) => new(
        item.Id, item.TenantId, item.CompanyId, item.RecipientUserId, item.ActorUserId,
        item.RequiredPermission, item.Category, item.EventType, item.Severity, item.TitleKey,
        item.MessageKey, NotificationParameters.Deserialize(item.ParametersJson), item.EntityType,
        item.EntityId, item.ActionUrl, item.CorrelationId, item.DeduplicationKey, item.CreatedOn,
        item.ReadOn, item.DismissedOn, item.ExpiresOn);
}
