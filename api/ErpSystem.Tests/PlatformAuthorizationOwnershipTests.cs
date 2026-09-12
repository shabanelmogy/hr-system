using System.Security.Claims;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Entitlements;
using ErpSystem.Modules.Platform.Contracts.Modules;
using ErpSystem.Modules.Platform.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;

namespace ErpSystem.Tests;

public sealed class PlatformAuthorizationOwnershipTests
{
    [Fact]
    public void SharedAuthorizationPrimitives_HaveNoModuleDependencyAndPreservePolicyNames()
    {
        var references = typeof(HasPermissionAttribute).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();

        Assert.DoesNotContain(references, reference =>
            reference?.StartsWith("ErpSystem.Modules.", StringComparison.Ordinal) == true);
        Assert.Equal("TenantMember", AuthorizationPolicyNames.TenantMember);
        Assert.Equal("TenantMember", new TenantMemberAttribute().Policy);
        Assert.Equal("Orders:View", new HasPermissionAttribute("Orders:View").Policy);
        Assert.Equal("Permissions", PermissionClaimNames.Permission);
    }

    [Fact]
    public void HrPresentationAttributes_AreCompatibilityAliasesOverSharedPrimitives()
    {
        Assert.True(typeof(HasPermissionAttribute).IsAssignableFrom(
            typeof(ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters.HasPermissionAttribute)));
        Assert.True(typeof(TenantMemberAttribute).IsAssignableFrom(
            typeof(ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters.TenantMemberAttribute)));
        Assert.Equal(
            "TenantMember",
            new ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters.TenantMemberAttribute().Policy);
    }

    [Fact]
    public async Task PlatformPermission_WithClaim_SucceedsWithoutTenantEntitlement()
    {
        var entitlements = new RecordingEntitlementSource();
        var handler = new PermissionAuthorizationHandler(new TestModuleCatalogPolicy(), entitlements);
        var context = CreateContext(PlatformPermissions.ViewCountries);

        await handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
        Assert.Equal(0, entitlements.PermissionChecks);
        Assert.Equal(0, entitlements.AccessChecks);
    }

    [Fact]
    public async Task PlatformPermission_RemainsClaimOnlyForSuperAdminWithoutTenantScope()
    {
        var handler = new PermissionAuthorizationHandler(
            new TestModuleCatalogPolicy(),
            new RecordingEntitlementSource());
        var context = CreateContext(
            PlatformPermissions.ViewCountries,
            includeTenantScope: false,
            includeSuperAdmin: true);

        await handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
    }

    [Fact]
    public async Task UnknownPermission_FailsClosedEvenWhenClaimExists()
    {
        var handler = new PermissionAuthorizationHandler(
            new TestModuleCatalogPolicy(),
            new RecordingEntitlementSource());
        var context = CreateContext("Unknown:Permission");

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }

    [Theory]
    [InlineData(false, true)]
    [InlineData(true, false)]
    public async Task TenantModulePermission_RequiresLivePermissionAndEntitlement(
        bool hasLivePermission,
        bool hasEntitlement)
    {
        var entitlements = new RecordingEntitlementSource
        {
            UserHasPermission = hasLivePermission,
            HasAccess = hasEntitlement
        };
        var handler = new PermissionAuthorizationHandler(new TestModuleCatalogPolicy(), entitlements);
        var context = CreateContext("Orders:View");

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
        Assert.Equal(1, entitlements.PermissionChecks);
        Assert.Equal(hasLivePermission ? 1 : 0, entitlements.AccessChecks);
    }

