using ErpSystem.Modules.Accounting.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Accounting.Tests;

public sealed class AccountingModuleFoundationTests
{
    [Fact]
    public void ModuleIdentityAndSchema_AreAccountingOwned()
    {
        Assert.Equal("Accounting", new AccountingModule().Name);
        Assert.Equal("acc", AccountingDbContext.Schema);
    }

    [Fact]
    public void DbContext_UsesAccountingSchemaAndAppliesOwnedEntityConfigurations()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(local);Database=AccountingFoundationTests;Trusted_Connection=True;TrustServerCertificate=True"
            })
            .Build();
        var services = new ServiceCollection();
        services.AddAccountingInfrastructure(configuration);

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();

        Assert.Equal("acc", db.Model.GetDefaultSchema());
        var configuredEntityTypes = typeof(AccountingDbContext).Assembly
            .GetTypes()
            .Where(type => type.GetInterfaces().Any(interfaceType =>
                interfaceType.IsGenericType
                && interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)))
            .SelectMany(type => type.GetInterfaces()
                .Where(interfaceType =>
                    interfaceType.IsGenericType
                    && interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>))
                .Select(interfaceType => interfaceType.GetGenericArguments()[0]))
            .Distinct()
            .ToArray();

        Assert.NotEmpty(configuredEntityTypes);
        foreach (var entityType in configuredEntityTypes)
            Assert.NotNull(db.Model.FindEntityType(entityType));
    }
}
