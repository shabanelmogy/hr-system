using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ErpSystem.Tests;

public sealed class PlatformAuthenticationTokenWireCompatibilityTests
{
    private const string SigningKey = "test-only-signing-key-with-more-than-thirty-two-characters";

    [Fact]
    public void ValidationFactory_PreservesIssuerAudiencesAlgorithmAndZeroClockSkew()
    {
        var options = CreateOptions();
        var factory = new JwtAuthenticationTokenValidationParametersFactory(options);

        var access = factory.Create(factory.Audience);
        var realtime = factory.Create(factory.RealtimeAudience);

        Assert.Equal("HrManagementSystem.Web", factory.Audience);
        Assert.Equal("HrManagementSystem.Web:realtime", factory.RealtimeAudience);
        Assert.Equal("HrManagementSystem", access.ValidIssuer);
        Assert.Equal("HrManagementSystem.Web", access.ValidAudience);
        Assert.Equal("HrManagementSystem.Web:realtime", realtime.ValidAudience);
        Assert.True(access.ValidateIssuerSigningKey);
        Assert.True(access.ValidateIssuer);
        Assert.True(access.ValidateAudience);
        Assert.True(access.ValidateLifetime);
        Assert.True(access.RequireExpirationTime);
        Assert.True(access.RequireSignedTokens);
        Assert.Equal(TimeSpan.Zero, access.ClockSkew);
        Assert.Equal([SecurityAlgorithms.HmacSha256], access.ValidAlgorithms);
        Assert.Equal(ClaimTypes.Name, access.NameClaimType);
        Assert.Equal(ClaimTypes.Role, access.RoleClaimType);

        var expiredAccess = factory.Create(factory.Audience, validateLifetime: false);
        Assert.False(expiredAccess.ValidateLifetime);
        Assert.True(expiredAccess.ValidateIssuerSigningKey);
        Assert.True(expiredAccess.ValidateIssuer);
        Assert.True(expiredAccess.ValidateAudience);
        Assert.True(expiredAccess.RequireSignedTokens);
    }

    [Fact]
    public async Task AccessToken_PreservesClaimsAudienceHs256JtiAndTiming()
    {
        var options = CreateOptions();
        var material = new CanonicalClaimMaterialService();
        var service = CreateService(options, material);
        var before = DateTime.UtcNow;

        var issued = await service.GenerateAccessTokenAsync(
            new AccessTokenUserSnapshot(
                "user-id",
                "user-name",
                "user@example.com",
                "First",
                "Last",
                "security-stamp"),
            "session-id",
            7,
            "tenant-id");
        var after = DateTime.UtcNow;
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(issued.Token);

        Assert.Equal("HrManagementSystem", jwt.Issuer);
        Assert.Equal(["HrManagementSystem.Web"], jwt.Audiences);
        Assert.Equal(SecurityAlgorithms.HmacSha256, jwt.Header.Alg);
        Assert.InRange(jwt.ValidFrom, before.AddSeconds(-1), after.AddSeconds(1));
        Assert.InRange(jwt.ValidTo, before.AddMinutes(10).AddSeconds(-1), after.AddMinutes(10).AddSeconds(1));
        Assert.Matches("^[0-9a-f]{32}$", issued.JwtId);
        Assert.Equal("Tenant One", issued.TenantName);
        Assert.Equal("Business", issued.TenantPlanName);

        AssertClaim(jwt, ClaimTypes.Name, "user-name");
        AssertClaim(jwt, ClaimTypes.Email, "user@example.com");
        AssertClaim(jwt, ClaimTypes.NameIdentifier, "user-id");
        AssertClaim(jwt, AuthenticationTokenClaimNames.FirstName, "First");
        AssertClaim(jwt, AuthenticationTokenClaimNames.LastName, "Last");
        AssertClaim(jwt, AuthenticationTokenClaimNames.JwtId, issued.JwtId);
        AssertClaim(jwt, AuthenticationTokenClaimNames.SessionId, "session-id");
        AssertClaim(jwt, AuthenticationTokenClaimNames.SecurityStamp, "security-stamp");
        AssertClaim(jwt, AuthenticationTokenClaimNames.TenantId, "tenant-id");
        AssertClaim(jwt, AuthenticationTokenClaimNames.TenantName, "Tenant One");
        AssertClaim(jwt, AuthenticationTokenClaimNames.TenantPlanName, "Business");
        AssertClaim(jwt, AuthenticationTokenClaimNames.CompanyId, "7");
        AssertClaim(jwt, ClaimTypes.Role, "admin");
        AssertClaim(jwt, AuthenticationTokenClaimNames.TenantRoleId, "tenant-role-id");
        AssertClaim(jwt, "Permissions", "Countries:View");
    }

