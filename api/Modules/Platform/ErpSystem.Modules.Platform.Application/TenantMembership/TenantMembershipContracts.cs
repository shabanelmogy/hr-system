using ErpSystem.Modules.Platform.Application.Tenancy;

namespace ErpSystem.Modules.Platform.Application.TenantMembership;

/// <summary>
/// Raw user-to-tenant membership supplied by Platform persistence. Eligibility
/// policy is owned by Platform application code rather than by the persistence source.
/// </summary>
public sealed record TenantMembershipSnapshot(
    string TenantId,
    string Identifier,
    string Name,
    bool IsDefault,
    bool IsActive,
    TenantSubscriptionStatus SubscriptionStatus);

/// <summary>
/// Stable Platform-owned tenant option used by authentication selection flows.
/// </summary>
public sealed record TenantMembershipOption(
    string Id,
    string Identifier,
    string Name);

/// <summary>
/// Platform persistence source for user-to-tenant membership.
/// </summary>
public interface ITenantMembershipSource
{
    Task<IReadOnlyList<TenantMembershipSnapshot>> GetAsync(
        string userId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Platform-owned application port for tenant-selection membership policy.
/// </summary>
public interface ITenantMembershipService
{
    Task<IReadOnlyList<TenantMembershipOption>> GetAvailableTenantsAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> HasTenantAccessAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default);
}
