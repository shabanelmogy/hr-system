using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.Modules;

namespace ErpSystem.Modules.Platform.Application.Modules;

internal sealed class ModuleCatalogQueries(
    IModuleCatalogPolicy catalog,
    ICurrentExecutionContext executionContext) : IModuleCatalogQueries
{
    public IReadOnlyList<ModuleCatalogItem> GetInstalled() => catalog.GetInstalled();

    public Task<IReadOnlyList<ModuleCatalogItem>?> GetAccessibleAsync(
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(executionContext.UserId) ||
            string.IsNullOrWhiteSpace(executionContext.TenantId))
        {
            return Task.FromResult<IReadOnlyList<ModuleCatalogItem>?>(null);
        }

        return GetAccessibleCoreAsync(
            executionContext.UserId,
            executionContext.TenantId,
            cancellationToken);
    }

    private async Task<IReadOnlyList<ModuleCatalogItem>?> GetAccessibleCoreAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken) =>
        await catalog.GetAccessibleAsync(userId, tenantId, cancellationToken).ConfigureAwait(false);
}
