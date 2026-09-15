using System.Security.Claims;
using System.Text.Encodings.Web;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Contacts.Application.Parties;
using ErpSystem.Modules.Contacts.Application;
using ErpSystem.Modules.Contacts.Application.Messaging;
using ErpSystem.Modules.Contacts;
using ErpSystem.Modules.Contacts.Contracts;
using ErpSystem.Modules.Contacts.Domain;
using ErpSystem.Modules.Contacts.Presentation;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.Modules.Platform.Infrastructure.Authorization;
using ErpSystem.Modules.Platform.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using FluentValidation;

namespace ErpSystem.IntegrationTests;

public sealed class ContactsAuthorizationTests
{
    [Fact]
    public async Task ContactsPermission_RequiresPermissionClaim()
    {
        var context = CreateContext(includePermissionClaim: false);
        var handler = new PermissionAuthorizationHandler(
            new ContactsCatalogPolicy(),
            new EntitlementSource(userPermission: true, moduleAccess: true));

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }

    [Fact]
    public async Task ContactsPermission_RequiresLiveUserEntitlement()
    {
        var context = CreateContext(includePermissionClaim: true);
        var handler = new PermissionAuthorizationHandler(
            new ContactsCatalogPolicy(),
            new EntitlementSource(userPermission: false, moduleAccess: true));

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }

    [Fact]
    public async Task ContactsPermission_RequiresPurchasedModuleAccess()
    {
        var context = CreateContext(includePermissionClaim: true);
        var handler = new PermissionAuthorizationHandler(
            new ContactsCatalogPolicy(),
            new EntitlementSource(userPermission: true, moduleAccess: false));

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }

    [Fact]
    public async Task ContactsPermission_AllowsAuthenticatedScopedUserWithPermissionAndEntitlement()
    {
        var context = CreateContext(includePermissionClaim: true);
        var handler = new PermissionAuthorizationHandler(
            new ContactsCatalogPolicy(),
            new EntitlementSource(userPermission: true, moduleAccess: true));

        await handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
    }

    [Theory]
    [InlineData("anonymous", 401)]
    [InlineData("authenticated-no-permission", 403)]
    [InlineData("revoked-entitlement", 403)]
    [InlineData("allowed", 200)]
    public async Task ContactsController_EnforcesAuthenticationPermissionAndEntitlementOverHttp(
        string mode,
        int expectedStatus)
    {
        await using var host = await ContactsHttpHost.StartAsync(mode);
        using var client = host.CreateClient(mode);

        var response = await client.GetAsync($"/api/v1/contacts/parties/{Guid.NewGuid()}");

        var body = await response.Content.ReadAsStringAsync();
        Assert.True((int)response.StatusCode == expectedStatus, body);
    }

