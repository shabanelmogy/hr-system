using System.Security.Claims;
using System.Text;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using Microsoft.IdentityModel.Tokens;

namespace ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;

public sealed class JwtAuthenticationTokenValidationParametersFactory(
    AuthenticationTokenOptions options) : IAuthenticationTokenValidationParametersFactory
{
    private readonly AuthenticationTokenOptions _options = options;

    public string Audience => _options.Audience;

    public string RealtimeAudience => _options.RealtimeAudience;

    public TokenValidationParameters Create(string audience, bool validateLifetime = true) =>
        new()
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = validateLifetime,
            RequireExpirationTime = true,
            RequireSignedTokens = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key)),
            ValidIssuer = _options.Issuer,
            ValidAudience = audience,
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            ClockSkew = TimeSpan.Zero,
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };
}
