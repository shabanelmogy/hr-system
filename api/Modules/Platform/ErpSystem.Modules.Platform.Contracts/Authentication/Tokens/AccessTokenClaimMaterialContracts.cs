namespace ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;

/// <summary>
/// Neutral user state already loaded by the authentication flow. Platform owns
/// the token claim shape without depending on the current Identity persistence type.
/// </summary>
public sealed record AccessTokenUserSnapshot(
    string UserId,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    string SecurityStamp);

/// <summary>Raw tenant metadata supplied by the current persistence owner.</summary>
public sealed record AccessTokenTenantSnapshot(
    string TenantId,
    string Name,
    string? PlanName);

/// <summary>Raw assigned role state; tenant eligibility is evaluated by Platform.</summary>
public sealed record AccessTokenRoleSnapshot(
    string Id,
    string Name,
    string? TenantId,
    bool IsSystem,
    bool IsDeleted);

/// <summary>Raw role claim state. Null values are deliberately preserved at the source seam.</summary>
public sealed record AccessTokenRoleClaimSnapshot(
    string RoleId,
    string? ClaimType,
    string? ClaimValue);

/// <summary>
/// Persistence-neutral claim-material state. HR currently supplies this while
/// tenant/Identity/role tables remain physically HR-owned.
/// </summary>
public sealed record AccessTokenClaimMaterialSourceSnapshot(
    AccessTokenTenantSnapshot? Tenant,
    IReadOnlyList<AccessTokenRoleSnapshot> Roles,
    IReadOnlyList<AccessTokenRoleClaimSnapshot> RoleClaims);

public interface IAccessTokenClaimMaterialSource
{
    Task<AccessTokenClaimMaterialSourceSnapshot> GetAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default);
}

/// <summary>Neutral claim pair consumed by the existing JWT signing facade.</summary>
public sealed record AccessTokenClaimValue(string Type, string Value);

public sealed record AccessTokenClaimMaterialRequest(
    AccessTokenUserSnapshot User,
    string SessionId,
    string JwtId,
    int CompanyId,
    string TenantId);

public sealed record AccessTokenClaimMaterialResult(
    string TenantName,
    string TenantPlanName,
    IReadOnlyList<AccessTokenClaimValue> Claims);

public interface IAccessTokenClaimMaterialService
{
    Task<AccessTokenClaimMaterialResult> BuildAsync(
        AccessTokenClaimMaterialRequest request,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Stable custom access-token claim names. Values intentionally match the
/// existing JWT wire contract exactly.
/// </summary>
public static class AccessTokenClaimNames
{
    public const string FirstName = AuthenticationTokenClaimNames.FirstName;
    public const string LastName = AuthenticationTokenClaimNames.LastName;
    public const string JwtId = AuthenticationTokenClaimNames.JwtId;
    public const string SessionId = AuthenticationTokenClaimNames.SessionId;
    public const string SecurityStamp = AuthenticationTokenClaimNames.SecurityStamp;
    public const string TenantId = AuthenticationTokenClaimNames.TenantId;
    public const string TenantName = AuthenticationTokenClaimNames.TenantName;
    public const string TenantPlanName = AuthenticationTokenClaimNames.TenantPlanName;
    public const string CompanyId = AuthenticationTokenClaimNames.CompanyId;
    public const string TenantRoleId = AuthenticationTokenClaimNames.TenantRoleId;
}
