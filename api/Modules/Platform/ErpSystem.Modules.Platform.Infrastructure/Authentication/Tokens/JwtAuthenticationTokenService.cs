using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using Microsoft.IdentityModel.Tokens;

namespace ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;

public sealed class JwtAuthenticationTokenService(
    AuthenticationTokenOptions options,
    IAccessTokenClaimMaterialService claimMaterial,
    IAuthenticationTokenValidationParametersFactory validationParametersFactory)
    : IAuthenticationTokenService
{
    private readonly AuthenticationTokenOptions _options = options;

    public async Task<AuthenticationAccessTokenResult> GenerateAccessTokenAsync(
        AccessTokenUserSnapshot user,
        string sessionId,
        int companyId,
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var jwtId = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddMinutes(_options.ExpireInMinutes);
        var material = await claimMaterial.BuildAsync(new AccessTokenClaimMaterialRequest(
            user,
            sessionId,
            jwtId,
            companyId,
            tenantId), cancellationToken).ConfigureAwait(false);
        var token = CreateToken(material.Claims, _options.Audience, expiresAt);

        return new AuthenticationAccessTokenResult(
            WriteToken(token),
            expiresAt,
            jwtId,
            material.TenantName,
            material.TenantPlanName);
    }

    public AuthenticationIssuedToken GenerateTenantSelectionToken(AuthenticationTokenSubjectSnapshot user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_options.TenantSelectionExpireInMinutes);
        var jwtId = Guid.NewGuid().ToString("N");
        var claims = new[]
        {
            new AccessTokenClaimValue(ClaimTypes.NameIdentifier, user.UserId),
            new(AuthenticationTokenClaimNames.SecurityStamp, user.SecurityStamp),
            new(AuthenticationTokenClaimNames.Scope, AuthenticationTokenClaimNames.TenantSelectionScope),
            new(AuthenticationTokenClaimNames.JwtId, jwtId)
        };
        var token = CreateToken(claims, _options.Audience, expiresAt);
        return new AuthenticationIssuedToken(WriteToken(token), expiresAt, jwtId);
    }

    public AuthenticationValidatedTenantSelectionToken? ValidateTenantSelectionToken(string token)
    {
        var principal = ValidateToken(token, _options.Audience);
        if (principal is null ||
            FindValue(principal, AuthenticationTokenClaimNames.Scope) != AuthenticationTokenClaimNames.TenantSelectionScope)
        {
            return null;
        }

        var userId = FindValue(principal, ClaimTypes.NameIdentifier);
        var securityStamp = FindValue(principal, AuthenticationTokenClaimNames.SecurityStamp);
        var jwtId = FindValue(principal, AuthenticationTokenClaimNames.JwtId);
        return string.IsNullOrWhiteSpace(userId) ||
               string.IsNullOrWhiteSpace(securityStamp) ||
               string.IsNullOrWhiteSpace(jwtId)
            ? null
            : new AuthenticationValidatedTenantSelectionToken(userId, securityStamp, jwtId);
    }

    public AuthenticationIssuedToken GenerateCompanySelectionToken(
        AuthenticationTokenSubjectSnapshot user,
        string tenantId)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_options.CompanySelectionExpireInMinutes);
        var jwtId = Guid.NewGuid().ToString("N");
        var claims = new[]
        {
            new AccessTokenClaimValue(ClaimTypes.NameIdentifier, user.UserId),
            new(AuthenticationTokenClaimNames.TenantId, tenantId),
            new(AuthenticationTokenClaimNames.SecurityStamp, user.SecurityStamp),
            new(AuthenticationTokenClaimNames.Scope, AuthenticationTokenClaimNames.CompanySelectionScope),
            new(AuthenticationTokenClaimNames.JwtId, jwtId)
        };
        var token = CreateToken(claims, _options.Audience, expiresAt);
        return new AuthenticationIssuedToken(WriteToken(token), expiresAt, jwtId);
    }

    public AuthenticationValidatedCompanySelectionToken? ValidateCompanySelectionToken(string token)
    {
        var principal = ValidateToken(token, _options.Audience);
        if (principal is null ||
            FindValue(principal, AuthenticationTokenClaimNames.Scope) != AuthenticationTokenClaimNames.CompanySelectionScope)
        {
            return null;
        }

        var userId = FindValue(principal, ClaimTypes.NameIdentifier);
        var tenantId = FindValue(principal, AuthenticationTokenClaimNames.TenantId);
        var securityStamp = FindValue(principal, AuthenticationTokenClaimNames.SecurityStamp);
        var jwtId = FindValue(principal, AuthenticationTokenClaimNames.JwtId);
        return string.IsNullOrWhiteSpace(userId) ||
               string.IsNullOrWhiteSpace(tenantId) ||
               string.IsNullOrWhiteSpace(securityStamp) ||
               string.IsNullOrWhiteSpace(jwtId)
            ? null
            : new AuthenticationValidatedCompanySelectionToken(userId, tenantId, securityStamp, jwtId);
    }

    public string GenerateRealtimeToken(IReadOnlyCollection<AccessTokenClaimValue> principalClaims)
    {
        var requiredClaims = new HashSet<string>(StringComparer.Ordinal)
        {
            ClaimTypes.NameIdentifier,
            ClaimTypes.Name,
            AuthenticationTokenClaimNames.SessionId,
            AuthenticationTokenClaimNames.SecurityStamp,
            AuthenticationTokenClaimNames.TenantId,
            AuthenticationTokenClaimNames.CompanyId
        };
        var claims = principalClaims
            .Where(claim => requiredClaims.Contains(claim.Type))
            .ToList();
        claims.Add(new AccessTokenClaimValue(AuthenticationTokenClaimNames.JwtId, Guid.NewGuid().ToString("N")));
        claims.Add(new AccessTokenClaimValue(AuthenticationTokenClaimNames.Scope, AuthenticationTokenClaimNames.RealtimeScope));

        var expiresAt = DateTime.UtcNow.AddMinutes(_options.RealtimeExpireInMinutes);
        return WriteToken(CreateToken(claims, _options.RealtimeAudience, expiresAt));
    }

    public AuthenticationValidatedAccessToken? ValidateExpiredAccessToken(string token)
    {
        var principal = ValidateToken(token, _options.Audience, validateLifetime: false);
        if (principal is null)
            return null;

        var userId = FindValue(principal, ClaimTypes.NameIdentifier);
        var jwtId = FindValue(principal, AuthenticationTokenClaimNames.JwtId);
        var sessionId = FindValue(principal, AuthenticationTokenClaimNames.SessionId);
        var securityStamp = FindValue(principal, AuthenticationTokenClaimNames.SecurityStamp);
        var tenantId = FindValue(principal, AuthenticationTokenClaimNames.TenantId);
        var companyIdValue = FindValue(principal, AuthenticationTokenClaimNames.CompanyId);

        return string.IsNullOrWhiteSpace(userId) ||
               string.IsNullOrWhiteSpace(jwtId) ||
               string.IsNullOrWhiteSpace(sessionId) ||
               string.IsNullOrWhiteSpace(securityStamp) ||
               string.IsNullOrWhiteSpace(tenantId) ||
               !int.TryParse(companyIdValue, NumberStyles.Integer, CultureInfo.InvariantCulture, out var companyId) ||
               companyId <= 0
            ? null
            : new AuthenticationValidatedAccessToken(
                userId,
                jwtId,
                sessionId,
                securityStamp,
                tenantId,
                companyId);
    }

    private ClaimsPrincipal? ValidateToken(
        string token,
        string audience,
        bool validateLifetime = true)
    {
        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(
                token,
                validationParametersFactory.Create(audience, validateLifetime),
                out var validatedToken);
            return validatedToken is JwtSecurityToken jwtToken &&
                   string.Equals(jwtToken.Header.Alg, SecurityAlgorithms.HmacSha256, StringComparison.Ordinal)
                ? principal
                : null;
        }
        catch
        {
            return null;
        }
    }

    private JwtSecurityToken CreateToken(
        IEnumerable<AccessTokenClaimValue> claims,
        string audience,
        DateTime expiresAt) =>
        new(
            issuer: _options.Issuer,
            audience: audience,
            claims: claims.Select(claim => new Claim(claim.Type, claim.Value)),
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key)),
                SecurityAlgorithms.HmacSha256));

    private static string WriteToken(JwtSecurityToken token) =>
        new JwtSecurityTokenHandler().WriteToken(token);

    private static string? FindValue(ClaimsPrincipal principal, string claimType) =>
        principal.FindFirst(claimType)?.Value;
}
