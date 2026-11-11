using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Application.Authentication.SelectionChallenges;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.SessionValidation;
using ErpSystem.Modules.Platform.Application.TenantMembership;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Authorization;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.Modules.Platform.Presentation.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ErpSystem.IntegrationTests;

/// <summary>Real Identity/password/JWT/refresh persistence on migrated disposable SQL.</summary>
public sealed class SuperAdminSystemSessionTests
{
    [SqlServerFact]
    public async Task MembershipFreeSuperAdmin_LoginContextRefreshLogout_UsesSystemScopeOnly()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.LoginAsync();
        Assert.Equal("system", original.SessionScope);
        Assert.Empty(original.TenantId);
        Assert.Equal(0, original.CompanyId);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(original.Token);
        Assert.DoesNotContain(jwt.Claims, claim => claim.Type is "tenant_id" or "company_id" or "tenant_name" or "tenant_plan");
        Assert.True(await fixture.ValidAsync(original));

        Assert.True(await fixture.BearerValidAsync(original));
        Assert.False(await fixture.BearerValidAsync(original,
            new Claim(AuthenticationTokenClaimNames.CompanyId, "0")));
        Assert.False(await fixture.BearerValidAsync(original,
            new Claim(AuthenticationTokenClaimNames.SessionScope, "system")));

