using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Validation;
using HrManagementSystem.Application.Features.Catalog.Categories.Abstractions;
using HrManagementSystem.Domain.Catalog.Categories.Entities;
using HrManagementSystem.Infrastructure.Dependencies;
using HrManagementSystem.Infrastructure.Features.Catalog.Categories.Persistence;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HrManagementSystem.Tests;

public sealed class ValidationQueriesTests
{
    [Fact]
    public void DatabaseService_RegistersEveryValidationQueryImplementation()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(localdb)\\mssqllocaldb;Database=ValidationRegistration;Trusted_Connection=True;"
            })
            .Build();
        var services = new ServiceCollection();
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<ICurrentActor>(_ => new TestCurrentActor());
        services.AddDatabaseservice(configuration);

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var validationInterfaces = typeof(IValidationQuery).Assembly
            .GetTypes()
            .Where(type => type.IsInterface &&
                           type != typeof(IValidationQuery) &&
                           typeof(IValidationQuery).IsAssignableFrom(type))
            .ToList();

        Assert.Equal(9, validationInterfaces.Count);
        Assert.All(validationInterfaces, interfaceType =>
            Assert.NotNull(scope.ServiceProvider.GetRequiredService(interfaceType)));
    }

    [Fact]
    public async Task CategoryQueries_ExcludeCurrentRecordDuringUpdateCheck()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor(),
            TimeProvider.System);
        var category = new Category
        {
            NameAr = "Category Arabic",
            NameEn = "Category English"
        };
        context.Categories.Add(category);
        await context.SaveChangesAsync();
        ICategoryValidationQueries queries = new CategoryValidationQueries(context);

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