    [Fact]
    public void SelectionTokens_PreserveMainAudienceScopesAndClaimOmissions()
    {
        var options = CreateOptions();
        var service = CreateService(options, new UnusedClaimMaterialService());
        var subject = new AuthenticationTokenSubjectSnapshot("user-id", "security-stamp");

        var tenantIssued = service.GenerateTenantSelectionToken(subject);
        var tenantJwt = new JwtSecurityTokenHandler().ReadJwtToken(tenantIssued.Token);
        var tenantValidated = service.ValidateTenantSelectionToken(tenantIssued.Token);

        Assert.NotNull(tenantValidated);
        Assert.Equal("user-id", tenantValidated!.UserId);
        Assert.Equal("security-stamp", tenantValidated.SecurityStamp);
        Assert.Equal(tenantIssued.JwtId, tenantValidated.JwtId);
        Assert.Equal(["HrManagementSystem.Web"], tenantJwt.Audiences);
        Assert.Equal(SecurityAlgorithms.HmacSha256, tenantJwt.Header.Alg);
        AssertClaim(tenantJwt, AuthenticationTokenClaimNames.Scope, AuthenticationTokenClaimNames.TenantSelectionScope);
        Assert.DoesNotContain(tenantJwt.Claims, claim => claim.Type == AuthenticationTokenClaimNames.TenantId);
        Assert.DoesNotContain(tenantJwt.Claims, claim => claim.Type == AuthenticationTokenClaimNames.CompanyId);

        var companyIssued = service.GenerateCompanySelectionToken(subject, "tenant-id");
        var companyJwt = new JwtSecurityTokenHandler().ReadJwtToken(companyIssued.Token);
        var companyValidated = service.ValidateCompanySelectionToken(companyIssued.Token);

        Assert.NotNull(companyValidated);
        Assert.Equal("tenant-id", companyValidated!.TenantId);
        Assert.Equal(["HrManagementSystem.Web"], companyJwt.Audiences);
        AssertClaim(companyJwt, AuthenticationTokenClaimNames.Scope, AuthenticationTokenClaimNames.CompanySelectionScope);
        AssertClaim(companyJwt, AuthenticationTokenClaimNames.TenantId, "tenant-id");
        Assert.DoesNotContain(companyJwt.Claims, claim => claim.Type == AuthenticationTokenClaimNames.CompanyId);
    }

