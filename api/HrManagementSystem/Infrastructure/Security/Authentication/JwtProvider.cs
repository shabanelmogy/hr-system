using HrManagementSystem.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed class JwtProvider(
    IOptions<JwtOptions> jwtSettings,
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    ApplicationDbContext context) : IJwtProvider
{
    private readonly JwtOptions _jwtSettings = jwtSettings.Value;
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly RoleManager<ApplicationRole> _roleManager = roleManager;
    private readonly ApplicationDbContext _context = context;

    public async Task<AccessTokenResult> GenerateAccessTokenAsync(
        ApplicationUser user,
        string sessionId)
    {
        var jwtId = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpireInMinutes);
        var claims = await GetAccessClaimsAsync(user, sessionId, jwtId);
        var token = CreateToken(claims, _jwtSettings.Audience, expiresAt);

        return new AccessTokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt,
            jwtId);
    }

    public string GenerateRealtimeToken(ClaimsPrincipal principal)
    {
        var requiredClaims = new[]
        {
            ClaimTypes.NameIdentifier,
            ClaimTypes.Name,
            ClaimTypes.Email,
            JwtClaimNames.SessionId,
            JwtClaimNames.SecurityStamp
        };

        var claims = principal.Claims
            .Where(claim => requiredClaims.Contains(claim.Type))
            .Select(claim => new Claim(claim.Type, claim.Value))
            .ToList();

        claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")));
        claims.Add(new Claim(JwtClaimNames.Scope, JwtClaimNames.RealtimeScope));

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.RealtimeExpireInMinutes);
        var token = CreateToken(claims, _jwtSettings.RealtimeAudience, expiresAt);
        return new JwtSecurityTokenHandler().WriteToken(token);
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

            return string.IsNullOrWhiteSpace(userId) ||
                   string.IsNullOrWhiteSpace(jwtId) ||
                   string.IsNullOrWhiteSpace(sessionId) ||
                   string.IsNullOrWhiteSpace(securityStamp)
                ? null
                : new ValidatedAccessToken(userId, jwtId, sessionId, securityStamp);
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
        string jwtId)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(MyClaims.firstname, user.FirstName),
            new(MyClaims.lastname, user.LastName),
            new(JwtRegisteredClaimNames.Jti, jwtId),
            new(JwtClaimNames.SessionId, sessionId),
            new(JwtClaimNames.SecurityStamp, user.SecurityStamp ?? string.Empty)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var roleIds = await _roleManager.Roles
            .Where(r => roles.Contains(r.Name!))
            .Select(r => r.Id)
            .ToListAsync();

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
