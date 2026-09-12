using System.ComponentModel.DataAnnotations;
using Microsoft.IdentityModel.Tokens;

namespace ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;

/// <summary>
/// Stable JWT configuration contract. Section name and defaults intentionally
/// preserve the existing wire configuration.
/// </summary>
public sealed class AuthenticationTokenOptions
{
    public const string SectionName = "JwtOptions";

    [Required, MinLength(32)]
    public string Key { get; set; } = string.Empty;

    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string Audience { get; set; } = string.Empty;

    [Range(1, 60)]
    public int ExpireInMinutes { get; set; } = 10;

    [Range(1, 5)]
    public int RealtimeExpireInMinutes { get; set; } = 2;

    [Range(1, 10)]
    public int CompanySelectionExpireInMinutes { get; set; } = 5;

    [Range(1, 10)]
    public int TenantSelectionExpireInMinutes { get; set; } = 5;

    public string RealtimeAudience => $"{Audience}:realtime";
}

/// <summary>Canonical token claim names and scope values.</summary>
public static class AuthenticationTokenClaimNames
{
    public const string FirstName = "firstname";
    public const string LastName = "lastname";
    public const string JwtId = "jti";
    public const string SessionId = "sid";
    public const string SecurityStamp = "security_stamp";
    public const string TenantId = "tenant_id";
    public const string TenantName = "tenant_name";
    public const string TenantPlanName = "tenant_plan";
    public const string CompanyId = "company_id";
    public const string TenantRoleId = "tenant_role_id";
    public const string Scope = "scope";
    public const string RealtimeScope = "signalr";
    public const string CompanySelectionScope = "company_selection";
    public const string TenantSelectionScope = "tenant_selection";
}

public sealed record AuthenticationTokenSubjectSnapshot(
    string UserId,
    string SecurityStamp);

public sealed record AuthenticationIssuedToken(
    string Token,
    DateTime ExpiresAt,
    string JwtId);

public sealed record AuthenticationAccessTokenResult(
    string Token,
    DateTime ExpiresAt,
    string JwtId,
    string TenantName,
    string TenantPlanName);

public sealed record AuthenticationValidatedTenantSelectionToken(
    string UserId,
    string SecurityStamp,
    string JwtId);

public sealed record AuthenticationValidatedCompanySelectionToken(
    string UserId,
    string TenantId,
    string SecurityStamp,
    string JwtId);

public sealed record AuthenticationValidatedAccessToken(
    string UserId,
    string JwtId,
    string SessionId,
    string SecurityStamp,
    string TenantId,
    int CompanyId);

public interface IAuthenticationTokenService
{
    Task<AuthenticationAccessTokenResult> GenerateAccessTokenAsync(
        AccessTokenUserSnapshot user,
        string sessionId,
        int companyId,
        string tenantId,
        CancellationToken cancellationToken = default);

    AuthenticationIssuedToken GenerateTenantSelectionToken(AuthenticationTokenSubjectSnapshot user);

    AuthenticationValidatedTenantSelectionToken? ValidateTenantSelectionToken(string token);

    AuthenticationIssuedToken GenerateCompanySelectionToken(
        AuthenticationTokenSubjectSnapshot user,
        string tenantId);

    AuthenticationValidatedCompanySelectionToken? ValidateCompanySelectionToken(string token);

    string GenerateRealtimeToken(IReadOnlyCollection<AccessTokenClaimValue> principalClaims);

    AuthenticationValidatedAccessToken? ValidateExpiredAccessToken(string token);
}

/// <summary>
/// Platform-owned factory used by ASP.NET bearer handlers. Keeping the factory
/// behind a contract lets the host/legacy HR registration consume Platform's
/// validation policy without reimplementing signing-key or algorithm rules.
/// </summary>
public interface IAuthenticationTokenValidationParametersFactory
{
    string Audience { get; }

    string RealtimeAudience { get; }

    TokenValidationParameters Create(string audience, bool validateLifetime = true);
}
