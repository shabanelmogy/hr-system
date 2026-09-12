using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Application.Features.Security.Invitations.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Infrastructure.Dependencies;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Security.Authentication;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.TenantMembership;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ErpSystem.Tests;

public sealed class AuthenticationFlowArchitectureTests
{
    [Theory]
    [InlineData(typeof(PlatformAuthenticationLoginCompatibilityService), typeof(IAuthLoginService))]
    [InlineData(typeof(PlatformAuthenticationSessionCompatibilityService), typeof(IAuthSessionService))]
    [InlineData(typeof(PlatformAuthenticationAccountCompatibilityService), typeof(IAuthAccountService))]
    [InlineData(typeof(UserInvitationService), typeof(IUserInvitationService))]
    public void AuthenticationFlows_ImplementFocusedApplicationContracts(
        Type implementation,
        Type contract)
    {
        Assert.True(contract.IsAssignableFrom(implementation));
    }

    [Fact]
    public void AuthenticationContracts_ExposeOnlyTheirOwnFlow()
    {
        Assert.Equal(4, typeof(IAuthLoginService).GetMethods().Length);
        Assert.Equal(4, typeof(IAuthSessionService).GetMethods().Length);
        Assert.Equal(6, typeof(IAuthAccountService).GetMethods().Length);
    }

    [Fact]
    public void SessionFlow_DoesNotDependOnWebHostOrEmailDelivery()
    {
        var dependencies = typeof(AuthSessionService)
            .GetConstructors()
            .Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.DoesNotContain(typeof(IWebHostEnvironment), dependencies);
        Assert.DoesNotContain(typeof(IAuthEmailService), dependencies);
    }

    [Fact]
    public void AuthenticationReadFlows_ConsumePlatformTenantAndCompanyPorts()
    {
        var loginDependencies = typeof(AuthLoginService)
            .GetConstructors()
            .Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();
        var sessionDependencies = typeof(AuthSessionService)
            .GetConstructors()
            .Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.Contains(typeof(ITenantMembershipService), loginDependencies);
        Assert.Contains(typeof(ICompanyAccessService), loginDependencies);
        Assert.Contains(typeof(ICompanyAccessService), sessionDependencies);
        Assert.Null(typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly.GetType(
            "ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services.IAuthCompanyAccessService"));
    }

    [Fact]
    public void PresentationCompatibilityFlows_DelegateToPlatformOwnedOrchestrators()
    {
        Assert.Equal(
            [typeof(IAuthenticationLoginOrchestrator)],
            typeof(PlatformAuthenticationLoginCompatibilityService)
                .GetConstructors().Single().GetParameters()
                .Select(parameter => parameter.ParameterType).ToArray());
        Assert.Equal(
            [typeof(IAuthenticationSessionOrchestrator)],
            typeof(PlatformAuthenticationSessionCompatibilityService)
                .GetConstructors().Single().GetParameters()
                .Select(parameter => parameter.ParameterType).ToArray());
        Assert.Equal(
            [typeof(IAuthenticationAccountOrchestrator)],
            typeof(PlatformAuthenticationAccountCompatibilityService)
                .GetConstructors().Single().GetParameters()
                .Select(parameter => parameter.ParameterType).ToArray());

        Assert.False(typeof(IAuthLoginService).IsAssignableFrom(typeof(AuthLoginService)));
        Assert.False(typeof(IAuthSessionService).IsAssignableFrom(typeof(AuthSessionService)));
        Assert.False(typeof(IAuthAccountService).IsAssignableFrom(typeof(AuthAccountService)));
    }

