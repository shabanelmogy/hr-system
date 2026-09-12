namespace ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;

/// <summary>
/// Platform-owned change-log write projection. Persistence may remain in a
/// legacy module schema while consumers depend only on this neutral contract.
/// </summary>
public sealed class EntityChangeLogsRequest
{
    public int EntityId { get; set; }
    public string? EntityKey { get; set; }
    public string? EntityName { get; set; }
    public string? JsonOldValues { get; set; }
    public string? JsonNewValues { get; set; }
    public string ChangedById { get; set; } = string.Empty;
    public string ChangedByPc { get; set; } = string.Empty;
}

public sealed record EntityChangeLogsResponse(
    string ChangeLogId,
    string EntityName,
    string Key,
    string OldValue,
    string NewValue,
    string ChangedBy,
    DateTime ChangedAt,
    string ChangedByPc);

/// <summary>
/// Neutral persistence record for a change-log entry. The owning Platform
/// application decides what constitutes a change and captures actor/time data;
/// infrastructure adapters only persist this record in their physical store.
/// </summary>
public sealed record EntityChangeLogRecord(
    int EntityId,
    string? EntityKey,
    string EntityName,
    string? JsonOldValues,
    string? JsonNewValues,
    string ChangedById,
    string ChangedByPc,
    DateTime ChangedAt);

/// <summary>
/// Raw persisted/query projection. User existence is kept separate from the
/// optional display name so Platform can preserve the existing wire fallback
/// semantics without coupling the query adapter to presentation policy.
/// </summary>
public sealed record EntityChangeLogQueryRecord(
    int Id,
    int EntityId,
    string? EntityKey,
    string? EntityName,
    string? JsonOldValues,
    string? JsonNewValues,
    DateTime ChangedAt,
    string? ChangedByPc,
    bool ChangedByUserExists,
    string? ChangedByUserName);

public interface IEntityChangeLogStore
{
    Task AddAsync(
        EntityChangeLogRecord record,
        CancellationToken cancellationToken = default);
}

public interface IEntityChangeLogQueryStore
{
    Task<IReadOnlyList<EntityChangeLogQueryRecord>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EntityChangeLogQueryRecord>> GetByEntityAsync(
        string entityName,
        int entityId,
        CancellationToken cancellationToken = default);
}

public interface IEntityChangeLogService
{
    Task<EntityChangeLogsRequest?> CreateChangeLogAsync<TEntity>(
        int entityId,
        TEntity existingEntity,
        TEntity updatedEntity,
        CancellationToken cancellationToken = default)
        where TEntity : class;

    Task<EntityChangeLogsRequest?> CreateChangeLogAsync<TEntity>(
        string entityKey,
        string entityName,
        TEntity existingEntity,
        TEntity updatedEntity,
        CancellationToken cancellationToken = default)
        where TEntity : class;

    Task<EntityChangeLogsRequest?> CreateChangeLogAsync(
        int entityId,
        string entityName,
        object existingEntity,
        object updatedEntity,
        CancellationToken cancellationToken = default);

    Task<List<EntityChangeLogsResponse>> GetChangeLogKeyValuesAsync();

    Task<List<EntityChangeLogsResponse>> GetChangeLogsByEntityAsync(
        string entityName,
        int entityId,
        CancellationToken cancellationToken = default);
}
