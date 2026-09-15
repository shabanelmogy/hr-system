namespace ErpSystem.Modules.Platform.Application.EntityChangeLogs;

/// <summary>
/// Raw persisted/query projection used only by the Platform change-log application flow.
/// User existence is kept separate from the optional display name so application policy can
/// preserve the existing wire fallback semantics without coupling persistence to presentation.
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

public interface IEntityChangeLogQueryStore
{
    Task<IReadOnlyList<EntityChangeLogQueryRecord>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EntityChangeLogQueryRecord>> GetByEntityAsync(
        string entityName,
        int entityId,
        CancellationToken cancellationToken = default);
}
