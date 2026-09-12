using ErpSystem.Modules.HR.Application.Features.Platform.Notifications.Contracts;
using ErpSystem.Modules.HR.Application.Features.Platform.Notifications.Errors;
using ErpSystem.Modules.HR.Application.Features.Platform.Notifications.Services;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.Platform.Contracts.Notifications;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.Notifications.Services;

/// <summary>
/// Legacy HR application/wire facade. Generic inbox lifecycle is Platform-owned;
/// this type only translates the existing HR Result/DTO contract and actor scope.
/// </summary>
public sealed class NotificationService(
    INotificationInboxService inbox,
    NotificationErrors errors,
    ICurrentActor currentActor) : INotificationService
{
    public async Task<Result<NotificationPageResponse>> GetAsync(
        string userId,
        NotificationQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = await inbox.GetAsync(
            userId,
            Scope(),
            new NotificationInboxQuery(
                request.PageNumber,
                request.PageSize,
                (NotificationInboxReadStatus)(int)request.Status,
                request.Category,
                request.Severity,
                request.ColumnName,
                request.SortDirection),
            cancellationToken).ConfigureAwait(false);

        var totalPages = (int)Math.Ceiling(page.TotalCount / (double)page.PageSize);
        return Result.Success(new NotificationPageResponse(
            page.Items.Select(ToResponse).ToArray(),
            new MetaData
            {
                TotalCount = page.TotalCount,
                PageNumber = page.PageNumber,
                CurrentPage = page.PageNumber,
                PageSize = page.PageSize,
                TotalPages = totalPages
            }));
    }

    public async Task<Result<int>> GetUnreadCountAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        Result.Success(await inbox.GetUnreadCountAsync(userId, Scope(), cancellationToken).ConfigureAwait(false));

    public Task<Result> MarkReadAsync(string userId, long id, CancellationToken cancellationToken = default) =>
        MutateAsync(() => inbox.MarkReadAsync(userId, Scope(), id, cancellationToken));

    public Task<Result> MarkUnreadAsync(string userId, long id, CancellationToken cancellationToken = default) =>
        MutateAsync(() => inbox.MarkUnreadAsync(userId, Scope(), id, cancellationToken));

    public async Task<Result> MarkAllReadAsync(string userId, CancellationToken cancellationToken = default)
    {
        await inbox.MarkAllReadAsync(userId, Scope(), cancellationToken).ConfigureAwait(false);
        return Result.Success();
    }

    public async Task<Result> MarkAllUnreadAsync(string userId, CancellationToken cancellationToken = default)
    {
        await inbox.MarkAllUnreadAsync(userId, Scope(), cancellationToken).ConfigureAwait(false);
        return Result.Success();
    }

    public Task<Result> DismissAsync(string userId, long id, CancellationToken cancellationToken = default) =>
        MutateAsync(() => inbox.DismissAsync(userId, Scope(), id, cancellationToken));

    public async Task<Result> DismissAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        await inbox.DismissAllAsync(userId, Scope(), cancellationToken).ConfigureAwait(false);
        return Result.Success();
    }

    private async Task<Result> MutateAsync(Func<Task<NotificationStateMutation>> action)
    {
        var result = await action().ConfigureAwait(false);
        return result.Found ? Result.Success() : Result.Failure(errors.NotificationNotFound);
    }

    private NotificationScope Scope() => new(currentActor.TenantId, currentActor.CompanyId);

    private static NotificationResponse ToResponse(NotificationRecord item) => new(
        item.Id,
        item.Category,
        item.EventType,
        item.Severity,
        item.TitleKey,
        item.MessageKey,
        item.Parameters,
        item.EntityType,
        item.EntityId,
        item.ActionUrl,
        item.ActorUserId,
        item.CorrelationId,
        item.CreatedOn,
        item.ReadOn,
        item.ExpiresOn);
}
