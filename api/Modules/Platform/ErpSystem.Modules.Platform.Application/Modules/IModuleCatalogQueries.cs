using ErpSystem.Modules.Platform.Contracts.Modules;

namespace ErpSystem.Modules.Platform.Application.Modules;

public interface IModuleCatalogQueries
{
    IReadOnlyList<ModuleCatalogItem> GetInstalled();

    Task<IReadOnlyList<ModuleCatalogItem>?> GetAccessibleAsync(
        CancellationToken cancellationToken = default);
}
