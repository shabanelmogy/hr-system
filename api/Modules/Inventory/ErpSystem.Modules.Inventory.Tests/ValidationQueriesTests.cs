using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Abstractions;
using ErpSystem.Modules.Inventory.Domain.Catalog.Categories.Entities;
using ErpSystem.Modules.Inventory.Infrastructure;
using ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.Categories.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Inventory.Tests;

public sealed class ValidationQueriesTests
{
    [Fact]
    public void InventoryInfrastructure_RegistersItsValidationQueryPorts()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(localdb)\\mssqllocaldb;Database=ValidationRegistration;Trusted_Connection=True;"
            })
            .Build();
        var services = new ServiceCollection();
        services.AddScoped<ICurrentActor>(_ => new TestCurrentActor());
        services.AddInventoryInfrastructure(configuration);

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<ICategoryValidationQueries>());
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<ISubCategoryValidationQueries>());
    }

    [Fact]
    public async Task CategoryQueries_ExcludeCurrentRecordDuringUpdateCheck()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new InventoryDbContext(options);
        var category = new Category
        {
            TenantId = "validation-test-tenant",
            CompanyId = 1,
            NameAr = "Category Arabic",
            NameEn = "Category English"
        };
        context.Categories.Add(category);
        await context.SaveChangesAsync();
        ICategoryValidationQueries queries = new CategoryValidationQueries(context, new TestCurrentActor());

        Assert.True(await queries.CategoryNameArExistsAsync(
            category.NameAr,
            null,
            CancellationToken.None));
        Assert.False(await queries.CategoryNameArExistsAsync(
            category.NameAr,
            category.Id,
            CancellationToken.None));
    }

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => "validation-test-user";
        public string? TenantId => "validation-test-tenant";
        public int? CompanyId => 1;
    }
}

