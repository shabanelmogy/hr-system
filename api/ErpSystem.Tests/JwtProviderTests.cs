using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ErpSystem.Modules.HR.Infrastructure.Security.Authentication;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using Microsoft.IdentityModel.Tokens;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;

namespace ErpSystem.Tests;

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
        Assert.Equal(issued.JwtId, validated.JwtId);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == AuthenticationTokenClaimNames.CompanyId);
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
        Assert.Equal(issued.JwtId, validated.JwtId);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == AuthenticationTokenClaimNames.TenantId);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == AuthenticationTokenClaimNames.CompanyId);
        Assert.True(issued.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public void RealtimeToken_OmitsAuthorizationExpansionClaimsAndStaysBelowIisQueryLimit()
    {
        var provider = CreateProvider();
        var sourceClaims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "user-id"),
            new Claim(ClaimTypes.Name, "user"),
            new Claim(ClaimTypes.Email, "user@example.com"),
            new Claim(AuthenticationTokenClaimNames.SessionId, "session-id"),
            new Claim(AuthenticationTokenClaimNames.SecurityStamp, "security-stamp"),
            new Claim(AuthenticationTokenClaimNames.TenantId, "tenant-id"),
            new Claim(AuthenticationTokenClaimNames.CompanyId, "7"),
            new Claim(ClaimTypes.Role, AppRoles.super_admin),
            new Claim(AuthenticationTokenClaimNames.TenantRoleId, "tenant-role-id"),
            new Claim(Permissions.Type, Permissions.ViewCountries),
            new Claim(Permissions.Type, Permissions.ViewStates)
        };
        sourceClaims.AddRange(Enumerable.Range(1, 500)
            .Select(index => new Claim(Permissions.Type, $"FutureFeature{index}:Manage")));
        var principal = new ClaimsPrincipal(new ClaimsIdentity(sourceClaims, "Bearer"));

        var token = provider.GenerateRealtimeToken(principal);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.True(token.Length < 2_048, $"Realtime token length was {token.Length} characters.");
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == Permissions.Type);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == ClaimTypes.Role);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == AuthenticationTokenClaimNames.TenantRoleId);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == ClaimTypes.Email);
        Assert.Contains(jwt.Claims, claim =>
            claim.Type == ClaimTypes.NameIdentifier && claim.Value == "user-id");
        Assert.Contains(jwt.Claims, claim =>
            claim.Type == AuthenticationTokenClaimNames.Scope && claim.Value == AuthenticationTokenClaimNames.RealtimeScope);
    }

    [Fact]
    public async Task AccessToken_PreservesWireClaimsAudienceSigningAndTimingWhileUsingPlatformMaterial()
    {
        var material = new RecordingClaimMaterialService
        {
            Result = new AccessTokenClaimMaterialResult(
                "Tenant One",
                "Business",
                [
                    new(ClaimTypes.Name, "user-name"),
                    new(ClaimTypes.Email, "user@example.com"),
                    new(ClaimTypes.NameIdentifier, "user-id"),
                    new(AuthenticationTokenClaimNames.FirstName, "First"),
                    new(AuthenticationTokenClaimNames.LastName, "Last"),
                    new(AuthenticationTokenClaimNames.SessionId, "session-id"),
                    new(AuthenticationTokenClaimNames.SecurityStamp, "security-stamp"),
                    new(AuthenticationTokenClaimNames.TenantId, "tenant-id"),
                    new(AuthenticationTokenClaimNames.TenantName, "Tenant One"),
                    new(AuthenticationTokenClaimNames.TenantPlanName, "Business"),
                    new(AuthenticationTokenClaimNames.CompanyId, "7"),
                    new(ClaimTypes.Role, "admin"),
                    new(AuthenticationTokenClaimNames.TenantRoleId, "role-1"),
                    new(Permissions.Type, Permissions.ViewCountries)
                ])
        };
        var provider = CreateProvider(material);
        var user = new ApplicationUser
        {
            Id = "user-id",
            UserName = "user-name",
            Email = "user@example.com",
            FirstName = "First",
            LastName = "Last",
            SecurityStamp = "security-stamp",
            TenantId = "legacy-tenant"
        };
        var before = DateTime.UtcNow;

        var issued = await provider.GenerateAccessTokenAsync(user, "session-id", 7, "tenant-id");
        var after = DateTime.UtcNow;
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(issued.Token);

        Assert.Equal("HrManagementSystem", jwt.Issuer);
        Assert.Equal(["HrManagementSystem.Web"], jwt.Audiences);
        Assert.Equal(SecurityAlgorithms.HmacSha256, jwt.Header.Alg);
        Assert.InRange(jwt.ValidFrom, before.AddSeconds(-1), after.AddSeconds(1));
        Assert.InRange(jwt.ValidTo, before.AddMinutes(10).AddSeconds(-1), after.AddMinutes(10).AddSeconds(1));
        Assert.Equal("Tenant One", issued.TenantName);
        Assert.Equal("Business", issued.TenantPlanName);
        Assert.Matches("^[0-9a-f]{32}$", issued.JwtId);

        Assert.NotNull(material.Request);
        var request = material.Request!;
        Assert.Equal("user-id", request.User.UserId);
        Assert.Equal("security-stamp", request.User.SecurityStamp);
        Assert.Equal("session-id", request.SessionId);
        Assert.Equal("tenant-id", request.TenantId);
        Assert.Equal(7, request.CompanyId);
        Assert.Equal(issued.JwtId, request.JwtId);

        Assert.Contains(jwt.Claims, claim => claim.Type == JwtRegisteredClaimNames.Jti && claim.Value == issued.JwtId);
        Assert.Contains(jwt.Claims, claim => claim.Type == ClaimTypes.Role && claim.Value == "admin");
        Assert.Contains(jwt.Claims, claim => claim.Type == AuthenticationTokenClaimNames.TenantRoleId && claim.Value == "role-1");
        Assert.Contains(jwt.Claims, claim => claim.Type == Permissions.Type && claim.Value == Permissions.ViewCountries);
    }

    private static JwtProvider CreateProvider(IAccessTokenClaimMaterialService? claimMaterial = null)
    {
        var options = new AuthenticationTokenOptions
        {
            Key = SigningKey,
            Issuer = "HrManagementSystem",
            Audience = "HrManagementSystem.Web",
            ExpireInMinutes = 10,
            RealtimeExpireInMinutes = 2
        };
        var validationFactory = new JwtAuthenticationTokenValidationParametersFactory(options);
        var tokenService = new JwtAuthenticationTokenService(
            options,
            claimMaterial ?? new UnusedClaimMaterialService(),
            validationFactory);

        return new JwtProvider(tokenService);
    }

    private static string CreateToken(string issuer, string audience)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "user-id"),
            new Claim(JwtRegisteredClaimNames.Jti, "jwt-id"),
            new Claim(AuthenticationTokenClaimNames.SessionId, "session-id"),
            new Claim(AuthenticationTokenClaimNames.SecurityStamp, "security-stamp"),
            new Claim(AuthenticationTokenClaimNames.TenantId, "tenant-id"),
            new Claim(AuthenticationTokenClaimNames.CompanyId, "7")
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

    private sealed class UnusedClaimMaterialService : IAccessTokenClaimMaterialService
    {
        public Task<AccessTokenClaimMaterialResult> BuildAsync(
            AccessTokenClaimMaterialRequest request,
            CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException("Claim material is not used by this test.");
    }

    private sealed class RecordingClaimMaterialService : IAccessTokenClaimMaterialService
    {
        public required AccessTokenClaimMaterialResult Result { get; init; }
        public AccessTokenClaimMaterialRequest? Request { get; private set; }

        public Task<AccessTokenClaimMaterialResult> BuildAsync(
            AccessTokenClaimMaterialRequest request,
            CancellationToken cancellationToken = default)
        {
            Request = request;
            var claims = Result.Claims
                .Append(new AccessTokenClaimValue(AccessTokenClaimNames.JwtId, request.JwtId))
                .ToArray();
            return Task.FromResult(Result with { Claims = claims });
        }
    }
}
