using ErpSystem.Modules.Platform.Contracts.Tenancy;

namespace ErpSystem.Modules.Platform.Contracts.TenantMembership;

/// <summary>
/// Raw user-to-tenant membership supplied by the bounded context that currently
/// owns users, tenants and membership persistence. Eligibility policy is owned by
/// Platform application code rather than by the persistence source.
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
/// Compatibility source for user-to-tenant persistence. HR currently supplies
/// this source while the legacy tenant/membership tables remain physically in the hr schema.
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
