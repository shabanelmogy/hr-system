using ErpSystem.Modules.Platform.Application.Entitlements;

namespace ErpSystem.Modules.Platform.Application.Modules;

/// <summary>
/// Platform-owned public description of an installed ERP module.
/// </summary>
public sealed record ModuleCatalogItem(
    string Code,
    string Name,
    IReadOnlyList<ModuleSubmoduleCatalogItem> Submodules,
    bool IsDefault);

public sealed record ModuleSubmoduleCatalogItem(
    string Code,
    string Name,
    IReadOnlyList<string> RequiredPermissions,
    string? EntryPath = null);

public sealed record ModulePermissionCatalogItem(
    string Permission,
    string ModuleCode,
    string SubmoduleCode,
    bool RequiresTenantScope,
    bool RequiresTenantEntitlement);

/// <summary>
/// Platform-owned module catalog policy. Installed module metadata comes from the
/// host registry while tenant/user accessibility is resolved through Platform
/// entitlement state. Business modules may depend on this public contract without
/// owning catalog composition themselves.
/// </summary>
public interface IModuleCatalogPolicy
{
    IReadOnlyList<ModuleCatalogItem> GetInstalled();

    IReadOnlyList<ModuleCatalogItem> GetTenantEntitlementCatalog();

    IReadOnlyList<TenantModuleEntitlementRequest> GetDefaultEntitlements();

    Task<IReadOnlyList<ModuleCatalogItem>> GetAccessibleAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default);

    IReadOnlySet<string> GetKnownPermissions();

    IReadOnlySet<string> GetTenantAssignablePermissions();

    bool TryResolvePermission(
        string permission,
        out ModulePermissionCatalogItem resolvedPermission);

    Task<bool> IsSuperAdminAsync(
        string userId,
        CancellationToken cancellationToken = default);

    bool IsValidEntitlement(
        IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
        out string? invalidCode);
}