    [Fact]
    public void AuthenticationProviders_ResolveToOneScopedJwtProvider()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ASPNETCORE_ENVIRONMENT"] = Environments.Development,
                ["JwtOptions:Key"] = "test-only-signing-key-with-more-than-thirty-two-characters",
                ["JwtOptions:Issuer"] = "ErpSystem.Tests",
                ["JwtOptions:Audience"] = "ErpSystem.Tests.Web"
            })
            .Build();

        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddSingleton<ICurrentActor>(new TestCurrentActor());
        services.AddSingleton<IAuthenticationTokenService>(new StubAuthenticationTokenService());
        services.AddSingleton<IAuthenticationTokenValidationParametersFactory>(new StubValidationParametersFactory());
        services.AddSingleton(TimeProvider.System);
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseInMemoryDatabase(nameof(AuthenticationProviders_ResolveToOneScopedJwtProvider)));
        services.AddAuthenticationService(configuration);

        using var provider = services.BuildServiceProvider(new ServiceProviderOptions
        {
            ValidateScopes = true
        });
        using var scope = provider.CreateScope();

        var concrete = scope.ServiceProvider.GetRequiredService<JwtProvider>();
        var jwtProvider = scope.ServiceProvider.GetRequiredService<IJwtProvider>();
        var realtimeProvider = scope.ServiceProvider.GetRequiredService<IRealtimeTokenProvider>();

        Assert.Same(concrete, jwtProvider);
        Assert.Same(concrete, realtimeProvider);
    }

    [Fact]
    public void JwtProvider_DelegatesClaimMaterialAndNoLongerDependsOnHrDbContext()
    {
        var dependencies = typeof(JwtProvider)
            .GetConstructors()
            .Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.Equal([typeof(IAuthenticationTokenService)], dependencies);
        Assert.DoesNotContain(typeof(ApplicationDbContext), dependencies);
        Assert.Null(typeof(JwtProvider).Assembly.GetType(
            "ErpSystem.Modules.HR.Infrastructure.Security.Authentication.JwtOptions"));
        Assert.Null(typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly.GetType(
            "ErpSystem.Modules.HR.Application.Common.Consts.JwtClaimNames"));
        Assert.Null(typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly.GetType(
            "ErpSystem.Modules.HR.Application.Common.Consts.MyClaims"));
    }

    [Fact]
    public void BearerSchemes_UsePlatformValidationParametersFactory()
    {
        var configuration = new ConfigurationBuilder().Build();
        var factory = new StubValidationParametersFactory();
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddSingleton<ICurrentActor>(new TestCurrentActor());
        services.AddSingleton<IAuthenticationTokenService>(new StubAuthenticationTokenService());
        services.AddSingleton<IAuthenticationTokenValidationParametersFactory>(factory);
        services.AddSingleton(TimeProvider.System);
        services.AddDbContext<ApplicationDbContext>(options => options.UseInMemoryDatabase(Guid.NewGuid().ToString("N")));
        services.AddAuthenticationService(configuration);

        using var provider = services.BuildServiceProvider();
        var monitor = provider.GetRequiredService<IOptionsMonitor<JwtBearerOptions>>();

        var access = monitor.Get(JwtBearerDefaults.AuthenticationScheme).TokenValidationParameters;
        var realtime = monitor.Get(JwtAuthenticationSchemes.Realtime).TokenValidationParameters;

        Assert.Same(factory.AccessParameters, access);
        Assert.Same(factory.RealtimeParameters, realtime);
    }

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }

    private sealed class StubAuthenticationTokenService : IAuthenticationTokenService
    {
        public Task<AuthenticationAccessTokenResult> GenerateAccessTokenAsync(AccessTokenUserSnapshot user, string sessionId, int companyId, string tenantId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public AuthenticationIssuedToken GenerateTenantSelectionToken(AuthenticationTokenSubjectSnapshot user) => throw new NotSupportedException();
        public AuthenticationValidatedTenantSelectionToken? ValidateTenantSelectionToken(string token) => throw new NotSupportedException();
        public AuthenticationIssuedToken GenerateCompanySelectionToken(AuthenticationTokenSubjectSnapshot user, string tenantId) => throw new NotSupportedException();
        public AuthenticationValidatedCompanySelectionToken? ValidateCompanySelectionToken(string token) => throw new NotSupportedException();
        public string GenerateRealtimeToken(IReadOnlyCollection<AccessTokenClaimValue> principalClaims) => throw new NotSupportedException();
        public AuthenticationValidatedAccessToken? ValidateExpiredAccessToken(string token) => throw new NotSupportedException();
    }

    private sealed class StubValidationParametersFactory : IAuthenticationTokenValidationParametersFactory
    {
        public TokenValidationParameters AccessParameters { get; } = new();
        public TokenValidationParameters RealtimeParameters { get; } = new();
        public string Audience => "access";
        public string RealtimeAudience => "realtime";

        public TokenValidationParameters Create(string audience, bool validateLifetime = true) =>
            audience == Audience ? AccessParameters : RealtimeParameters;
    }
}