    [Fact]
    public async Task TenantModulePermission_SucceedsWhenLivePermissionAndEntitlementRemainGranted()
    {
        var entitlements = new RecordingEntitlementSource
        {
            UserHasPermission = true,
            HasAccess = true
        };
        var handler = new PermissionAuthorizationHandler(new TestModuleCatalogPolicy(), entitlements);
        var context = CreateContext("Orders:View");

        await handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
        Assert.Equal(1, entitlements.PermissionChecks);
        Assert.Equal(1, entitlements.AccessChecks);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("0")]
    [InlineData("-1")]
    [InlineData("invalid")]
    public async Task TenantModulePermission_RequiresPositiveCompanyScope(string? companyId)
    {
        var entitlements = new RecordingEntitlementSource
        {
            UserHasPermission = true,
            HasAccess = true
        };
        var handler = new PermissionAuthorizationHandler(new TestModuleCatalogPolicy(), entitlements);
        var context = CreateContext("Orders:View", companyId: companyId);

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
        Assert.Equal(0, entitlements.PermissionChecks);
    }

    [Fact]
    public async Task TenantModulePermission_RejectsSuperAdminEvenWithTenantScope()
    {
        var entitlements = new RecordingEntitlementSource
        {
            UserHasPermission = true,
            HasAccess = true
        };
        var handler = new PermissionAuthorizationHandler(new TestModuleCatalogPolicy(), entitlements);
        var context = CreateContext("Orders:View", includeSuperAdmin: true);

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
        Assert.Equal(0, entitlements.PermissionChecks);
    }

    [Fact]
    public async Task TenantMemberPolicy_RequiresCompleteAuthenticatedTenantSessionScope()
    {
        var handler = new TenantMemberAuthorizationHandler();
        var context = CreateTenantMemberContext();

        await handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
    }

    [Fact]
    public async Task TenantMemberPolicy_RejectsUnauthenticatedAndSuperAdminPrincipals()
    {
        var handler = new TenantMemberAuthorizationHandler();

        var unauthenticated = CreateTenantMemberContext(isAuthenticated: false);
        await handler.HandleAsync(unauthenticated);
        Assert.False(unauthenticated.HasSucceeded);

        var superAdmin = CreateTenantMemberContext(includeSuperAdmin: true);
        await handler.HandleAsync(superAdmin);
        Assert.False(superAdmin.HasSucceeded);
    }

