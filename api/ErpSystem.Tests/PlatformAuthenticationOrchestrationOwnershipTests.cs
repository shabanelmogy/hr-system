using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Application.Features.Security.Users.Services;
using ErpSystem.Modules.HR.Application.Common.Errors;
using ErpSystem.Modules.HR.Infrastructure.Dependencies;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class PlatformAuthenticationOrchestrationOwnershipTests
{
    [Fact]
    public void PlatformAuthenticationAssemblies_DoNotReferenceHr()
    {
        var contractsReferences = typeof(IAuthenticationLoginOrchestrator).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .Where(name => name is not null)
            .ToArray();
        var applicationReferences = AssemblyReference.Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .Where(name => name is not null)
            .ToArray();

        Assert.DoesNotContain(contractsReferences, name => name!.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal));
        Assert.DoesNotContain(applicationReferences, name => name!.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal));
    }

    [Fact]
    public void LegacyHrIdentityAdapters_ImplementOnlyPlatformAdapterPorts()
    {
        Assert.True(typeof(IAuthenticationLoginAdapter).IsAssignableFrom(typeof(LegacyHrIdentityLoginAdapter)));
        Assert.True(typeof(IAuthenticationSessionAdapter).IsAssignableFrom(typeof(LegacyHrIdentitySessionAdapter)));
        Assert.True(typeof(IAuthenticationAccountAdapter).IsAssignableFrom(typeof(LegacyHrIdentityAccountAdapter)));

        Assert.Equal(
            [typeof(AuthLoginService)],
            ConstructorDependencies(typeof(LegacyHrIdentityLoginAdapter)));
        Assert.Equal(
            [typeof(AuthSessionService)],
            ConstructorDependencies(typeof(LegacyHrIdentitySessionAdapter)));
        Assert.Equal(
            [typeof(AuthAccountService), typeof(IUserService)],
            ConstructorDependencies(typeof(LegacyHrIdentityAccountAdapter)));
    }

    [Fact]
    public void HrComposition_RoutesPresentationContractsThroughPlatformAndRegistersLegacyAdapterPorts()
    {
        var services = new ServiceCollection();
        var configuration = new ConfigurationBuilder().Build();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddAuthenticationService(configuration);

        AssertRegistration<IAuthLoginService, PlatformAuthenticationLoginCompatibilityService>(services);
        AssertRegistration<IAuthSessionService, PlatformAuthenticationSessionCompatibilityService>(services);
        AssertRegistration<IAuthAccountService, PlatformAuthenticationAccountCompatibilityService>(services);
        AssertRegistration<IAuthenticationLoginAdapter, LegacyHrIdentityLoginAdapter>(services);
        AssertRegistration<IAuthenticationSessionAdapter, LegacyHrIdentitySessionAdapter>(services);
        AssertRegistration<IAuthenticationAccountAdapter, LegacyHrIdentityAccountAdapter>(services);
    }

    [Fact]
    public void LegacyRefreshSessionAdapter_UsesPlatformCanonicalPolicyValues()
    {
        Assert.Equal(AuthenticationSessionPolicy.RefreshTokenLifetime, RefreshTokenSessionPolicy.RefreshTokenLifetime);
        Assert.Equal(AuthenticationSessionPolicy.InactiveTokenRetention, RefreshTokenSessionPolicy.InactiveTokenRetention);
        Assert.Equal(AuthenticationSessionPolicy.RotatedTokenReuseGracePeriod, RefreshTokenSessionPolicy.RotatedTokenReuseGracePeriod);
        Assert.Equal(AuthenticationSessionPolicy.MaxInactiveTokenHistory, RefreshTokenSessionPolicy.MaxInactiveTokenHistory);
    }

    [Fact]
    public async Task PlatformOrchestrators_PreserveAdapterRequestsResultsAndCallOrder()
    {
        var trace = new List<string>();
        var loginAdapter = new RecordingLoginAdapter(trace);
        var sessionAdapter = new RecordingSessionAdapter(trace);
        var accountAdapter = new RecordingAccountAdapter(trace);
        var services = new ServiceCollection();
        services.AddSingleton<IAuthenticationLoginAdapter>(loginAdapter);
        services.AddSingleton<IAuthenticationSessionAdapter>(sessionAdapter);
        services.AddSingleton<IAuthenticationAccountAdapter>(accountAdapter);
        services.AddOptions<AuthenticationFeatureSettings>();
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var login = provider.GetRequiredService<IAuthenticationLoginOrchestrator>();
        var session = provider.GetRequiredService<IAuthenticationSessionOrchestrator>();
        var account = provider.GetRequiredService<IAuthenticationAccountOrchestrator>();

        var passwordRequest = new AuthenticationPasswordLoginRequest("user", "password");
        var loginResult = await login.PasswordLoginAsync(passwordRequest, CancellationToken.None);
        var refreshRequest = new AuthenticationRefreshRequest("access", "refresh");
        var refreshResult = await session.RefreshAsync(refreshRequest, CancellationToken.None);
        var resetRequest = new AuthenticationResetPasswordRequest("u@example.com", "code", "new-password");
        var resetResult = await account.ResetPasswordAsync(resetRequest, CancellationToken.None);

        Assert.Same(passwordRequest, loginAdapter.LastPasswordRequest);
        Assert.Same(refreshRequest, sessionAdapter.LastRefreshRequest);
        Assert.Same(resetRequest, accountAdapter.LastResetRequest);
        Assert.Same(loginAdapter.PasswordResult, loginResult);
        Assert.Same(sessionAdapter.RefreshResult, refreshResult);
        Assert.Same(accountAdapter.ResetResult, resetResult);
        Assert.Equal(["login.password", "session.refresh", "account.reset"], trace);
    }

    [Fact]
    public async Task SessionContext_PreservesLegacyLookupOrderAndResponseShape()
    {
        var trace = new List<string>();
        var tenantAccess = new RecordingTenantAccessService(trace)
        {
            Response = new TenantAccessResponse(
                "Tenant One",
                "Enterprise",
                "active",
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc),
                false)
        };
        var companyAccess = new RecordingCompanyAccessService(trace)
        {
            Companies =
            [
                new CompanyAccessOption(4, "C4", "شركة أربعة", "Company Four"),
                new CompanyAccessOption(9, "C9", "شركة تسعة", "Company Nine")
            ]
        };
        var services = new ServiceCollection();
        services.AddOptions<AuthenticationFeatureSettings>();
        services.AddPlatformApplication();
        // Last registration intentionally substitutes only the external services;
        // the session-context implementation under test remains Platform-owned.
        services.AddSingleton<ITenantAccessService>(tenantAccess);
        services.AddSingleton<ICompanyAccessService>(companyAccess);

        using var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<IAuthenticationSessionContextService>();
        var request = new AuthenticationSessionContextRequest(
            "user-1",
            "tenant-1",
            9,
            "user",
            "user@example.com",
            "First",
            "Last",
            ["admin", "user"],
            ["Users:View", "Users:Edit"],
            123456789L);

        var response = await service.GetAsync(request);

        Assert.Equal(["tenant", "companies"], trace);
        Assert.NotNull(response);
        Assert.Equal("Tenant One", response!.TenantName);
        Assert.Equal("Enterprise", response.TenantPlanName);
        Assert.Equal(9, response.CompanyId);
        Assert.Equal("C9", response.CompanyCode);
        Assert.Equal([4, 9], response.Companies.Select(company => company.Id));
        Assert.Equal(request.Roles, response.Roles);
        Assert.Equal(request.Permissions, response.Permissions);
        Assert.Equal("active", response.TenantSubscriptionStatus);
        Assert.False(response.TenantReadOnly);
        Assert.Equal(request.ExpiresAt, response.ExpiresAt);
    }

    [Fact]
    public async Task SessionContext_WhenTenantIsMissing_StillPreservesLegacyCompanyLookupBeforeUnauthorized()
    {
        var trace = new List<string>();
        var services = new ServiceCollection();
        services.AddOptions<AuthenticationFeatureSettings>();
        services.AddPlatformApplication();
        services.AddSingleton<ITenantAccessService>(new RecordingTenantAccessService(trace));
        services.AddSingleton<ICompanyAccessService>(new RecordingCompanyAccessService(trace));

        using var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<IAuthenticationSessionContextService>();
        var response = await service.GetAsync(new AuthenticationSessionContextRequest(
            "user-1", "tenant-1", 7, "user", "user@example.com", "F", "L", [], [], 1));

        Assert.Null(response);
        Assert.Equal(["tenant", "companies"], trace);
    }

    [Fact]
    public async Task CompatibilityFacade_PreservesLegacyErrorCodeDescriptionAndClassification()
    {
        const string code = "User.RefreshTokenAlreadyRotated";
        const string description = "localized conflict";
        var service = new PlatformAuthenticationSessionCompatibilityService(
            new FailingSessionOrchestrator(new AuthenticationError(
                code,
                description,
                AuthenticationErrorType.Conflict)));

        var result = await service.GetRefreshTokenAsync(
            new("access", "refresh"),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal(code, result.Error.Code);
        Assert.Equal(description, result.Error.Description);
        Assert.Equal(ErrorType.Conflict, result.Error.Type);
    }

    [Fact]
    public async Task CompatibilityFacade_PreservesTenantSelectionWirePayload()
    {
        var expiresAt = new DateTime(2026, 9, 10, 20, 30, 0, DateTimeKind.Utc);
        var service = new PlatformAuthenticationLoginCompatibilityService(
            new TenantSelectionLoginOrchestrator(expiresAt));

        var result = await service.GetTokenAsync("user", "password", CancellationToken.None);

        Assert.True(result.IsSuccess);
        var login = Assert.IsType<ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts.TenantSelectionLoginResult>(
            result.Value);
        Assert.False(login.Response.IsAuthenticated);
        Assert.True(login.Response.RequiresTenantSelection);
        Assert.Equal("tenant-token", login.Response.TenantSelectionToken);
        Assert.Equal(expiresAt, login.Response.TenantSelectionTokenExpiration);
        var tenant = Assert.Single(login.Response.Tenants);
        Assert.Equal("tenant-1", tenant.Id);
        Assert.Equal("T1", tenant.Identifier);
        Assert.Equal("Tenant One", tenant.Name);
    }

    private static Type[] ConstructorDependencies(Type type) =>
        type.GetConstructors().Single().GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

    private static void AssertRegistration<TService, TImplementation>(IServiceCollection services)
    {
        var descriptor = Assert.Single(services, descriptor => descriptor.ServiceType == typeof(TService));
        Assert.Equal(typeof(TImplementation), descriptor.ImplementationType);
    }

    private sealed class RecordingLoginAdapter(List<string> trace) : IAuthenticationLoginAdapter
    {
        public AuthenticationPasswordLoginRequest? LastPasswordRequest { get; private set; }
        public AuthenticationOperationResult<AuthenticationLoginResult> PasswordResult { get; } =
            AuthenticationOperationResult.Success<AuthenticationLoginResult>(
                new AuthenticationTenantSelectionLoginResult(
                    false,
                    true,
                    "selection",
                    DateTime.UnixEpoch,
                    []));

        public Task<AuthenticationOperationResult<AuthenticationLoginResult>> PasswordLoginAsync(
            AuthenticationPasswordLoginRequest request,
            CancellationToken cancellationToken)
        {
            trace.Add("login.password");
            LastPasswordRequest = request;
            return Task.FromResult(PasswordResult);
        }

        public Task<AuthenticationOperationResult<AuthenticationLoginResult>> ExternalLoginAsync(
            AuthenticationExternalLoginRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult<AuthenticationLoginResult>> SelectTenantAsync(
            AuthenticationTenantSelectionRequest request,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SelectCompanyAsync(
            AuthenticationCompanySelectionRequest request,
            CancellationToken cancellationToken) => throw new NotSupportedException();
    }

    private sealed class RecordingSessionAdapter(List<string> trace) : IAuthenticationSessionAdapter
    {
        public AuthenticationRefreshRequest? LastRefreshRequest { get; private set; }
        public AuthenticationOperationResult<AuthenticationSessionResponse> RefreshResult { get; } =
            AuthenticationOperationResult.Failure<AuthenticationSessionResponse>(
                new AuthenticationError("test", "test", AuthenticationErrorType.Conflict));

        public Task<AuthenticationOperationResult> LogOutAsync(
            string refreshToken,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> RefreshAsync(
            AuthenticationRefreshRequest request,
            CancellationToken cancellationToken)
        {
            trace.Add("session.refresh");
            LastRefreshRequest = request;
            return Task.FromResult(RefreshResult);
        }

        public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SwitchCompanyAsync(
            int companyId,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult> RevokeUserSessionsAsync(
            string userId,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class RecordingAccountAdapter(List<string> trace) : IAuthenticationAccountAdapter
    {
        public AuthenticationResetPasswordRequest? LastResetRequest { get; private set; }
        public AuthenticationOperationResult ResetResult { get; } = AuthenticationOperationResult.Success();

        public Task<AuthenticationOperationResult> RegisterAsync(
            AuthenticationRegisterRequest request,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult> ConfirmEmailAsync(
            AuthenticationConfirmEmailRequest request,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult> ResendConfirmationEmailAsync(
            AuthenticationResendConfirmationRequest request,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult> SendResetPasswordCodeAsync(
            string email,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult> ResetPasswordAsync(
            AuthenticationResetPasswordRequest request,
            CancellationToken cancellationToken)
        {
            trace.Add("account.reset");
            LastResetRequest = request;
            return Task.FromResult(ResetResult);
        }

        public Task<AuthenticationOperationResult> ChangePasswordAsync(
            string userId,
            AuthenticationChangePasswordRequest request,
            CancellationToken cancellationToken) => throw new NotSupportedException();
    }

    private sealed class RecordingTenantAccessService(List<string> trace) : ITenantAccessService
    {
        public TenantAccessResponse? Response { get; init; }

        public Task<TenantAccessResponse?> GetAsync(
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            trace.Add("tenant");
            return Task.FromResult(Response);
        }
    }

    private sealed class RecordingCompanyAccessService(List<string> trace) : ICompanyAccessService
    {
        public IReadOnlyList<CompanyAccessOption> Companies { get; init; } = [];

        public Task<IReadOnlyList<CompanyAccessOption>> GetAvailableCompaniesAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            trace.Add("companies");
            return Task.FromResult(Companies);
        }

        public Task<CompanyAccessOption?> GetAvailableCompanyAsync(
            string userId,
            string tenantId,
            int companyId,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class FailingSessionOrchestrator(AuthenticationError error) : IAuthenticationSessionOrchestrator
    {
        public Task<AuthenticationOperationResult> LogOutAsync(
            string refreshToken,
            CancellationToken cancellationToken) =>
            Task.FromResult(AuthenticationOperationResult.Failure(error));

        public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> RefreshAsync(
            AuthenticationRefreshRequest request,
            CancellationToken cancellationToken) =>
            Task.FromResult(AuthenticationOperationResult.Failure<AuthenticationSessionResponse>(error));

        public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SwitchCompanyAsync(
            int companyId,
            CancellationToken cancellationToken) =>
            Task.FromResult(AuthenticationOperationResult.Failure<AuthenticationSessionResponse>(error));

        public Task<AuthenticationOperationResult> RevokeUserSessionsAsync(
            string userId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(AuthenticationOperationResult.Failure(error));
    }

    private sealed class TenantSelectionLoginOrchestrator(DateTime expiresAt) : IAuthenticationLoginOrchestrator
    {
        public Task<AuthenticationOperationResult<AuthenticationLoginResult>> PasswordLoginAsync(
            AuthenticationPasswordLoginRequest request,
            CancellationToken cancellationToken) =>
            Task.FromResult(AuthenticationOperationResult.Success<AuthenticationLoginResult>(
                new AuthenticationTenantSelectionLoginResult(
                    false,
                    true,
                    "tenant-token",
                    expiresAt,
                    [new AuthenticationTenantOption("tenant-1", "T1", "Tenant One")])));

        public Task<AuthenticationOperationResult<AuthenticationLoginResult>> ExternalLoginAsync(
            AuthenticationExternalLoginRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult<AuthenticationLoginResult>> SelectTenantAsync(
            AuthenticationTenantSelectionRequest request,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SelectCompanyAsync(
            AuthenticationCompanySelectionRequest request,
            CancellationToken cancellationToken) => throw new NotSupportedException();
    }
}