    private static AuthorizationHandlerContext CreateContext(bool includePermissionClaim)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "user-1"),
            new(AuthenticationTokenClaimNames.TenantId, "tenant-1"),
            new(AuthenticationTokenClaimNames.CompanyId, "7"),
            new(ClaimTypes.Role, PlatformRoleNames.User)
        };
        if (includePermissionClaim)
            claims.Add(new Claim(PermissionClaimNames.Permission, PartyPermissions.View));

        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Bearer"));
        return new AuthorizationHandlerContext(
            [new PermissionRequirement(PartyPermissions.View)],
            principal,
            resource: null);
    }

    private sealed class ContactsCatalogPolicy : IModuleCatalogPolicy
    {
        public IReadOnlyList<ModuleCatalogItem> GetInstalled() => [];

        public IReadOnlyList<ModuleCatalogItem> GetTenantEntitlementCatalog() => [];

        public IReadOnlyList<TenantModuleEntitlementRequest> GetDefaultEntitlements() => [];

        public Task<IReadOnlyList<ModuleCatalogItem>> GetAccessibleAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<ModuleCatalogItem>>([]);

        public IReadOnlySet<string> GetKnownPermissions() =>
            PartyPermissions.All.ToHashSet(StringComparer.Ordinal);

        public IReadOnlySet<string> GetTenantAssignablePermissions() =>
            PartyPermissions.All.ToHashSet(StringComparer.Ordinal);

        public bool TryResolvePermission(
            string permission,
            out ModulePermissionCatalogItem resolvedPermission)
        {
            if (permission == PartyPermissions.View)
            {
                resolvedPermission = new ModulePermissionCatalogItem(
                    permission,
                    "contacts",
                    "parties",
                    RequiresTenantScope: true,
                    RequiresTenantEntitlement: true);
                return true;
            }

            resolvedPermission = new ModulePermissionCatalogItem(
                permission,
                string.Empty,
                string.Empty,
                RequiresTenantScope: false,
                RequiresTenantEntitlement: false);
            return false;
        }

        public Task<bool> IsSuperAdminAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public bool IsValidEntitlement(
            IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
            out string? invalidCode)
        {
            invalidCode = null;
            return true;
        }
    }

    private class EntitlementSource(bool userPermission, bool moduleAccess)
        : ITenantModuleEntitlementSource
    {
        public Task ApplyAsync(
            string tenantId,
            IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
            CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<bool> HasAccessAsync(
            string tenantId,
            string moduleCode,
            string submoduleCode,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(moduleAccess);

        public Task<IReadOnlyList<TenantModuleEntitlementResponse>> GetAsync(
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<TenantModuleEntitlementResponse>>([]);

        public Task<bool> UserHasPermissionAsync(
            string userId,
            string tenantId,
            string permission,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(userPermission);

        public Task<IReadOnlySet<string>> GetUserPermissionsAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlySet<string>>(new HashSet<string>());

        public Task<bool> IsSuperAdminAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);
    }

    private sealed class ContactsHttpHost : IAsyncDisposable
    {
        private readonly WebApplication _application;

        private ContactsHttpHost(WebApplication application) => _application = application;

        public static async Task<ContactsHttpHost> StartAsync(string mode)
        {
            var builder = WebApplication.CreateBuilder(new WebApplicationOptions
            {
                EnvironmentName = "Development",
                ApplicationName = typeof(ContactsHttpHost).Assembly.GetName().Name
            });
            builder.WebHost.UseDefaultServiceProvider(options =>
            {
                options.ValidateOnBuild = false;
                options.ValidateScopes = false;
            });
            builder.WebHost.UseUrls("http://127.0.0.1:0");
            builder.Services.AddRouting();
            builder.Services.AddControllers().AddApplicationPart(typeof(PartiesController).Assembly);
            builder.Services.AddMediatR(config => config.RegisterServicesFromAssembly(typeof(CreatePartyCommand).Assembly));
            builder.Services.AddValidatorsFromAssembly(typeof(CreatePartyCommand).Assembly, includeInternalTypes: true);
            builder.Services.AddScoped<IPartyStore, HttpPartyStore>();
            builder.Services.AddScoped<IContactsOutbox, NoOpContactsOutbox>();
            builder.Services.AddScoped<ICurrentExecutionContext, HttpExecutionContext>();
            builder.Services.AddSingleton(TimeProvider.System);

            var moduleCatalog = new ErpSystem.BuildingBlocks.Modularity.ModuleCatalog(
                [new ContactsModule()]);
            builder.Services.AddSingleton(moduleCatalog);
            builder.Services.AddSingleton<MutableEntitlementSource>(new MutableEntitlementSource(
                userPermission: mode is "allowed" or "revoked-entitlement",
                moduleAccess: mode == "allowed"));
            builder.Services.AddSingleton<ITenantModuleEntitlementSource>(provider =>
                provider.GetRequiredService<MutableEntitlementSource>());
            ServiceCollectionAuthorizationExtensions.AddPlatformAuthorizationServices(builder.Services);
            builder.Services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>("Test", _ => { });
            builder.Services.AddAuthorizationBuilder()
                .AddPolicy(
                    AuthorizationPolicyNames.TenantMember,
                    policy => policy.AddRequirements(new TenantMemberRequirement()));

            var application = builder.Build();
            application.UseAuthentication();
            application.UseAuthorization();
            application.MapControllers();
            await application.StartAsync();
            return new ContactsHttpHost(application);
        }

        public HttpClient CreateClient(string mode)
        {
            var client = new HttpClient { BaseAddress = new Uri(_application.Urls.Single()) };
            client.DefaultRequestHeaders.Add("X-Test-Mode", mode);
            return client;
        }

        public async ValueTask DisposeAsync()
        {
            await _application.StopAsync();
            await _application.DisposeAsync();
        }
    }

    private static class ServiceCollectionAuthorizationExtensions
    {
        public static IServiceCollection AddPlatformAuthorizationServices(IServiceCollection services)
        {
            services.AddTransient<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
            services.AddTransient<IAuthorizationHandler, PermissionAuthorizationHandler>();
            services.AddTransient<IAuthorizationHandler, TenantMemberAuthorizationHandler>();
            services.AddSingleton<IModuleCatalogPolicy, RealModuleCatalogPolicy>();
            return services;
        }
    }

    private sealed class RealModuleCatalogPolicy(ModuleCatalog catalog) : IModuleCatalogPolicy
    {
        public IReadOnlyList<ModuleCatalogItem> GetInstalled() => [];
        public IReadOnlyList<ModuleCatalogItem> GetTenantEntitlementCatalog() => [];
        public IReadOnlyList<TenantModuleEntitlementRequest> GetDefaultEntitlements() => [];
        public Task<IReadOnlyList<ModuleCatalogItem>> GetAccessibleAsync(string userId, string tenantId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<ModuleCatalogItem>>([]);

        public IReadOnlySet<string> GetKnownPermissions() =>
            catalog.Definitions
                .SelectMany(static definition => definition.Submodules)
                .SelectMany(static submodule => submodule.RequiredPermissions)
                .ToHashSet(StringComparer.Ordinal);

        public IReadOnlySet<string> GetTenantAssignablePermissions() =>
            catalog.Definitions
                .SelectMany(static definition => definition.Submodules)
                .Where(static submodule => submodule.PermissionAccessMode != PermissionAccessMode.Global)
                .SelectMany(static submodule => submodule.RequiredPermissions)
                .ToHashSet(StringComparer.Ordinal);

        public bool TryResolvePermission(
            string permission,
            out ModulePermissionCatalogItem resolvedPermission)
        {
            foreach (var module in catalog.Definitions)
            {
                var submodule = module.Submodules.FirstOrDefault(candidate => candidate.RequiredPermissions.Contains(permission, StringComparer.Ordinal));
                if (submodule is null) continue;

                resolvedPermission = new ModulePermissionCatalogItem(
                    permission,
                    module.Code,
                    submodule.Code,
                    RequiresTenantScope: submodule.PermissionAccessMode != PermissionAccessMode.Global,
                    RequiresTenantEntitlement: submodule.PermissionAccessMode == PermissionAccessMode.TenantEntitlement);
                return true;
            }

            resolvedPermission = new ModulePermissionCatalogItem(
                permission,
                string.Empty,
                string.Empty,
                RequiresTenantScope: false,
                RequiresTenantEntitlement: false);
            return false;
        }

        public Task<bool> IsSuperAdminAsync(string userId, CancellationToken cancellationToken = default) => Task.FromResult(false);
        public bool IsValidEntitlement(IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements, out string? invalidCode) { invalidCode = null; return true; }
    }

    private sealed class MutableEntitlementSource(bool userPermission, bool moduleAccess)
        : EntitlementSource(userPermission, moduleAccess);

    private sealed class TestAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
    {
        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var mode = Request.Headers["X-Test-Mode"].ToString();
            if (string.Equals(mode, "anonymous", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult(AuthenticateResult.NoResult());

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, "user-1"),
                new(AuthenticationTokenClaimNames.TenantId, "tenant-1"),
                new(AuthenticationTokenClaimNames.CompanyId, "7"),
                new(AuthenticationTokenClaimNames.SessionId, "session-1"),
                new(AuthenticationTokenClaimNames.SecurityStamp, "stamp-1"),
                new(ClaimTypes.Role, PlatformRoleNames.User)
            };
            if (string.Equals(mode, "allowed", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(mode, "revoked-entitlement", StringComparison.OrdinalIgnoreCase))
                claims.Add(new Claim(PermissionClaimNames.Permission, PartyPermissions.View));

            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, Scheme.Name));
            return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, Scheme.Name)));
        }

        protected override Task HandleChallengeAsync(AuthenticationProperties properties)
        {
            Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }
    }

    private sealed class HttpExecutionContext : ICurrentExecutionContext
    {
        public string? UserId => "user-1";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 7;
    }

    private sealed class HttpPartyStore : IPartyStore
    {
        private static readonly Party Party = ErpSystem.Modules.Contacts.Domain.Party.Create(
            Guid.NewGuid(), "tenant-1", 7, "HTTP party", null, null, DateTimeOffset.UtcNow);

        public Task<Party?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => Task.FromResult<Party?>(Party);
        public void Add(Party party) { }
        public Task SaveChangesAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    }

    private sealed class NoOpContactsOutbox : IContactsOutbox
    {
        public void Enqueue(IntegrationEvent integrationEvent) { }
        public Task<IReadOnlyList<ErpSystem.Modules.Contacts.Infrastructure.Messaging.OutboxMessage>> ClaimDueAsync(DateTimeOffset nowUtc, int batchSize, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<ErpSystem.Modules.Contacts.Infrastructure.Messaging.OutboxMessage>>([]);
        public Task<IReadOnlyList<ErpSystem.Modules.Contacts.Infrastructure.Messaging.OutboxMessage>> ClaimDueAsync(DateTimeOffset nowUtc, int batchSize, TimeSpan processingTimeout, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<ErpSystem.Modules.Contacts.Infrastructure.Messaging.OutboxMessage>>([]);
        public Task MarkPublishedAsync(Guid eventId, DateTimeOffset publishedOnUtc, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task MarkFailedAsync(Guid eventId, string error, DateTimeOffset? nextAttemptOnUtc, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task MarkDeadAsync(Guid eventId, string error, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}

