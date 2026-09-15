using System.Security.Claims;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformAccessTokenClaimMaterialOwnershipTests
{
    [Fact]
    public void TokenOwnership_KeepsRuntimeTypesInApplicationAndWireConstantsInContracts()
    {
        var applicationAssembly = typeof(IAccessTokenClaimMaterialService).Assembly;
        var contractsAssembly = typeof(AuthenticationTokenClaimNames).Assembly;

        Assert.Equal("ErpSystem.Modules.Platform.Application", applicationAssembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Contracts", contractsAssembly.GetName().Name);
        Assert.Same(applicationAssembly, typeof(IAccessTokenClaimMaterialSource).Assembly);
        Assert.Same(applicationAssembly, typeof(IAuthenticationTokenService).Assembly);
        Assert.Same(applicationAssembly, typeof(AuthenticationTokenOptions).Assembly);
        Assert.Same(applicationAssembly, typeof(AccessTokenUserSnapshot).Assembly);

        var platformApplicationReferences = applicationAssembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var platformContractsReferences = contractsAssembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();

        Assert.DoesNotContain(platformApplicationReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.DoesNotContain(platformContractsReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);

        var applicationTokenTypes = applicationAssembly.GetTypes()
            .Where(type => type.Namespace?.StartsWith(
                "ErpSystem.Modules.Platform.Application.Authentication.Tokens",
                StringComparison.Ordinal) == true)
            .ToArray();

        Assert.Contains(typeof(IAccessTokenClaimMaterialService), applicationTokenTypes);
        Assert.Contains(typeof(IAuthenticationTokenService), applicationTokenTypes);
        Assert.DoesNotContain(applicationTokenTypes, type => type.FullName?.Contains("ApplicationUser", StringComparison.Ordinal) == true);
        Assert.DoesNotContain(applicationTokenTypes, type => type.FullName?.Contains("Permissions", StringComparison.Ordinal) == true);

        var publicTokenContractTypes = contractsAssembly.GetTypes()
            .Where(type => string.Equals(
                type.Namespace,
                "ErpSystem.Modules.Platform.Contracts.Authentication.Tokens",
                StringComparison.Ordinal))
            .ToArray();

        Assert.Equal([typeof(AuthenticationTokenClaimNames)], publicTokenContractTypes);
    }

    [Fact]
    public async Task PlatformApplication_ComposesExactRolePolicyDefaultsAndClaimDeduplication()
    {
        var source = new RecordingSource
        {
            Snapshot = new AccessTokenClaimMaterialSourceSnapshot(
                new AccessTokenTenantSnapshot("tenant-a", " Tenant A ", "  Enterprise  "),
                [
                    new("system", "admin", null, true, false),
                    new("tenant-role", "Planner", "tenant-a", false, false),
                    new("deleted", "Deleted", "tenant-a", false, true),
                    new("other", "Other", "tenant-b", false, false)
                ],
                [
                    new("system", "Permissions", "Countries:View"),
                    new("tenant-role", "Permissions", "Countries:View"),
                    new("tenant-role", "Custom", "One"),
                    new("tenant-role", ClaimTypes.Name, "user-name"),
                    new("deleted", "Permissions", "Deleted:View"),
                    new("other", "Permissions", "Other:View"),
                    new("tenant-role", null, "Ignored"),
                    new("tenant-role", "Ignored", null)
                ])
        };
        var services = new ServiceCollection();
        services.AddSingleton<IAccessTokenClaimMaterialSource>(source);
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IAccessTokenClaimMaterialService>();
        var result = await service.BuildAsync(new AccessTokenClaimMaterialRequest(
            new AccessTokenUserSnapshot(
                "user-1",
                "user-name",
                "user@example.com",
                "First",
                "Last",
                "stamp"),
            "session-1",
            "jwt-1",
            7,
            "tenant-a"));

        Assert.Equal(" Tenant A ", result.TenantName);
        Assert.Equal("Enterprise", result.TenantPlanName);
        Assert.Equal(("user-1", "tenant-a"), source.LastScope);

        var claims = result.Claims.Select(claim => (claim.Type, claim.Value)).ToArray();
        Assert.Contains((ClaimTypes.Email, "user@example.com"), claims);
        Assert.Contains((ClaimTypes.NameIdentifier, "user-1"), claims);
        Assert.Contains((AccessTokenClaimNames.FirstName, "First"), claims);
        Assert.Contains((AccessTokenClaimNames.LastName, "Last"), claims);
        Assert.Contains((AccessTokenClaimNames.JwtId, "jwt-1"), claims);
        Assert.Contains((AccessTokenClaimNames.SessionId, "session-1"), claims);
        Assert.Contains((AccessTokenClaimNames.SecurityStamp, "stamp"), claims);
        Assert.Contains((AccessTokenClaimNames.TenantId, "tenant-a"), claims);
        Assert.Contains((AccessTokenClaimNames.TenantName, " Tenant A "), claims);
        Assert.Contains((AccessTokenClaimNames.TenantPlanName, "Enterprise"), claims);
        Assert.Contains((AccessTokenClaimNames.CompanyId, "7"), claims);
        Assert.Equal(1, claims.Count(claim => claim == (ClaimTypes.Name, "user-name")));
        Assert.Contains((ClaimTypes.Role, "admin"), claims);
        Assert.Contains((ClaimTypes.Role, "Planner"), claims);
        Assert.DoesNotContain((ClaimTypes.Role, "Deleted"), claims);
        Assert.DoesNotContain((ClaimTypes.Role, "Other"), claims);
        Assert.Contains((AccessTokenClaimNames.TenantRoleId, "tenant-role"), claims);
        Assert.DoesNotContain((AccessTokenClaimNames.TenantRoleId, "system"), claims);
        Assert.Equal(1, claims.Count(claim => claim == ("Permissions", "Countries:View")));
        Assert.Contains(("Custom", "One"), claims);
        Assert.DoesNotContain(("Permissions", "Deleted:View"), claims);
        Assert.DoesNotContain(("Permissions", "Other:View"), claims);
    }

    [Fact]
    public void PlatformClaimNames_PreserveExistingHrWireConstants()
    {
        Assert.Equal(AuthenticationTokenClaimNames.FirstName, AccessTokenClaimNames.FirstName);
        Assert.Equal(AuthenticationTokenClaimNames.LastName, AccessTokenClaimNames.LastName);
        Assert.Equal(AuthenticationTokenClaimNames.SessionId, AccessTokenClaimNames.SessionId);
        Assert.Equal(AuthenticationTokenClaimNames.SecurityStamp, AccessTokenClaimNames.SecurityStamp);
        Assert.Equal(AuthenticationTokenClaimNames.TenantId, AccessTokenClaimNames.TenantId);
        Assert.Equal(AuthenticationTokenClaimNames.TenantName, AccessTokenClaimNames.TenantName);
        Assert.Equal(AuthenticationTokenClaimNames.TenantPlanName, AccessTokenClaimNames.TenantPlanName);
        Assert.Equal(AuthenticationTokenClaimNames.CompanyId, AccessTokenClaimNames.CompanyId);
        Assert.Equal(AuthenticationTokenClaimNames.TenantRoleId, AccessTokenClaimNames.TenantRoleId);
    }

    [Fact]
    public async Task PlatformApplication_MissingTenantPreservesLegacyNameAndFreePlanFallback()
    {
        var source = new RecordingSource
        {
            Snapshot = new AccessTokenClaimMaterialSourceSnapshot(null, [], [])
        };
        var services = new ServiceCollection();
        services.AddSingleton<IAccessTokenClaimMaterialSource>(source);
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<IAccessTokenClaimMaterialService>();
        var result = await service.BuildAsync(new AccessTokenClaimMaterialRequest(
            new AccessTokenUserSnapshot("u", "user", "mail", "f", "l", "s"),
            "sid",
            "jti",
            1,
            "missing-tenant"));

        Assert.Equal("missing-tenant", result.TenantName);
        Assert.Equal("Free", result.TenantPlanName);
    }

    private sealed class RecordingSource : IAccessTokenClaimMaterialSource
    {
        public required AccessTokenClaimMaterialSourceSnapshot Snapshot { get; init; }
        public (string UserId, string TenantId)? LastScope { get; private set; }

        public Task<AccessTokenClaimMaterialSourceSnapshot> GetAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            LastScope = (userId, tenantId);
            return Task.FromResult(Snapshot);
        }
    }

}

