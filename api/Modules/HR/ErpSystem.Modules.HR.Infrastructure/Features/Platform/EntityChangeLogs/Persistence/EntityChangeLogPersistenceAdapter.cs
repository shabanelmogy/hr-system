using ErpSystem.Modules.HR.Domain.Platform.EntityChangeLogs.Entities;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.EntityChangeLogs.Persistence;

/// <summary>
/// Thin legacy persistence/query adapter over the existing HR EntityChangeLog
/// table and Identity user store. Change detection and response shaping are
/// owned by Platform.Application.
/// </summary>
public sealed class EntityChangeLogPersistenceAdapter(ApplicationDbContext context)
    : IEntityChangeLogStore, IEntityChangeLogQueryStore
{
    public async Task AddAsync(
        EntityChangeLogRecord record,
        CancellationToken cancellationToken = default)
    {
        context.EntityChangeLogs.Add(new EntityChangeLog
        {
            EntityId = record.EntityId,
            EntityKey = record.EntityKey,
            EntityName = record.EntityName,
            JsonOldValues = record.JsonOldValues,
            JsonNewValues = record.JsonNewValues,
            ChangedById = record.ChangedById,
            ChangedByPc = record.ChangedByPc,
            ChangedAt = record.ChangedAt
        });

        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<EntityChangeLogQueryRecord>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var rows = await (from log in context.EntityChangeLogs.AsNoTracking()
                          join user in context.Users.AsNoTracking()
                              on log.ChangedById equals user.Id into userGroup
                          from user in userGroup.DefaultIfEmpty()
                          select new
                          {
                              log.Id,
                              log.EntityId,
                              log.EntityKey,
                              log.EntityName,
                              log.JsonOldValues,
                              log.JsonNewValues,
                              log.ChangedAt,
                              log.ChangedByPc,
                              UserExists = user != null,
                              UserName = user != null ? user.UserName : null
                          })
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        return rows.Select(row => new EntityChangeLogQueryRecord(
            row.Id,
            row.EntityId,
            row.EntityKey,
            row.EntityName,
            row.JsonOldValues,
            row.JsonNewValues,
            row.ChangedAt,
            row.ChangedByPc,
            row.UserExists,
            row.UserName)).ToArray();
    }

    public async Task<IReadOnlyList<EntityChangeLogQueryRecord>> GetByEntityAsync(
        string entityName,
        int entityId,
        CancellationToken cancellationToken = default)
    {
        var rows = await (from log in context.EntityChangeLogs.AsNoTracking()
                          where log.EntityId == entityId &&
                                (log.EntityName == entityName ||
                                 (log.EntityName != null && log.EntityName.ToLower() == entityName.ToLower()))
                          join user in context.Users.AsNoTracking()
                              on log.ChangedById equals user.Id into userGroup
                          from user in userGroup.DefaultIfEmpty()
                          orderby log.ChangedAt descending
                          select new
                          {
                              log.Id,
                              log.EntityId,
                              log.EntityKey,
                              log.EntityName,
                              log.JsonOldValues,
                              log.JsonNewValues,
                              log.ChangedAt,
                              log.ChangedByPc,
                              UserExists = user != null,
                              UserName = user != null ? user.UserName : null
                          })
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        return rows.Select(row => new EntityChangeLogQueryRecord(
            row.Id,
            row.EntityId,
            row.EntityKey,
            row.EntityName,
            row.JsonOldValues,
            row.JsonNewValues,
            row.ChangedAt,
            row.ChangedByPc,
            row.UserExists,
            row.UserName)).ToArray();
    }
}
