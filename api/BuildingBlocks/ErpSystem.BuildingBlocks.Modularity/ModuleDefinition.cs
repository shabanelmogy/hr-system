namespace ErpSystem.BuildingBlocks.Modularity;

/// <summary>Stable, transport-neutral metadata for an installed ERP module.</summary>
public sealed record ModuleDefinition(
    string Code,
    string Name,
    IReadOnlyList<SubmoduleDefinition> Submodules,
    bool IsDefault = false)
{
    /// <summary>
    /// Stable release version of the module metadata/contract. ModuleCatalog
    /// validates the value as a release semantic version (major.minor.patch).
    /// </summary>
    public string Version { get; init; } = "1.0.0";

    /// <summary>
    /// Installed module codes that must be present before this module can start.
    /// These are composition dependencies only; they do not grant tenant access
    /// or user permissions.
    /// </summary>
    public IReadOnlyList<string> RequiredModuleDependencies { get; init; } = [];

    /// <summary>
    /// Installed module codes that should start first when present. Missing
    /// optional modules are allowed and do not affect tenant entitlements.
    /// </summary>
    public IReadOnlyList<string> OptionalModuleDependencies { get; init; } = [];

    /// <summary>
    /// Whether this module is a user-facing application that may be returned by
    /// launcher/catalog APIs. Technical composition modules can participate in
    /// dependency validation and lifecycle ordering while remaining hidden.
    /// </summary>
    public bool IsUserVisible { get; init; } = true;

    /// <summary>
    /// Whether tenants may be granted this module as a commercial/application
    /// entitlement. This is independent from technical module dependencies and
    /// from user authorization inside an entitled module.
    /// </summary>
    public bool AllowsTenantEntitlement { get; init; } = true;
}

/// <summary>
/// Defines how a permission is authorized after its JWT claim has been verified.
/// </summary>
public enum PermissionAccessMode
{
    /// <summary>
    /// Tenant/company scope, a live role-permission check, and a matching tenant
    /// module/submodule entitlement are all required.
    /// </summary>
    TenantEntitlement = 0,

    /// <summary>
    /// Tenant/company scope and a live role-permission check are required, but
    /// commercial module entitlement is not. Use for tenant-facing Platform capabilities.
    /// </summary>
    Tenant = 1,

    /// <summary>
    /// The permission claim is sufficient at the permission-policy layer. Endpoint
    /// role/policy attributes remain responsible for any super-admin restriction.
    /// </summary>
    Global = 2
}

/// <summary>Sellable, navigable, or technical capability owned by a module.</summary>
public sealed record SubmoduleDefinition(
    string Code,
    string Name,
    IReadOnlyList<string> RequiredPermissions,
    string? EntryPath = null,
    PermissionAccessMode PermissionAccessMode = PermissionAccessMode.TenantEntitlement);