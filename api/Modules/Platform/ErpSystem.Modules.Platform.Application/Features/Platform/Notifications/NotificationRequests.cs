using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Errors;
using ErpSystem.Modules.Platform.Application.Notifications;

namespace ErpSystem.Modules.Platform.Application.Features.Platform.Notifications;

public sealed record GetNotificationsQuery(string UserId, NotificationQueryRequest Request)
    : IQuery<Result<NotificationPageResponse>>;

public sealed record GetUnreadNotificationCountQuery(string UserId) : IQuery<Result<int>>;

public sealed record MarkNotificationReadCommand(string UserId, long Id) : ICommand<Result>;

public sealed record MarkNotificationUnreadCommand(string UserId, long Id) : ICommand<Result>;

public sealed record MarkAllNotificationsReadCommand(string UserId) : ICommand<Result>;

public sealed record MarkAllNotificationsUnreadCommand(string UserId) : ICommand<Result>;

public sealed record DismissNotificationCommand(string UserId, long Id) : ICommand<Result>;

public sealed record DismissAllNotificationsCommand(string UserId) : ICommand<Result>;

public sealed class GetNotificationsQueryHandler(
    INotificationInboxService inbox,
    ICurrentExecutionContext executionContext)
    : IQueryHandler<GetNotificationsQuery, Result<NotificationPageResponse>>
{
    public async Task<Result<NotificationPageResponse>> Handle(
        GetNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        var page = await inbox.GetAsync(
            request.UserId,
            NotificationRequestMapping.Scope(executionContext),
            new NotificationInboxQuery(
                request.Request.PageNumber,
                request.Request.PageSize,
                (NotificationInboxReadStatus)(int)request.Request.Status,
                request.Request.Category,
                request.Request.Severity,
                request.Request.ColumnName,
                request.Request.SortDirection),
            cancellationToken).ConfigureAwait(false);

        var totalPages = (int)Math.Ceiling(page.TotalCount / (double)page.PageSize);
        return Result.Success(new NotificationPageResponse(
            page.Items.Select(NotificationRequestMapping.ToResponse).ToArray(),
            new MetaData
            {
                TotalCount = page.TotalCount,
                PageNumber = page.PageNumber,
                CurrentPage = page.PageNumber,
                PageSize = page.PageSize,
                TotalPages = totalPages
            }));
    }
}

public sealed class GetUnreadNotificationCountQueryHandler(
    INotificationInboxService inbox,
    ICurrentExecutionContext executionContext)
    : IQueryHandler<GetUnreadNotificationCountQuery, Result<int>>
{
    public async Task<Result<int>> Handle(
        GetUnreadNotificationCountQuery request,
        CancellationToken cancellationToken) =>
        Result.Success(await inbox.GetUnreadCountAsync(
            request.UserId,
            NotificationRequestMapping.Scope(executionContext),
            cancellationToken).ConfigureAwait(false));
}

public sealed class MarkNotificationReadCommandHandler(
    INotificationInboxService inbox,
    ICurrentExecutionContext executionContext,
    NotificationErrors errors)
    : ICommandHandler<MarkNotificationReadCommand, Result>
{
    public async Task<Result> Handle(MarkNotificationReadCommand command, CancellationToken cancellationToken) =>
        NotificationRequestMapping.ToResult(
            await inbox.MarkReadAsync(
                command.UserId,
                NotificationRequestMapping.Scope(executionContext),
                command.Id,
                cancellationToken).ConfigureAwait(false),
            errors);
}

public sealed class MarkNotificationUnreadCommandHandler(
    INotificationInboxService inbox,
    ICurrentExecutionContext executionContext,
    NotificationErrors errors)
    : ICommandHandler<MarkNotificationUnreadCommand, Result>
{
    public async Task<Result> Handle(MarkNotificationUnreadCommand command, CancellationToken cancellationToken) =>
        NotificationRequestMapping.ToResult(
            await inbox.MarkUnreadAsync(
                command.UserId,
                NotificationRequestMapping.Scope(executionContext),
                command.Id,
                cancellationToken).ConfigureAwait(false),
            errors);
}

public sealed class MarkAllNotificationsReadCommandHandler(
    INotificationInboxService inbox,
    ICurrentExecutionContext executionContext)
    : ICommandHandler<MarkAllNotificationsReadCommand, Result>
{
    public async Task<Result> Handle(MarkAllNotificationsReadCommand command, CancellationToken cancellationToken)
    {
        await inbox.MarkAllReadAsync(
            command.UserId,
            NotificationRequestMapping.Scope(executionContext),
            cancellationToken).ConfigureAwait(false);
        return Result.Success();
    }
}

public sealed class MarkAllNotificationsUnreadCommandHandler(
    INotificationInboxService inbox,
    ICurrentExecutionContext executionContext)
    : ICommandHandler<MarkAllNotificationsUnreadCommand, Result>
{
    public async Task<Result> Handle(MarkAllNotificationsUnreadCommand command, CancellationToken cancellationToken)
    {
        await inbox.MarkAllUnreadAsync(
            command.UserId,
            NotificationRequestMapping.Scope(executionContext),
            cancellationToken).ConfigureAwait(false);
        return Result.Success();
    }
}

public sealed class DismissNotificationCommandHandler(
    INotificationInboxService inbox,
    ICurrentExecutionContext executionContext,
    NotificationErrors errors)
    : ICommandHandler<DismissNotificationCommand, Result>
{
    public async Task<Result> Handle(DismissNotificationCommand command, CancellationToken cancellationToken) =>
        NotificationRequestMapping.ToResult(
            await inbox.DismissAsync(
                command.UserId,
                NotificationRequestMapping.Scope(executionContext),
                command.Id,
                cancellationToken).ConfigureAwait(false),
            errors);
}

public sealed class DismissAllNotificationsCommandHandler(
    INotificationInboxService inbox,
    ICurrentExecutionContext executionContext)
    : ICommandHandler<DismissAllNotificationsCommand, Result>
{
    public async Task<Result> Handle(DismissAllNotificationsCommand command, CancellationToken cancellationToken)
    {
        await inbox.DismissAllAsync(
            command.UserId,
            NotificationRequestMapping.Scope(executionContext),
            cancellationToken).ConfigureAwait(false);
        return Result.Success();
    }
}

internal static class NotificationRequestMapping
{
    public static NotificationScope Scope(ICurrentExecutionContext executionContext) =>
        new(executionContext.TenantId, executionContext.CompanyId);

    public static Result ToResult(NotificationStateMutation mutation, NotificationErrors errors) =>
        mutation.Found ? Result.Success() : Result.Failure(errors.NotificationNotFound);

    public static NotificationResponse ToResponse(NotificationRecord item) => new(
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
