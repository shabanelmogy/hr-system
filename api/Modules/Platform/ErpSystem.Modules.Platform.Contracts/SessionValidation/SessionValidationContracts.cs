using ErpSystem.Modules.Platform.Contracts.Tenancy;

namespace ErpSystem.Modules.Platform.Contracts.SessionValidation;

/// <summary>
/// Stable identity/session coordinates extracted from an already cryptographically
/// validated bearer token. Claim extraction remains a transport concern.
/// </summary>
public sealed record SessionValidationRequest(
    string UserId,
    string SessionId,
    string SecurityStamp,
    string TenantId,
    int CompanyId);

/// <summary>
/// Raw refresh-session persistence state. Activity is evaluated by Platform using
/// its TimeProvider rather than by the persistence adapter.
/// </summary>
public sealed record RefreshSessionSnapshot(
    string SessionId,
    int CompanyId,
    DateTime ExpiresOn,
    DateTime? RevokedOn);

/// <summary>
/// Raw state required to validate an authenticated session. HR currently supplies
/// this snapshot while Identity, tenant, company and refresh-token tables remain
/// physically HR-owned.
/// </summary>
public sealed record SessionValidationSnapshot(
    bool IsDisabled,
    DateTimeOffset? LockoutEnd,
    string? SecurityStamp,
    bool HasTenantMembership,
    bool IsTenantActive,
    TenantSubscriptionStatus? TenantSubscriptionStatus,
    bool HasCompanyAccess,
    bool IsCompanyActive,
    IReadOnlyList<RefreshSessionSnapshot> RefreshSessions);

/// <summary>
/// Compatibility persistence source for bearer-session state.
/// </summary>
public interface ISessionValidationSource
{
    Task<SessionValidationSnapshot?> GetAsync(
        string userId,
        string sessionId,
        string tenantId,
        int companyId,
        CancellationToken cancellationToken = default);
}

public sealed record SessionValidationResult(bool IsValid);

/// <summary>
/// Platform-owned application policy for determining whether a bearer session is
/// still valid after signature/lifetime validation has succeeded.
/// </summary>
public interface ISessionValidationService
{
    Task<SessionValidationResult> ValidateAsync(
        SessionValidationRequest request,
        CancellationToken cancellationToken = default);
}
