using HrManagementSystem.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Features.Platform.Notifications.Entities;
using HrManagementSystem.Features.Platform.Notifications.Errors;
using HrManagementSystem.Shared.Paginations;

namespace HrManagementSystem.Features.Platform.Notifications.Services;

public sealed class NotificationService(
    ApplicationDbContext context,
    NotificationErrors errors,
    IMapper mapper) : INotificationService
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

        var page = await PagedList<Notification>.ToPagedList(
            query,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

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

        notification.ReadOn ??= DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> MarkAllReadAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        await GetAccessibleNotifications(userId)
            .Where(notification =>
                notification.ReadOn == null &&
                notification.DismissedOn == null &&
                (notification.ExpiresOn == null || notification.ExpiresOn > now))
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(notification => notification.ReadOn, now),
                cancellationToken);

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

        notification.ReadOn = null;
        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> MarkAllUnreadAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        await GetAccessibleNotifications(userId)
            .Where(notification =>
                notification.ReadOn != null &&
                notification.DismissedOn == null &&
                (notification.ExpiresOn == null || notification.ExpiresOn > now))
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(notification => notification.ReadOn, (DateTime?)null),
                cancellationToken);

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

        notification.DismissedOn ??= DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> DismissAllAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        await GetAccessibleNotifications(userId)
            .Where(notification => notification.DismissedOn == null)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(notification => notification.DismissedOn, now),
                cancellationToken);

        return Result.Success();
    }

    private IQueryable<Notification> GetAccessibleNotifications(string userId)
    {
        var currentPermissions =
            from userRole in context.UserRoles.AsNoTracking()
            join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            join roleClaim in context.RoleClaims.AsNoTracking() on role.Id equals roleClaim.RoleId
            where userRole.UserId == userId &&
                  !role.IsDeleted &&
                  roleClaim.ClaimType == Permissions.Type &&
                  roleClaim.ClaimValue != null
            select roleClaim.ClaimValue!;

        return context.Set<Notification>().Where(notification =>
            notification.RecipientUserId == userId &&
            currentPermissions.Contains(notification.RequiredPermission));
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
