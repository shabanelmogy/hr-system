using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HrManagementSystem.Infrastructure.Security.Authentication;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using HrManagementSystem.Application.Common.Consts;

namespace HrManagementSystem.Tests;

public sealed class JwtProviderTests
{
    private const string SigningKey = "test-only-signing-key-with-more-than-thirty-two-characters";

    [Fact]
    public void ValidateExpiredAccessToken_AcceptsExpiredTokenFromConfiguredIssuerAndAudience()
    {
        var provider = CreateProvider();
        var token = CreateToken("HrManagementSystem", "HrManagementSystem.Web");

        var result = provider.ValidateExpiredAccessToken(token);

        Assert.NotNull(result);
        Assert.Equal("user-id", result.UserId);
        Assert.Equal("jwt-id", result.JwtId);
        Assert.Equal("session-id", result.SessionId);
        Assert.Equal("tenant-id", result.TenantId);
        Assert.Equal(7, result.CompanyId);
    }

    [Theory]
    [InlineData("another-issuer", "HrManagementSystem.Web")]
    [InlineData("HrManagementSystem", "another-audience")]
    public void ValidateExpiredAccessToken_RejectsWrongIssuerOrAudience(
        string issuer,
        string audience)
    {
        var provider = CreateProvider();
        var token = CreateToken(issuer, audience);

        Assert.Null(provider.ValidateExpiredAccessToken(token));
    }

    [Fact]
    public void CompanySelectionToken_RoundTripsUserAndTenantWithoutCompanyClaim()
    {
        var provider = CreateProvider();
        var user = new ApplicationUser
        {
            Id = "user-id",
            TenantId = "tenant-id",
            SecurityStamp = "security-stamp"
        };

        var issued = provider.GenerateCompanySelectionToken(user, user.TenantId);
        var validated = provider.ValidateCompanySelectionToken(issued.Token);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(issued.Token);

        Assert.NotNull(validated);
        Assert.Equal(user.Id, validated.UserId);
        Assert.Equal(user.TenantId, validated.TenantId);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == JwtClaimNames.CompanyId);
        Assert.True(issued.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public void TenantSelectionToken_RoundTripsUserWithoutTenantOrCompanyClaim()
    {
        var provider = CreateProvider();
        var user = new ApplicationUser
        {
            Id = "user-id",
            TenantId = "legacy-default-tenant",
            SecurityStamp = "security-stamp"
        };

        var issued = provider.GenerateTenantSelectionToken(user);
        var validated = provider.ValidateTenantSelectionToken(issued.Token);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(issued.Token);

        Assert.NotNull(validated);
        Assert.Equal(user.Id, validated.UserId);
        Assert.Equal(user.SecurityStamp, validated.SecurityStamp);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == JwtClaimNames.TenantId);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == JwtClaimNames.CompanyId);
        Assert.True(issued.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public void RealtimeToken_PreservesPermissionAndRoleClaimsForHubAudienceAssignment()
    {
        var provider = CreateProvider();
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, "user-id"),
            new Claim(ClaimTypes.Name, "user"),
            new Claim(ClaimTypes.Email, "user@example.com"),
            new Claim(JwtClaimNames.SessionId, "session-id"),
            new Claim(JwtClaimNames.SecurityStamp, "security-stamp"),
            new Claim(JwtClaimNames.TenantId, "tenant-id"),
            new Claim(JwtClaimNames.CompanyId, "7"),
            new Claim(ClaimTypes.Role, AppRoles.super_admin),
            new Claim(Permissions.Type, Permissions.ViewCountries),
            new Claim(Permissions.Type, Permissions.ViewStates)
        ], "Bearer"));

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(
            provider.GenerateRealtimeToken(principal));
        var permissions = jwt.Claims
            .Where(claim => claim.Type == Permissions.Type)
            .Select(claim => claim.Value)
            .ToHashSet(StringComparer.Ordinal);

        Assert.Equal(
            new HashSet<string>([Permissions.ViewCountries, Permissions.ViewStates]),
            permissions);
        Assert.Contains(jwt.Claims, claim =>
            claim.Type == ClaimTypes.Role && claim.Value == AppRoles.super_admin);
    }

    private static JwtProvider CreateProvider()
    {
        var options = Options.Create(new JwtOptions
        {
            Key = SigningKey,
            Issuer = "HrManagementSystem",
            Audience = "HrManagementSystem.Web",
            ExpireInMinutes = 10,
            RealtimeExpireInMinutes = 2
        });

        return new JwtProvider(options, null!, null!, null!);
    }

    private static string CreateToken(string issuer, string audience)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "user-id"),
            new Claim(JwtRegisteredClaimNames.Jti, "jwt-id"),
            new Claim(JwtClaimNames.SessionId, "session-id"),
            new Claim(JwtClaimNames.SecurityStamp, "security-stamp"),
            new Claim(JwtClaimNames.TenantId, "tenant-id"),
            new Claim(JwtClaimNames.CompanyId, "7")
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            notBefore: DateTime.UtcNow.AddMinutes(-20),
            expires: DateTime.UtcNow.AddMinutes(-10),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
                SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