    [Fact]
    public void RealtimeToken_PreservesRealtimeAudienceAndMinimalClaimWhitelist()
    {
        var service = CreateService(CreateOptions(), new UnusedClaimMaterialService());
        var source = new AccessTokenClaimValue[]
        {
            new(ClaimTypes.NameIdentifier, "user-id"),
            new(ClaimTypes.Name, "user-name"),
            new(ClaimTypes.Email, "user@example.com"),
            new(AuthenticationTokenClaimNames.SessionId, "session-id"),
            new(AuthenticationTokenClaimNames.SecurityStamp, "security-stamp"),
            new(AuthenticationTokenClaimNames.TenantId, "tenant-id"),
            new(AuthenticationTokenClaimNames.CompanyId, "7"),
            new(ClaimTypes.Role, "admin"),
            new(AuthenticationTokenClaimNames.TenantRoleId, "tenant-role-id"),
            new("Permissions", "Countries:View")
        };

        var token = service.GenerateRealtimeToken(source);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal(["HrManagementSystem.Web:realtime"], jwt.Audiences);
        Assert.Equal(SecurityAlgorithms.HmacSha256, jwt.Header.Alg);
        AssertClaim(jwt, ClaimTypes.NameIdentifier, "user-id");
        AssertClaim(jwt, ClaimTypes.Name, "user-name");
        AssertClaim(jwt, AuthenticationTokenClaimNames.SessionId, "session-id");
        AssertClaim(jwt, AuthenticationTokenClaimNames.SecurityStamp, "security-stamp");
        AssertClaim(jwt, AuthenticationTokenClaimNames.TenantId, "tenant-id");
        AssertClaim(jwt, AuthenticationTokenClaimNames.CompanyId, "7");
        AssertClaim(jwt, AuthenticationTokenClaimNames.Scope, AuthenticationTokenClaimNames.RealtimeScope);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == ClaimTypes.Email);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == ClaimTypes.Role);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == AuthenticationTokenClaimNames.TenantRoleId);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type == "Permissions");
    }

    [Fact]
    public void ExpiredAccessValidation_IgnoresLifetimeOnly()
    {
        var options = CreateOptions();
        var service = CreateService(options, new UnusedClaimMaterialService());
        var validExpired = CreateExpiredAccessToken(options.Issuer, options.Audience, SigningKey);

        var validated = service.ValidateExpiredAccessToken(validExpired);

        Assert.NotNull(validated);
        Assert.Equal("user-id", validated!.UserId);
        Assert.Equal("jwt-id", validated.JwtId);
        Assert.Equal("session-id", validated.SessionId);
        Assert.Equal("security-stamp", validated.SecurityStamp);
        Assert.Equal("tenant-id", validated.TenantId);
        Assert.Equal(7, validated.CompanyId);
        Assert.Null(service.ValidateExpiredAccessToken(CreateExpiredAccessToken("wrong", options.Audience, SigningKey)));
        Assert.Null(service.ValidateExpiredAccessToken(CreateExpiredAccessToken(options.Issuer, "wrong", SigningKey)));
        Assert.Null(service.ValidateExpiredAccessToken(CreateExpiredAccessToken(options.Issuer, options.Audience, SigningKey + "wrong")));
    }

    [Fact]
    public void PlatformInfrastructure_BindsExistingJwtOptionsSectionAndDevelopmentKeyDefault()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ASPNETCORE_ENVIRONMENT"] = "Development",
                ["ConnectionStrings:DefaultConnection"] = "Server=(local);Database=unused;Trusted_Connection=True;TrustServerCertificate=True",
                ["JwtOptions:Issuer"] = "Issuer",
                ["JwtOptions:Audience"] = "Audience",
                ["JwtOptions:ExpireInMinutes"] = "17",
                ["JwtOptions:RealtimeExpireInMinutes"] = "3",
                ["JwtOptions:CompanySelectionExpireInMinutes"] = "6",
                ["JwtOptions:TenantSelectionExpireInMinutes"] = "7"
            })
            .Build();
        var services = new ServiceCollection();
        services.AddPlatformInfrastructure(configuration);

        using var provider = services.BuildServiceProvider();
        var options = provider.GetRequiredService<AuthenticationTokenOptions>();

        Assert.Equal("HrManagementSystem-Development-Only-Jwt-Key-Replace-With-User-Secrets", options.Key);
        Assert.Equal("Issuer", options.Issuer);
        Assert.Equal("Audience", options.Audience);
        Assert.Equal(17, options.ExpireInMinutes);
        Assert.Equal(3, options.RealtimeExpireInMinutes);
        Assert.Equal(6, options.CompanySelectionExpireInMinutes);
        Assert.Equal(7, options.TenantSelectionExpireInMinutes);
    }

    [Fact]
    public void PlatformInfrastructure_DbContextInspection_DoesNotRequireJwtConfiguration()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(local);Database=unused;Trusted_Connection=True;TrustServerCertificate=True"
            })
            .Build();
        var services = new ServiceCollection();

        services.AddPlatformInfrastructure(configuration);

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<PlatformDbContext>());
    }

    [Fact]
    public async Task PlatformInfrastructure_MissingSigningKey_StillFailsHostStartup()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ASPNETCORE_ENVIRONMENT"] = Environments.Production,
                ["DOTNET_ENVIRONMENT"] = Environments.Production,
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(local);Database=unused;Trusted_Connection=True;TrustServerCertificate=True",
                ["JwtOptions:Issuer"] = "Issuer",
                ["JwtOptions:Audience"] = "Audience"
            })
            .Build();
        var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
        {
            EnvironmentName = Environments.Production
        });
        builder.Services.AddPlatformInfrastructure(configuration);
        using var host = builder.Build();

        var exception = await Assert.ThrowsAsync<OptionsValidationException>(() => host.StartAsync());

        Assert.Contains(exception.Failures, failure =>
            failure.Contains(nameof(AuthenticationTokenOptions.Key), StringComparison.Ordinal));
    }

    [Theory]
    [InlineData("<set-via-environment-or-local-config>")]
    [InlineData("YOUR_JWT_SECRET")]
    [InlineData("HrManagementSystem-Development-Only-Jwt-Key-Replace-With-User-Secrets")]
    public async Task PlatformInfrastructure_ProductionRejectsKnownPlaceholderSigningKeys(string key)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ASPNETCORE_ENVIRONMENT"] = Environments.Production,
                ["DOTNET_ENVIRONMENT"] = Environments.Production,
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(local);Database=unused;Trusted_Connection=True;TrustServerCertificate=True",
                ["JwtOptions:Key"] = key,
                ["JwtOptions:Issuer"] = "Issuer",
                ["JwtOptions:Audience"] = "Audience"
            })
            .Build();
        var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
        {
            EnvironmentName = Environments.Production
        });
        builder.Services.AddPlatformInfrastructure(configuration);
        using var host = builder.Build();

        var exception = await Assert.ThrowsAsync<OptionsValidationException>(() => host.StartAsync());

        Assert.Contains(exception.Failures, failure =>
            failure.Contains("non-placeholder production secret", StringComparison.Ordinal));
    }

    private static AuthenticationTokenOptions CreateOptions() => new()
    {
        Key = SigningKey,
        Issuer = "HrManagementSystem",
        Audience = "HrManagementSystem.Web",
        ExpireInMinutes = 10,
        RealtimeExpireInMinutes = 2,
        CompanySelectionExpireInMinutes = 5,
        TenantSelectionExpireInMinutes = 5
    };

    private static JwtAuthenticationTokenService CreateService(
        AuthenticationTokenOptions options,
        IAccessTokenClaimMaterialService material)
    {
        var factory = new JwtAuthenticationTokenValidationParametersFactory(options);
        return new JwtAuthenticationTokenService(options, material, factory);
    }

    private static void AssertClaim(JwtSecurityToken token, string type, string value) =>
        Assert.Contains(token.Claims, claim => claim.Type == type && claim.Value == value);

    private static string CreateExpiredAccessToken(string issuer, string audience, string key)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "user-id"),
            new Claim(AuthenticationTokenClaimNames.JwtId, "jwt-id"),
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
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private sealed class CanonicalClaimMaterialService : IAccessTokenClaimMaterialService
    {
        public Task<AccessTokenClaimMaterialResult> BuildAsync(
            AccessTokenClaimMaterialRequest request,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(new AccessTokenClaimMaterialResult(
                "Tenant One",
                "Business",
                [
                    new(ClaimTypes.Name, request.User.UserName),
                    new(ClaimTypes.Email, request.User.Email),
                    new(ClaimTypes.NameIdentifier, request.User.UserId),
                    new(AuthenticationTokenClaimNames.FirstName, request.User.FirstName),
                    new(AuthenticationTokenClaimNames.LastName, request.User.LastName),
                    new(AuthenticationTokenClaimNames.JwtId, request.JwtId),
                    new(AuthenticationTokenClaimNames.SessionId, request.SessionId),
                    new(AuthenticationTokenClaimNames.SecurityStamp, request.User.SecurityStamp),
                    new(AuthenticationTokenClaimNames.TenantId, request.TenantId),
                    new(AuthenticationTokenClaimNames.TenantName, "Tenant One"),
                    new(AuthenticationTokenClaimNames.TenantPlanName, "Business"),
                    new(AuthenticationTokenClaimNames.CompanyId, request.CompanyId.ToString(System.Globalization.CultureInfo.InvariantCulture)),
                    new(ClaimTypes.Role, "admin"),
                    new(AuthenticationTokenClaimNames.TenantRoleId, "tenant-role-id"),
                    new("Permissions", "Countries:View")
                ]));
    }

    private sealed class UnusedClaimMaterialService : IAccessTokenClaimMaterialService
    {
        public Task<AccessTokenClaimMaterialResult> BuildAsync(
            AccessTokenClaimMaterialRequest request,
            CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException("Access-token claim material is not used by this test.");
    }
}
