using ErpSystem.Api.Hosting;
using ErpSystem.Api.Modules;
using ErpSystem.BuildingBlocks.Modularity;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ErpSystem.IntegrationTests;

public sealed class ModuleDependencyInjectionCompositionTests
{
    [Fact]
    public void InstalledModules_BuildWithStrictServiceValidation()
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            EnvironmentName = Environments.Development
        });
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\mssqllocaldb;Database=ErpSystemComposition;Trusted_Connection=True;TrustServerCertificate=True;",
            ["CorsSettings:AllowedOrigins:0"] = "http://localhost:3000",
            ["HangfireSettings:AllowedHosts:0"] = "localhost"
        });
        var modules = ErpModuleRegistry.Create();

        builder.Host.UseDefaultServiceProvider((_, options) =>
        {
            options.ValidateOnBuild = true;
            options.ValidateScopes = true;
        });
        builder.Services.AddErpHostInfrastructure(
            builder.Configuration,
            modules.Select(module => module.Name));
        builder.Services.AddModules(builder.Configuration, modules);

        using var app = builder.Build();

        Assert.NotNull(app.Services.GetRequiredService<ModuleCatalog>());
    }
}
