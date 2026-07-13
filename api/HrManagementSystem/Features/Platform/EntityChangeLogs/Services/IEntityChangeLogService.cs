using HrManagementSystem.Features.Platform.EntityChangeLogs.Contracts;

namespace HrManagementSystem.Features.Platform.EntityChangeLogs.Services
{
    public interface IEntityChangeLogService
    {
        Task<EntityChangeLogsRequest> CreateChangeLogAsync<TEntity>(int entityId, TEntity existingEntity, TEntity updatedEntity) where TEntity : class;

        Task<List<EntityChangeLogsResponse>> GetChangeLogKeyValuesAsync();
    }
}
