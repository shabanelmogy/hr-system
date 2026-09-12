using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Contracts.Entitlements;
using ErpSystem.Modules.Platform.Contracts.Modules;

namespace ErpSystem.Modules.Platform.Application.Modules;

internal sealed class ModuleCatalogPolicy(
    ModuleCatalog catalog,
    ITenantModuleEntitlementSource entitlements) : IModuleCatalogPolicy
{
    public IReadOnlyList<ModuleCatalogItem> GetInstalled() =>
        catalog.UserVisibleDefinitions.Select(ToContract).ToArray();

    public IReadOnlyList<TenantModuleEntitlementRequest> GetDefaultEntitlements() =>
        catalog.TenantEntitlementDefinitions
            .Where(definition => definition.IsDefault)
            .Select(definition => new TenantModuleEntitlementRequest(
                definition.Code,
                definition.Submodules.Select(submodule => submodule.Code).ToArray()))
            .ToArray();

    public async Task<IReadOnlyList<ModuleCatalogItem>> GetAccessibleAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var purchased = await entitlements.GetAsync(tenantId, cancellationToken).ConfigureAwait(false);
        var purchasedByModule = purchased.ToDictionary(
            item => item.ModuleCode,
            StringComparer.OrdinalIgnoreCase);
        var isSuperAdmin = await entitlements.IsSuperAdminAsync(userId, cancellationToken).ConfigureAwait(false);
        var userPermissions = isSuperAdmin
            ? new HashSet<string>(StringComparer.Ordinal)
            : await entitlements.GetUserPermissionsAsync(userId, tenantId, cancellationToken).ConfigureAwait(false);

        var accessible = new List<ModuleCatalogItem>();
        foreach (var definition in catalog.UserVisibleDefinitions)
        {
            if (isSuperAdmin)
            {
                accessible.Add(ToContract(definition));
                continue;
            }

            if (!purchasedByModule.TryGetValue(definition.Code, out var purchase))
                continue;

            if (definition.Submodules.Count == 0)
            {
                accessible.Add(ToContract(definition));
                continue;
            }

            var allowedSubmodules = new List<ModuleSubmoduleCatalogItem>();
            foreach (var submodule in definition.Submodules)
            {
                if (!purchase.SubmoduleCodes.Contains(submodule.Code, StringComparer.OrdinalIgnoreCase))
                    continue;

                var hasPermission = submodule.RequiredPermissions.Count == 0 ||
                    submodule.RequiredPermissions.Any(userPermissions.Contains);
                if (hasPermission)
                    allowedSubmodules.Add(ToContract(submodule));
            }

            if (allowedSubmodules.Count > 0)
            {
                accessible.Add(new ModuleCatalogItem(
                    definition.Code,
                    definition.Name,
                    allowedSubmodules,
                    definition.IsDefault));
            }
        }

        return accessible;
    }

    public bool TryResolvePermission(
        string permission,
        out string moduleCode,
        out string submoduleCode)
    {
        foreach (var definition in catalog.Definitions)
        {
            var submodule = definition.Submodules.FirstOrDefault(candidate =>
                candidate.RequiredPermissions.Contains(permission, StringComparer.Ordinal));
            if (submodule is not null)
            {
                moduleCode = definition.Code;
                submoduleCode = submodule.Code;
                return true;
            }
        }

        moduleCode = string.Empty;
        submoduleCode = string.Empty;
        return false;
    }

    public Task<bool> IsSuperAdminAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        entitlements.IsSuperAdminAsync(userId, cancellationToken);

    public bool IsValidEntitlement(
        IReadOnlyCollection<TenantModuleEntitlementRequest> requested,
        out string? invalidCode)
    {
        foreach (var item in requested)
        {
            var definition = catalog.FindDefinition(item.ModuleCode);
            if (definition is null || !definition.AllowsTenantEntitlement)
            {
                invalidCode = item.ModuleCode;
                return false;
            }

            foreach (var submoduleCode in item.SubmoduleCodes ?? [])
            {
                if (definition.Submodules.All(candidate =>
                        !string.Equals(candidate.Code, submoduleCode, StringComparison.OrdinalIgnoreCase)))
                {
                    invalidCode = $"{item.ModuleCode}:{submoduleCode}";
                    return false;
                }
            }
        }

        invalidCode = null;
        return true;
    }

    private static ModuleCatalogItem ToContract(ModuleDefinition definition) =>
        new(
            definition.Code,
            definition.Name,
            definition.Submodules.Select(ToContract).ToArray(),
            definition.IsDefault);

    private static ModuleSubmoduleCatalogItem ToContract(SubmoduleDefinition submodule) =>
        new(submodule.Code, submodule.Name, submodule.RequiredPermissions, submodule.EntryPath);
}
