namespace ErpSystem.Modules.Platform.Application.Entitlements;

/// <summary>
/// Platform-owned public request describing the modules/submodules enabled for a tenant.
/// </summary>
public sealed record TenantModuleEntitlementRequest(
    string ModuleCode,
    IReadOnlyList<string>? SubmoduleCodes = null);

/// <summary>
/// Platform-owned public representation of a tenant module entitlement.
/// </summary>
public sealed record TenantModuleEntitlementResponse(
    string ModuleCode,
    IReadOnlyList<string> SubmoduleCodes);

/// <summary>
/// Source for entitlement state and permission checks. The backing rows are
/// owned by PlatformDbContext in the platform schema; ApplyAsync stages changes
/// on that context and the caller's unit of work commits or rolls them back
/// atomically. Platform owns the entitlement persistence and migrations.
/// </summary>
public interface ITenantModuleEntitlementSource
{
    Task ApplyAsync(
        string tenantId,
        IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
        CancellationToken cancellationToken = default);

    Task<bool> HasAccessAsync(
        string tenantId,
        string moduleCode,
        string submoduleCode,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TenantModuleEntitlementResponse>> GetAsync(
        string tenantId,
        CancellationToken cancellationToken = default);

    Task<bool> UserHasPermissionAsync(
        string userId,
        string tenantId,
        string permission,
        CancellationToken cancellationToken = default);

    Task<IReadOnlySet<string>> GetUserPermissionsAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default);

    Task<bool> IsSuperAdminAsync(
        string userId,
        CancellationToken cancellationToken = default);
}
