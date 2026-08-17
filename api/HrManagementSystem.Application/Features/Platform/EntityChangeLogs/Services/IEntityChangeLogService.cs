using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Contracts;

namespace HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Services
{
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

        Task<List<EntityChangeLogsResponse>> GetChangeLogKeyValuesAsync();
    }
}
