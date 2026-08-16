using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed class JwtProvider(
    IOptions<JwtOptions> jwtSettings,
    ApplicationDbContext context) : IJwtProvider
{
    private readonly JwtOptions _jwtSettings = jwtSettings.Value;
    private readonly ApplicationDbContext _context = context;

    public async Task<AccessTokenResult> GenerateAccessTokenAsync(
        ApplicationUser user,
        string sessionId,
        int companyId,
        string tenantId)
    {
        var jwtId = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpireInMinutes);
        var tenant = await _context.Tenants
            .AsNoTracking()
            .Where(tenant => tenant.Id == tenantId)
            .Select(tenant => new { tenant.Name, tenant.PlanName })
            .SingleOrDefaultAsync();
        var tenantName = tenant?.Name ?? tenantId;
        var tenantPlanName = string.IsNullOrWhiteSpace(tenant?.PlanName)
            ? "Free"
            : tenant.PlanName.Trim();
        var claims = await GetAccessClaimsAsync(
            user,
            sessionId,
            jwtId,
            companyId,
            tenantId,
            tenantName,
            tenantPlanName);
        var token = CreateToken(claims, _jwtSettings.Audience, expiresAt);

        return new AccessTokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt,
            jwtId,
            tenantName,
            tenantPlanName);
    }

    public string GenerateRealtimeToken(ClaimsPrincipal principal)
    {
        var requiredClaims = new[]
        {
            ClaimTypes.NameIdentifier,
            ClaimTypes.Name,
            ClaimTypes.Email,
            JwtClaimNames.SessionId,
            JwtClaimNames.SecurityStamp,
            JwtClaimNames.TenantId,
            JwtClaimNames.TenantName,
            JwtClaimNames.TenantPlanName,
            JwtClaimNames.CompanyId
        };

        var claims = principal.Claims
            .Where(claim =>
                requiredClaims.Contains(claim.Type) ||
                claim.Type == ClaimTypes.Role ||
                claim.Type == Permissions.Type ||
                claim.Type == JwtClaimNames.TenantRoleId)
            .Select(claim => new Claim(claim.Type, claim.Value))
            .ToList();

        claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")));
        claims.Add(new Claim(JwtClaimNames.Scope, JwtClaimNames.RealtimeScope));

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.RealtimeExpireInMinutes);
        var token = CreateToken(claims, _jwtSettings.RealtimeAudience, expiresAt);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public TenantSelectionTokenResult GenerateTenantSelectionToken(ApplicationUser user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.TenantSelectionExpireInMinutes);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(JwtClaimNames.SecurityStamp, user.SecurityStamp ?? string.Empty),
            new Claim(JwtClaimNames.Scope, JwtClaimNames.TenantSelectionScope),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };

        var token = CreateToken(claims, _jwtSettings.Audience, expiresAt);
        return new TenantSelectionTokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt);
    }

    public ValidatedTenantSelectionToken? ValidateTenantSelectionToken(string token)
    {
        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(
                token,
                CreateValidationParameters(_jwtSettings, _jwtSettings.Audience),
                out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken ||
                !string.Equals(jwtToken.Header.Alg, SecurityAlgorithms.HmacSha256, StringComparison.Ordinal) ||
                principal.FindFirstValue(JwtClaimNames.Scope) != JwtClaimNames.TenantSelectionScope)
            {
                return null;
            }

            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var securityStamp = principal.FindFirstValue(JwtClaimNames.SecurityStamp);
            return string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(securityStamp)
                ? null
                : new ValidatedTenantSelectionToken(userId, securityStamp);
        }
        catch
        {
            return null;
        }
    }

    public CompanySelectionTokenResult GenerateCompanySelectionToken(ApplicationUser user, string tenantId)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.CompanySelectionExpireInMinutes);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(JwtClaimNames.TenantId, tenantId),
            new Claim(JwtClaimNames.SecurityStamp, user.SecurityStamp ?? string.Empty),
            new Claim(JwtClaimNames.Scope, JwtClaimNames.CompanySelectionScope),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };

        var token = CreateToken(claims, _jwtSettings.Audience, expiresAt);
        return new CompanySelectionTokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt);
    }

    public ValidatedCompanySelectionToken? ValidateCompanySelectionToken(string token)
    {
        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(
                token,
                CreateValidationParameters(_jwtSettings, _jwtSettings.Audience),
                out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken ||
                !string.Equals(jwtToken.Header.Alg, SecurityAlgorithms.HmacSha256, StringComparison.Ordinal) ||
                principal.FindFirstValue(JwtClaimNames.Scope) != JwtClaimNames.CompanySelectionScope)
            {
                return null;
            }

            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var tenantId = principal.FindFirstValue(JwtClaimNames.TenantId);
            var securityStamp = principal.FindFirstValue(JwtClaimNames.SecurityStamp);

            return string.IsNullOrWhiteSpace(userId) ||
                   string.IsNullOrWhiteSpace(tenantId) ||
                   string.IsNullOrWhiteSpace(securityStamp)
                ? null
                : new ValidatedCompanySelectionToken(userId, tenantId, securityStamp);
        }
        catch
        {
            return null;
        }
    }

    public ValidatedAccessToken? ValidateExpiredAccessToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(
                token,
                CreateValidationParameters(_jwtSettings, _jwtSettings.Audience, validateLifetime: false),
                out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken ||
                !string.Equals(jwtToken.Header.Alg, SecurityAlgorithms.HmacSha256, StringComparison.Ordinal))
            {
                return null;
            }

            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var jwtId = principal.FindFirstValue(JwtRegisteredClaimNames.Jti);
            var sessionId = principal.FindFirstValue(JwtClaimNames.SessionId);
            var securityStamp = principal.FindFirstValue(JwtClaimNames.SecurityStamp);
            var tenantId = principal.FindFirstValue(JwtClaimNames.TenantId);
            var companyIdValue = principal.FindFirstValue(JwtClaimNames.CompanyId);

            return string.IsNullOrWhiteSpace(userId) ||
                   string.IsNullOrWhiteSpace(jwtId) ||
                   string.IsNullOrWhiteSpace(sessionId) ||
                   string.IsNullOrWhiteSpace(securityStamp) ||
                   string.IsNullOrWhiteSpace(tenantId) ||
                   !int.TryParse(companyIdValue, out var companyId) ||
                   companyId <= 0
                ? null
                : new ValidatedAccessToken(userId, jwtId, sessionId, securityStamp, tenantId, companyId);
        }
        catch
        {
            return null;
        }
    }

    public static TokenValidationParameters CreateValidationParameters(
        JwtOptions options,
        string audience,
        bool validateLifetime = true) =>
        new()
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = validateLifetime,
            RequireExpirationTime = true,
            RequireSignedTokens = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key)),
            ValidIssuer = options.Issuer,
            ValidAudience = audience,
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            ClockSkew = TimeSpan.Zero,
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };

    private async Task<List<Claim>> GetAccessClaimsAsync(
        ApplicationUser user,
        string sessionId,
        string jwtId,
        int companyId,
        string tenantId,
        string tenantName,
        string tenantPlanName)
    {
        var roles = await (
            from userRole in _context.UserRoles.AsNoTracking()
            join role in _context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            where userRole.UserId == user.Id &&
                  (role.IsSystem ||
                   (!role.IsSystem && role.TenantId == tenantId && !role.IsDeleted))
            select new { role.Id, Name = role.Name!, role.IsSystem })
            .ToArrayAsync();
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(MyClaims.firstname, user.FirstName),
            new(MyClaims.lastname, user.LastName),
            new(JwtRegisteredClaimNames.Jti, jwtId),
            new(JwtClaimNames.SessionId, sessionId),
            new(JwtClaimNames.SecurityStamp, user.SecurityStamp ?? string.Empty),
            new(JwtClaimNames.TenantId, tenantId),
            new(JwtClaimNames.TenantName, tenantName),
            new(JwtClaimNames.TenantPlanName, tenantPlanName),
            new(JwtClaimNames.CompanyId, companyId.ToString(CultureInfo.InvariantCulture))
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role.Name)));
        claims.AddRange(roles
            .Where(role => !role.IsSystem)
            .Select(role => new Claim(JwtClaimNames.TenantRoleId, role.Id)));

        var roleIds = roles.Select(role => role.Id).ToArray();

        var roleClaims = await _context.RoleClaims
            .Where(rc => roleIds.Contains(rc.RoleId))
            .Select(rc => new { rc.ClaimType, rc.ClaimValue })
            .ToListAsync();

        claims.AddRange(roleClaims
            .Where(rc => rc.ClaimType != null && rc.ClaimValue != null)
            .Select(rc => new Claim(rc.ClaimType!, rc.ClaimValue!)));
        return claims
            .DistinctBy(claim => (claim.Type, claim.Value))
            .ToList();
    }

    private JwtSecurityToken CreateToken(
        IEnumerable<Claim> claims,
        string audience,
        DateTime expiresAt) =>
        new(
            issuer: _jwtSettings.Issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key)),
                SecurityAlgorithms.HmacSha256));
}
