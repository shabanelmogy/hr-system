namespace ErpSystem.Modules.Platform.Contracts.Tenancy;

/// <summary>
/// Platform-owned subscription status used at the tenant-access persistence seam.
/// </summary>
public enum TenantSubscriptionStatus
{
    Free = 0,
    Trial = 1,
    Active = 2,
    PastDue = 3,
    Suspended = 4,
    Expired = 5,
    Cancelled = 6
}

/// <summary>
/// Raw tenant subscription state supplied by the bounded context that currently
/// owns tenant persistence. Effective expiry/read-only policy is intentionally
/// not calculated by the source.
/// </summary>
public sealed record TenantAccessSnapshot(
    string TenantName,
    string? PlanName,
    TenantSubscriptionStatus SubscriptionStatus,
    DateTime? SubscriptionEndsOn);

/// <summary>
/// Stable tenant-access response consumed by request/session policy code.
/// </summary>
public sealed record TenantAccessResponse(
    string TenantName,
    string PlanName,
    string SubscriptionStatus,
    DateTime? SubscriptionEndsOn,
    bool IsReadOnly);

/// <summary>
/// Compatibility source for tenant subscription persistence. HR currently
/// supplies this source while the tenant table remains physically HR-owned.
/// </summary>
public interface ITenantAccessSource
{
    Task<TenantAccessSnapshot?> GetAsync(
        string tenantId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Platform-owned application port for effective tenant subscription access.
/// </summary>
public interface ITenantAccessService
{
    Task<TenantAccessResponse?> GetAsync(
        string tenantId,
        CancellationToken cancellationToken = default);
}
