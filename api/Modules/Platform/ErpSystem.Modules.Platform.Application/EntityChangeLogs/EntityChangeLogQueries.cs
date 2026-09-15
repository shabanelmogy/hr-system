using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;

namespace ErpSystem.Modules.Platform.Application.EntityChangeLogs;

public sealed record GetAllEntityChangeLogsQuery : IQuery<List<EntityChangeLogsResponse>>;

public sealed record GetEntityChangeLogsQuery(string EntityName, int EntityId)
    : IQuery<List<EntityChangeLogsResponse>>;

public sealed class GetAllEntityChangeLogsQueryHandler(IEntityChangeLogService changeLogs)
    : IQueryHandler<GetAllEntityChangeLogsQuery, List<EntityChangeLogsResponse>>
{
    public Task<List<EntityChangeLogsResponse>> Handle(
        GetAllEntityChangeLogsQuery query,
        CancellationToken cancellationToken) =>
        changeLogs.GetChangeLogKeyValuesAsync();
}

public sealed class GetEntityChangeLogsQueryHandler(IEntityChangeLogService changeLogs)
    : IQueryHandler<GetEntityChangeLogsQuery, List<EntityChangeLogsResponse>>
{
    public Task<List<EntityChangeLogsResponse>> Handle(
        GetEntityChangeLogsQuery query,
        CancellationToken cancellationToken) =>
        changeLogs.GetChangeLogsByEntityAsync(query.EntityName, query.EntityId, cancellationToken);
}