        await using (var scope = fixture.Services.CreateAsyncScope())
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(original.Token,
                fixture.Validation.Create(fixture.Validation.Audience), out _);
            var request = AuthenticationSessionContextRequestFactory.FromPrincipal(principal);
            var handler = new GetAuthenticationSessionContextQueryHandler(
                scope.ServiceProvider.GetRequiredService<ErpSystem.Modules.Platform.Application.Tenancy.ITenantAccessService>(),
                scope.ServiceProvider.GetRequiredService<ICompanyAccessService>());
            var context = await handler.Handle(new GetAuthenticationSessionContextQuery(request), CancellationToken.None);
            Assert.NotNull(context);
            Assert.Equal("system", context.SessionScope);
            Assert.Empty(context.Companies);
            Assert.Empty(context.TenantSubscriptionStatus);
            Assert.False(context.TenantReadOnly);
            var requirement = new TenantMemberRequirement();
            var authorization = new AuthorizationHandlerContext([requirement], principal, null);
            await new TenantMemberAuthorizationHandler().HandleAsync(authorization);
            Assert.False(authorization.HasSucceeded);
        }

        var refreshed = await fixture.RefreshAsync(original);
        Assert.True(refreshed.IsSuccess);
        Assert.Equal("system", refreshed.Value.SessionScope);
        Assert.Equal(original.RefreshTokenExpiration, refreshed.Value.RefreshTokenExpiration);
        Assert.Equal(fixture.Access(original).SessionId, fixture.Access(refreshed.Value).SessionId);
        Assert.True(await fixture.ValidAsync(refreshed.Value));
        var replay = await fixture.RefreshAsync(original);
        Assert.Equal(AuthenticationErrorType.Conflict, replay.Error.Type);
        await using (var scope = fixture.Services.CreateAsyncScope())
            Assert.True((await scope.ServiceProvider.GetRequiredService<PlatformIdentitySessionAdapter>()
                .LogOutAsync(original.RefreshToken, CancellationToken.None)).IsSuccess);
        Assert.False(await fixture.ValidAsync(refreshed.Value));
        Assert.True((await fixture.RefreshAsync(refreshed.Value)).IsFailure);
    }

    [SqlServerFact]
    public async Task InactiveTenant_DoesNotBlockSystemLogin_ButOrdinaryAccountsRemainDenied()
    {
        await using var fixture = await Fixture.CreateAsync();
        await using (var scope = fixture.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
            var tenant = new PlatformTenant("inactive", "inactive", "Inactive Tenant", DateTime.UtcNow);
            tenant.Update("inactive", "Inactive Tenant", false, 2, DateTime.UtcNow, null, null,
                5, 100, null, null, null, null, DateTime.UtcNow);
            db.Tenants.Add(tenant);
            db.UserTenantAccesses.Add(new PlatformUserTenantAccess { UserId = "system-user", TenantId = "inactive", IsDefault = true });
            await db.SaveChangesAsync();
        }
        Assert.Equal("system", (await fixture.LoginAsync()).SessionScope);
        await fixture.ChangeAsync(async (db, manager, user) =>
        {
            Assert.True((await manager.RemoveFromRoleAsync(user, PlatformRoleNames.SuperAdmin)).Succeeded);
        });
        var denied = await fixture.TryLoginAsync();
        Assert.Equal("Authentication.NoTenantAccess", denied.Error.Code);
        await fixture.ChangeAsync(async (db, manager, user) =>
        {
            db.UserTenantAccesses.RemoveRange(await db.UserTenantAccesses.IgnoreQueryFilters().ToListAsync());
            await db.SaveChangesAsync();
        });
        Assert.Equal("Authentication.NoTenantAccess", (await fixture.TryLoginAsync()).Error.Code);
    }

    [SqlServerFact]
    public async Task SystemSession_LiveRoleAndAccountChanges_RevokeValidationAndRefresh()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.LoginAsync();
        foreach (var failure in new[] { "disabled", "archived", "locked", "unconfirmed", "deleted-role", "removed-role", "stamp" })
        {
            await fixture.ChangeAsync(async (db, manager, user) =>
            {
                user.IsDisabled = failure == "disabled";
                user.LifecycleStatus = failure == "archived" ? 1 : 0;
                user.LockoutEnd = failure == "locked" ? DateTimeOffset.UtcNow.AddHours(1) : null;
                user.EmailConfirmed = failure != "unconfirmed";
                user.SecurityStamp = failure == "stamp" ? "changed-stamp" : Fixture.Stamp;
                var role = await db.Roles.SingleAsync();
                role.IsDeleted = failure == "deleted-role";
                if (failure == "removed-role")
                    Assert.True((await manager.RemoveFromRoleAsync(user, PlatformRoleNames.SuperAdmin)).Succeeded);
                else if (!await manager.IsInRoleAsync(user, PlatformRoleNames.SuperAdmin))
                    Assert.True((await manager.AddToRoleAsync(user, PlatformRoleNames.SuperAdmin)).Succeeded);
                await db.SaveChangesAsync();
            });
            Assert.False(await fixture.ValidAsync(original), failure);
            Assert.False(await fixture.BearerValidAsync(original), failure);
            Assert.True((await fixture.RefreshAsync(original)).IsFailure, failure);
        }
    }

    private sealed class Fixture(SqlServerTestDatabase database, ServiceProvider services) : IAsyncDisposable
    {
        internal const string Stamp = "system-session-test-stamp";
        private const string Password = "SystemTest123!";
        public ServiceProvider Services => services;
        public IAuthenticationTokenService Tokens => services.GetRequiredService<IAuthenticationTokenService>();
        public IAuthenticationTokenValidationParametersFactory Validation => services.GetRequiredService<IAuthenticationTokenValidationParametersFactory>();

        public static async Task<Fixture> CreateAsync()
        {
            var database = await SqlServerTestDatabase.CreateAsync("SuperAdminSystemSession");
            ServiceProvider? provider = null;
            try
            {
                var services = new ServiceCollection();
                services.AddLogging();
                services.AddSingleton<IConfiguration>(new ConfigurationBuilder().AddInMemoryCollection(
                    new Dictionary<string, string?> { ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true" }).Build());
                services.AddDbContext<PlatformDbContext>(options => options.UseSqlServer(database.ConnectionString,
                    sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", PlatformDbContext.Schema)));
                services.AddHttpContextAccessor();
                services.AddAuthentication();
                services.AddIdentityCore<PlatformApplicationUser>(options => options.SignIn.RequireConfirmedEmail = true)
                    .AddRoles<PlatformApplicationRole>().AddEntityFrameworkStores<PlatformDbContext>().AddSignInManager();
                services.AddSingleton<TimeProvider>(TimeProvider.System);
                services.AddSingleton<ICurrentExecutionContext, EmptyContext>();
                services.AddScoped<PlatformContractSource>();
                services.AddScoped<ITenantMembershipSource>(p => p.GetRequiredService<PlatformContractSource>());
                services.AddScoped<ICompanyAccessSource>(p => p.GetRequiredService<PlatformContractSource>());
                services.AddScoped<ISessionValidationSource>(p => p.GetRequiredService<PlatformContractSource>());
                services.AddScoped<IAccessTokenClaimMaterialSource>(p => p.GetRequiredService<PlatformContractSource>());
                services.AddScoped<ITenantModuleEntitlementSource>(p => p.GetRequiredService<PlatformContractSource>());
                services.AddScoped<ISelectionChallengeSource>(p => p.GetRequiredService<PlatformContractSource>());
                services.AddScoped<ErpSystem.Modules.Platform.Application.Tenancy.ITenantAccessSource>(p => p.GetRequiredService<PlatformContractSource>());
                services.AddPlatformApplication();
                var tokenOptions = new AuthenticationTokenOptions { Key = "system-session-integration-only-signing-key-123456789", Issuer = "system-session-test", Audience = "system-session-test" };
                services.AddSingleton<IAuthenticationTokenValidationParametersFactory>(new JwtAuthenticationTokenValidationParametersFactory(tokenOptions));
                services.AddScoped<IAuthenticationTokenService>(p => new JwtAuthenticationTokenService(tokenOptions,
                    p.GetRequiredService<IAccessTokenClaimMaterialService>(), p.GetRequiredService<IAuthenticationTokenValidationParametersFactory>()));
                services.AddScoped<PlatformIdentitySessionAdapter>();
                services.AddScoped<PlatformIdentityLoginAdapter>();
                provider = services.BuildServiceProvider();
                await new PlatformModule().MigrateAsync(provider);
                await using var scope = provider.CreateAsyncScope();
                var manager = scope.ServiceProvider.GetRequiredService<UserManager<PlatformApplicationUser>>();
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<PlatformApplicationRole>>();
                Assert.True((await roleManager.CreateAsync(new PlatformApplicationRole(PlatformRoleNames.SuperAdmin) { IsSystem = true })).Succeeded);
                var user = new PlatformApplicationUser { Id = "system-user", UserName = "system-user", Email = "system@example.test", EmailConfirmed = true, SecurityStamp = Stamp };
                Assert.True((await manager.CreateAsync(user, Password)).Succeeded);
                Assert.True((await manager.AddToRoleAsync(user, PlatformRoleNames.SuperAdmin)).Succeeded);
                return new Fixture(database, provider);
            }
            catch { if (provider is not null) await provider.DisposeAsync(); await database.DisposeAsync(); throw; }
        }

        public async Task<AuthenticationOperationResult<AuthenticationLoginResult>> TryLoginAsync()
        {
            await using var scope = services.CreateAsyncScope();
            scope.ServiceProvider.GetRequiredService<IHttpContextAccessor>().HttpContext = new DefaultHttpContext { RequestServices = scope.ServiceProvider };
            return await scope.ServiceProvider.GetRequiredService<PlatformIdentityLoginAdapter>()
                .PasswordLoginAsync(new("system-user", Password), CancellationToken.None);
        }
        public async Task<AuthenticationSessionResponse> LoginAsync()
        {
            var result = await TryLoginAsync();
            Assert.True(result.IsSuccess, result.Error.Code);
            return Assert.IsType<AuthenticationAuthenticatedLoginResult>(result.Value).Response;
        }
        public AuthenticationValidatedAccessToken Access(AuthenticationSessionResponse response) => Tokens.ValidateExpiredAccessToken(response.Token)!;
        public async Task<bool> BearerValidAsync(AuthenticationSessionResponse response, Claim? extraClaim = null)
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(response.Token,
                Validation.Create(Validation.Audience), out _);
            if (extraClaim is not null)
                Assert.IsAssignableFrom<ClaimsIdentity>(principal.Identity).AddClaim(extraClaim);
            var config = new ConfigurationBuilder().Build();
            var registration = new ServiceCollection();
            registration.AddLogging();
            registration.AddSingleton<IConfiguration>(config);
            registration.AddSingleton(Validation);
            registration.AddPlatformIdentity(config);
            await using var optionsProvider = registration.BuildServiceProvider();
            var options = optionsProvider.GetRequiredService<IOptionsMonitor<JwtBearerOptions>>()
                .Get(JwtBearerDefaults.AuthenticationScheme);
            await using var scope = services.CreateAsyncScope();
            var http = new DefaultHttpContext { RequestServices = scope.ServiceProvider };
            var context = new TokenValidatedContext(http,
                new AuthenticationScheme(JwtBearerDefaults.AuthenticationScheme, null, typeof(JwtBearerHandler)), options)
                { Principal = principal };
            await options.Events.OnTokenValidated(context);
            return context.Result?.Failure is null;
        }
        public async Task<bool> ValidAsync(AuthenticationSessionResponse response)
        {
            var access = Access(response);
            await using var scope = services.CreateAsyncScope();
            return (await scope.ServiceProvider.GetRequiredService<ISessionValidationService>().ValidateAsync(
                new(access.UserId, access.SessionId, access.SecurityStamp, access.TenantId, access.CompanyId)
                { SessionScope = access.SessionScope })).IsValid;
        }
        public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> RefreshAsync(AuthenticationSessionResponse response)
        {
            await using var scope = services.CreateAsyncScope();
            return await scope.ServiceProvider.GetRequiredService<PlatformIdentitySessionAdapter>().RefreshAsync(new(response.Token, response.RefreshToken), CancellationToken.None);
        }
        public async Task ChangeAsync(Func<PlatformDbContext, UserManager<PlatformApplicationUser>, PlatformApplicationUser, Task> change)
        {
            await using var scope = services.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
            var user = await db.Users.SingleAsync();
            await change(db, scope.ServiceProvider.GetRequiredService<UserManager<PlatformApplicationUser>>(), user);
            await db.SaveChangesAsync();
        }
        public async ValueTask DisposeAsync() { await services.DisposeAsync(); await database.DisposeAsync(); }
    }
    private sealed class EmptyContext : ICurrentExecutionContext
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }
}