    [Fact]
    public async Task TenantMemberPolicy_RejectsPrincipalWithoutTenantRole()
    {
        var handler = new TenantMemberAuthorizationHandler();
        var identity = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, "user-1"),
            new Claim(AuthenticationTokenClaimNames.TenantId, "tenant-1"),
            new Claim(AuthenticationTokenClaimNames.SessionId, "session-1"),
            new Claim(AuthenticationTokenClaimNames.SecurityStamp, "stamp-1"),
            new Claim(AuthenticationTokenClaimNames.CompanyId, "11")
        ], "test");
        var context = new AuthorizationHandlerContext(
            [new TenantMemberRequirement()],
            new ClaimsPrincipal(identity),
            resource: null);

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }

    [Theory]
    [InlineData(false, true, true, true, true)]
    [InlineData(true, false, true, true, true)]
    [InlineData(true, true, false, true, true)]
    [InlineData(true, true, true, false, true)]
    [InlineData(true, true, true, true, false)]
    public async Task TenantMemberPolicy_RejectsMissingRequiredClaims(
        bool includeUser,
        bool includeTenant,
        bool includeSession,
        bool includeSecurityStamp,
        bool includeCompany)
    {
        var handler = new TenantMemberAuthorizationHandler();
        var context = CreateTenantMemberContext(
            includeUser,
            includeTenant,
            includeSession,
            includeSecurityStamp,
            includeCompany);

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-10")]
    [InlineData("not-a-number")]
    public async Task TenantMemberPolicy_RejectsInvalidCompanyId(string companyId)
    {
        var handler = new TenantMemberAuthorizationHandler();
        var context = CreateTenantMemberContext(companyId: companyId);

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }

    private static AuthorizationHandlerContext CreateContext(
        string permission,
        string? companyId = "11",
        bool includeTenantScope = true,
        bool includeSuperAdmin = false)
    {
        var requirement = new PermissionRequirement(permission);
        var claims = new List<Claim>
        {
            new(PermissionClaimNames.Permission, permission)
        };
        if (includeTenantScope)
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, "user-1"));
            claims.Add(new Claim(AuthenticationTokenClaimNames.TenantId, "tenant-1"));
            claims.Add(new Claim(AuthenticationTokenClaimNames.CompanyId, companyId ?? string.Empty));
        }
        if (includeSuperAdmin)
            claims.Add(new Claim(ClaimTypes.Role, PlatformRoleNames.SuperAdmin));

        var identity = new ClaimsIdentity(claims, "test");

        return new AuthorizationHandlerContext(
            [requirement],
            new ClaimsPrincipal(identity),
            resource: null);
    }

    private static AuthorizationHandlerContext CreateTenantMemberContext(
        bool includeUser = true,
        bool includeTenant = true,
        bool includeSession = true,
        bool includeSecurityStamp = true,
        bool includeCompany = true,
        string companyId = "11",
        bool isAuthenticated = true,
        bool includeSuperAdmin = false)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Role, PlatformRoleNames.User)
        };
        if (includeUser)
            claims.Add(new Claim(ClaimTypes.NameIdentifier, "user-1"));
        if (includeTenant)
            claims.Add(new Claim(AuthenticationTokenClaimNames.TenantId, "tenant-1"));
        if (includeSession)
            claims.Add(new Claim(AuthenticationTokenClaimNames.SessionId, "session-1"));
        if (includeSecurityStamp)
            claims.Add(new Claim(AuthenticationTokenClaimNames.SecurityStamp, "stamp-1"));
        if (includeCompany)
            claims.Add(new Claim(AuthenticationTokenClaimNames.CompanyId, companyId));
        if (includeSuperAdmin)
            claims.Add(new Claim(ClaimTypes.Role, PlatformRoleNames.SuperAdmin));

        var identity = new ClaimsIdentity(claims, isAuthenticated ? "test" : null);
        return new AuthorizationHandlerContext(
            [new TenantMemberRequirement()],
            new ClaimsPrincipal(identity),
            resource: null);
    }

    private sealed class TestModuleCatalogPolicy : IModuleCatalogPolicy
    {
        public IReadOnlyList<ModuleCatalogItem> GetInstalled() => [];
        public IReadOnlyList<TenantModuleEntitlementRequest> GetDefaultEntitlements() => [];
        public Task<IReadOnlyList<ModuleCatalogItem>> GetAccessibleAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<ModuleCatalogItem>>([]);

        public bool TryResolvePermission(
            string permission,
            out string moduleCode,
            out string submoduleCode)
        {
            if (permission == "Orders:View")
            {
                moduleCode = "sales";
                submoduleCode = "orders";
                return true;
            }

            moduleCode = string.Empty;
            submoduleCode = string.Empty;
            return false;
        }

        public Task<bool> IsSuperAdminAsync(
            string userId,
            CancellationToken cancellationToken = default) => Task.FromResult(false);

        public bool IsValidEntitlement(
            IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
            out string? invalidCode)
        {
            invalidCode = null;
            return true;
        }
    }

    private sealed class RecordingEntitlementSource : ITenantModuleEntitlementSource
    {
        public bool UserHasPermission { get; init; }
        public bool HasAccess { get; init; }
        public int PermissionChecks { get; private set; }
        public int AccessChecks { get; private set; }

        public Task ApplyAsync(
            string tenantId,
            IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
            CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<bool> HasAccessAsync(
            string tenantId,
            string moduleCode,
            string submoduleCode,
            CancellationToken cancellationToken = default)
        {
            AccessChecks++;
            return Task.FromResult(HasAccess);
        }

        public Task<IReadOnlyList<TenantModuleEntitlementResponse>> GetAsync(
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<TenantModuleEntitlementResponse>>([]);

        public Task<bool> UserHasPermissionAsync(
            string userId,
            string tenantId,
            string permission,
            CancellationToken cancellationToken = default)
        {
            PermissionChecks++;
            return Task.FromResult(UserHasPermission);
        }

        public Task<IReadOnlySet<string>> GetUserPermissionsAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlySet<string>>(new HashSet<string>());

        public Task<bool> IsSuperAdminAsync(
            string userId,
            CancellationToken cancellationToken = default) => Task.FromResult(false);
    }
}
