using System.ComponentModel.DataAnnotations;
using HrManagementSystem.Infrastructure.Common.Settings;
using HrManagementSystem.Infrastructure.Dependencies;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.Tests;

public sealed class OperationalFoundationTests
{
    [Fact]
    public void MailSettings_RequireValidSmtpConfiguration()
    {
        var settings = new MailSettings
        {
            Mail = "not-an-email",
            DisplayName = "HR",
            Password = "",
            Host = "",
            Port = 0
        };

        Assert.False(Validator.TryValidateObject(
            settings,
            new ValidationContext(settings),
            [],
            validateAllProperties: true));
    }

    [Fact]
    public void AppSettings_RequireAbsoluteFrontendUrl()
    {
        var settings = new AppSettings { FrontendUrl = "localhost" };

        Assert.False(Validator.TryValidateObject(
            settings,
            new ValidationContext(settings),
            [],
            validateAllProperties: true));
    }

    [Fact]
    public void CorsService_RejectsOriginsContainingPaths()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["CorsSettings:AllowedOrigins:0"] = "https://localhost:3000/api"
        });

        Assert.Throws<InvalidOperationException>(() =>
            new ServiceCollection().AddCorsService(configuration));
    }

    [Fact]
    public void HealthChecks_ContainOnlyReadinessDependencies()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\mssqllocaldb;Database=HealthChecks;Trusted_Connection=True;"
        });
        var services = new ServiceCollection();
        services.AddHealthCheckService(configuration);

        using var provider = services.BuildServiceProvider();
        var registrations = provider
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>()
            .Value.Registrations;

        Assert.Equal(2, registrations.Count);
        Assert.All(registrations, registration => Assert.Contains("ready", registration.Tags));
        Assert.DoesNotContain(registrations, registration => registration.Name == "external api");
    }

    private static IConfiguration BuildConfiguration(Dictionary<string, string?> values) =>
        new ConfigurationBuilder().AddInMemoryCollection(values).Build();
}
