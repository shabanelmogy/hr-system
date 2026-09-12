using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.Authentication.SelectionChallenges;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.Entitlements;
using ErpSystem.Modules.Platform.Contracts.SessionValidation;
using ErpSystem.Modules.Platform.Contracts.TenantMembership;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using ErpSystem.Modules.Platform.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class PlatformDirectPersistenceOwnershipTests
{
    [Fact]
    public void PlatformInfrastructure_OwnsCoreTenantIdentityReadSourcesWithoutHrRuntimeTypes()
    {
        var services = new ServiceCollection();
        services.AddPlatformApplication();
        services.AddPlatformInfrastructure(Configuration());

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();

        var sources = new object[]
        {
            scope.ServiceProvider.GetRequiredService<ITenantAccessSource>(),
            scope.ServiceProvider.GetRequiredService<ITenantMembershipSource>(),
            scope.ServiceProvider.GetRequiredService<ICompanyAccessSource>(),
            scope.ServiceProvider.GetRequiredService<ISessionValidationSource>(),
            scope.ServiceProvider.GetRequiredService<IAccessTokenClaimMaterialSource>(),
            scope.ServiceProvider.GetRequiredService<ITenantModuleEntitlementSource>()
        };

        Assert.All(sources, source =>
            Assert.Equal("ErpSystem.Modules.Platform.Infrastructure", source.GetType().Assembly.GetName().Name));
        Assert.All(sources.Skip(1), source => Assert.Same(sources[0], source));
        Assert.Null(scope.ServiceProvider.GetService<ISelectionChallengeSource>());

        var platformReferences = typeof(PlatformDbContext).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        Assert.DoesNotContain(platformReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
    }

    [Fact]
    public void PlatformLegacyMappings_PointAtHrSchemaAndAreExcludedFromPlatformMigrations()
    {
        var services = new ServiceCollection();
        services.AddPlatformInfrastructure(Configuration());

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        using var context = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();

        var designTimeModel = context.GetService<IDesignTimeModel>().Model;
        var legacyMappings = designTimeModel.GetEntityTypes()
            .Where(entity => string.Equals(entity.GetSchema(), "hr", StringComparison.Ordinal))
            .ToArray();

        Assert.NotEmpty(legacyMappings);
        Assert.Contains(legacyMappings, entity => entity.GetTableName() == "Tenants");
        Assert.Contains(legacyMappings, entity => entity.GetTableName() == "Companies");
        Assert.Contains(legacyMappings, entity => entity.GetTableName() == "AspNetUsers");
        Assert.Contains(legacyMappings, entity => entity.GetTableName() == "RefreshToken");
        Assert.DoesNotContain(legacyMappings, entity => entity.GetTableName() == "AuthenticationSelectionChallenges");
        Assert.Contains(legacyMappings, entity => entity.GetTableName() == "TenantModuleEntitlements");

        Assert.All(legacyMappings, entity =>
        {
            var table = Assert.Single(entity.GetTableMappings()).Table;
            Assert.True(table.IsExcludedFromMigrations);
        });
    }

    private static IConfiguration Configuration() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(localdb)\\mssqllocaldb;Database=erp-platform-ownership-tests;Trusted_Connection=True;",
                ["JwtOptions:Key"] = "test-only-platform-direct-persistence-signing-key",
                ["JwtOptions:Issuer"] = "ErpSystem.Tests",
                ["JwtOptions:Audience"] = "ErpSystem.Tests.Web"
            })
            .Build();
}
