using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Application.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Entities;
using HrManagementSystem.Application.Features.Platform.Notifications.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Features.Platform.Notifications.Services;

public sealed class NotificationService(
    ApplicationDbContext context,
    NotificationErrors errors,
    IMapper mapper,
    ICurrentActor currentActor,
    IRealtimeChangeDispatcher realtimeChanges) : INotificationService
{
    public async Task<Result<NotificationPageResponse>> GetAsync(
        string userId,
        NotificationQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var query = GetAccessibleNotifications(userId)
            .AsNoTracking()
            .Where(notification =>
                notification.DismissedOn == null &&
                (notification.ExpiresOn == null || notification.ExpiresOn > now));

        query = request.Status switch
        {
            NotificationReadStatus.Unread => query.Where(notification => notification.ReadOn == null),
            NotificationReadStatus.Read => query.Where(notification => notification.ReadOn != null),
            _ => query
        };

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(notification => notification.Category == request.Category);

        if (request.Severity.HasValue)
            query = query.Where(notification => notification.Severity == request.Severity.Value);

        query = ApplyOrdering(query, request.ColumnName, request.SortDirection);

        var count = await query.CountAsync(cancellationToken);
        var notifications = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);
        var page = new PagedList<Notification>(
            notifications,
            count,
            request.PageNumber,
            request.PageSize);

        var response = new NotificationPageResponse(
            page.Select(mapper.Map<NotificationResponse>).ToList(),
            page.MetaData);

        return Result.Success(response);
    }

    public async Task<Result<int>> GetUnreadCountAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var count = await GetAccessibleNotifications(userId)
            .AsNoTracking()
            .CountAsync(notification =>
                notification.ReadOn == null &&
                notification.DismissedOn == null &&
                (notification.ExpiresOn == null || notification.ExpiresOn > now),
                cancellationToken);

        return Result.Success(count);
    }

    public async Task<Result> MarkReadAsync(
        string userId,
        long id,
        CancellationToken cancellationToken = default)
    {
        var canAccess = await GetAccessibleNotifications(userId)
            .AnyAsync(item => item.Id == id && item.DismissedOn == null, cancellationToken);

        if (!canAccess)
            return Result.Failure(errors.NotificationNotFound);

        var notification = await context.Set<Notification>()
            .FirstAsync(item => item.Id == id && item.RecipientUserId == userId, cancellationToken);

        var changed = notification.ReadOn is null;
        notification.ReadOn ??= DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        if (changed)
            DispatchChange(userId, "MarkRead", id.ToString(CultureInfo.InvariantCulture));

        return Result.Success();
    }

    public async Task<Result> MarkAllReadAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var changedCount = await GetAccessibleNotifications(userId)
            .Where(notification =>
                notification.ReadOn == null &&
                notification.DismissedOn == null &&
                (notification.ExpiresOn == null || notification.ExpiresOn > now))
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(notification => notification.ReadOn, now),
                cancellationToken);

        if (changedCount > 0)
            DispatchChange(userId, "MarkAllRead", entityId: null);

        return Result.Success();
    }

    public async Task<Result> MarkUnreadAsync(
        string userId,
        long id,
        CancellationToken cancellationToken = default)
    {
        var canAccess = await GetAccessibleNotifications(userId)
            .AnyAsync(item => item.Id == id && item.DismissedOn == null, cancellationToken);

        if (!canAccess)
            return Result.Failure(errors.NotificationNotFound);

        var notification = await context.Set<Notification>()
            .FirstAsync(item => item.Id == id && item.RecipientUserId == userId, cancellationToken);

        var changed = notification.ReadOn is not null;
        notification.ReadOn = null;
        await context.SaveChangesAsync(cancellationToken);

        if (changed)
            DispatchChange(userId, "MarkUnread", id.ToString(CultureInfo.InvariantCulture));

        return Result.Success();
    }

    public async Task<Result> MarkAllUnreadAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var changedCount = await GetAccessibleNotifications(userId)
            .Where(notification =>
                notification.ReadOn != null &&
                notification.DismissedOn == null &&
                (notification.ExpiresOn == null || notification.ExpiresOn > now))
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(notification => notification.ReadOn, (DateTime?)null),
                cancellationToken);

        if (changedCount > 0)
            DispatchChange(userId, "MarkAllUnread", entityId: null);

        return Result.Success();
    }

    public async Task<Result> DismissAsync(
        string userId,
        long id,
        CancellationToken cancellationToken = default)
    {
        var canAccess = await GetAccessibleNotifications(userId)
            .AnyAsync(item => item.Id == id, cancellationToken);

        if (!canAccess)
            return Result.Failure(errors.NotificationNotFound);

        var notification = await context.Set<Notification>()
            .FirstAsync(item => item.Id == id && item.RecipientUserId == userId, cancellationToken);

        var changed = notification.DismissedOn is null;
        notification.DismissedOn ??= DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        if (changed)
            DispatchChange(userId, "Dismiss", id.ToString(CultureInfo.InvariantCulture));

        return Result.Success();
    }

    public async Task<Result> DismissAllAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var changedCount = await GetAccessibleNotifications(userId)
            .Where(notification => notification.DismissedOn == null)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(notification => notification.DismissedOn, now),
                cancellationToken);

        if (changedCount > 0)
            DispatchChange(userId, "DismissAll", entityId: null);

        return Result.Success();
    }

    private void DispatchChange(string userId, string action, string? entityId)
    {
        var tenantId = currentActor.TenantId
            ?? throw new InvalidOperationException("A tenant is required to publish notification changes.");
        var companyId = currentActor.CompanyId
            ?? throw new InvalidOperationException("A company is required to publish notification changes.");

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<Notification>(
            RealtimeAudience.ForUserCompany(tenantId, companyId, userId),
            action,
            entityId));
    }

    private IQueryable<Notification> GetAccessibleNotifications(string userId)
    {
        var tenantId = currentActor.TenantId;
        var companyId = currentActor.CompanyId;
        if (string.IsNullOrWhiteSpace(tenantId) || companyId is not > 0)
            return context.Set<Notification>().Where(_ => false);

        return context.Set<Notification>().Where(notification =>
            notification.TenantId == tenantId &&
            notification.CompanyId == companyId &&
            notification.RecipientUserId == userId &&
            (from userRole in context.UserRoles.AsNoTracking()
             join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
             join roleClaim in context.RoleClaims.AsNoTracking() on role.Id equals roleClaim.RoleId
             where userRole.UserId == userId &&
                   !role.IsDeleted &&
                   (role.IsSystem || role.TenantId == notification.TenantId) &&
                   roleClaim.ClaimType == Permissions.Type &&
                   roleClaim.ClaimValue == notification.RequiredPermission
             select roleClaim).Any());
    }

    private static IQueryable<Notification> ApplyOrdering(
        IQueryable<Notification> query,
        string? column,
        string? direction)
    {
        var descending = !string.Equals(direction, "ASC", StringComparison.OrdinalIgnoreCase);

        return (column?.ToUpperInvariant(), descending) switch
        {
            ("READON", false) => query.OrderBy(notification => notification.ReadOn).ThenBy(notification => notification.Id),
            ("READON", true) => query.OrderByDescending(notification => notification.ReadOn).ThenByDescending(notification => notification.Id),
            ("SEVERITY", false) => query.OrderBy(notification => notification.Severity).ThenByDescending(notification => notification.Id),
            ("SEVERITY", true) => query.OrderByDescending(notification => notification.Severity).ThenByDescending(notification => notification.Id),
            ("CATEGORY", false) => query.OrderBy(notification => notification.Category).ThenByDescending(notification => notification.Id),
            ("CATEGORY", true) => query.OrderByDescending(notification => notification.Category).ThenByDescending(notification => notification.Id),
            ("CREATEDON", false) => query.OrderBy(notification => notification.CreatedOn).ThenBy(notification => notification.Id),
            _ => query.OrderByDescending(notification => notification.CreatedOn).ThenByDescending(notification => notification.Id)
        };
    }
}
