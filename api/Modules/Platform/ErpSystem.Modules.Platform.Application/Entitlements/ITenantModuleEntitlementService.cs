using ErpSystem.Modules.Platform.Contracts.Entitlements;

namespace ErpSystem.Modules.Platform.Application.Entitlements;

/// <summary>
/// Platform-owned application port for tenant module entitlements.
/// </summary>
public interface ITenantModuleEntitlementService
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
