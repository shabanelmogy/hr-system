using ErpSystem.Modules.Platform.Contracts.Entitlements;

namespace ErpSystem.Modules.Platform.Application.Entitlements;

internal sealed class TenantModuleEntitlementService(ITenantModuleEntitlementSource source)
    : ITenantModuleEntitlementService
{
    public Task ApplyAsync(
        string tenantId,
        IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
        CancellationToken cancellationToken = default) =>
        source.ApplyAsync(tenantId, entitlements, cancellationToken);

    public Task<bool> HasAccessAsync(
        string tenantId,
        string moduleCode,
        string submoduleCode,
        CancellationToken cancellationToken = default) =>
        source.HasAccessAsync(tenantId, moduleCode, submoduleCode, cancellationToken);

    public Task<IReadOnlyList<TenantModuleEntitlementResponse>> GetAsync(
        string tenantId,
        CancellationToken cancellationToken = default) =>
        source.GetAsync(tenantId, cancellationToken);

    public Task<bool> UserHasPermissionAsync(
        string userId,
        string tenantId,
        string permission,
        CancellationToken cancellationToken = default) =>
        source.UserHasPermissionAsync(userId, tenantId, permission, cancellationToken);

    public Task<IReadOnlySet<string>> GetUserPermissionsAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default) =>
        source.GetUserPermissionsAsync(userId, tenantId, cancellationToken);

    public Task<bool> IsSuperAdminAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        source.IsSuperAdminAsync(userId, cancellationToken);
}
