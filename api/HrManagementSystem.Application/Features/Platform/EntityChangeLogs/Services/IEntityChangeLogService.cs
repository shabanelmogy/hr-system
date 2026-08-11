using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Contracts;

namespace HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Services
{
    public interface IEntityChangeLogService
    {
        Task<EntityChangeLogsRequest?> CreateChangeLogAsync<TEntity>(int entityId, TEntity existingEntity, TEntity updatedEntity) where TEntity : class;

        Task<List<EntityChangeLogsResponse>> GetChangeLogKeyValuesAsync();
    }
}
