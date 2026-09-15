using ErpSystem.BuildingBlocks.Context;

namespace ErpSystem.Modules.Platform.Application.Modules;

public sealed record GetInstalledModulesQuery : IQuery<IReadOnlyList<ModuleCatalogItem>>;

public sealed record GetTenantEntitlementModulesQuery : IQuery<IReadOnlyList<ModuleCatalogItem>>;

public sealed record GetAccessibleModulesQuery : IQuery<IReadOnlyList<ModuleCatalogItem>?>;

public sealed class GetInstalledModulesQueryHandler(IModuleCatalogPolicy catalog)
    : IQueryHandler<GetInstalledModulesQuery, IReadOnlyList<ModuleCatalogItem>>
{
    public Task<IReadOnlyList<ModuleCatalogItem>> Handle(
        GetInstalledModulesQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(catalog.GetInstalled());
}

public sealed class GetTenantEntitlementModulesQueryHandler(IModuleCatalogPolicy catalog)
    : IQueryHandler<GetTenantEntitlementModulesQuery, IReadOnlyList<ModuleCatalogItem>>
{
    public Task<IReadOnlyList<ModuleCatalogItem>> Handle(
        GetTenantEntitlementModulesQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(catalog.GetTenantEntitlementCatalog());
}

public sealed class GetAccessibleModulesQueryHandler(
    IModuleCatalogPolicy catalog,
    ICurrentExecutionContext executionContext)
    : IQueryHandler<GetAccessibleModulesQuery, IReadOnlyList<ModuleCatalogItem>?>
{
    public async Task<IReadOnlyList<ModuleCatalogItem>?> Handle(
        GetAccessibleModulesQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(executionContext.UserId) ||
            string.IsNullOrWhiteSpace(executionContext.TenantId))
        {
            return null;
        }

        return await catalog.GetAccessibleAsync(
            executionContext.UserId,
            executionContext.TenantId,
            cancellationToken).ConfigureAwait(false);
    }
}
