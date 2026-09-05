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
}
