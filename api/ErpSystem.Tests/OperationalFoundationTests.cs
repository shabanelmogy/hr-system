using System.ComponentModel.DataAnnotations;
using ErpSystem.Api.Hosting;
using ErpSystem.Api.Modules;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.HR.Infrastructure.Common.Settings;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Cors.Infrastructure;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

namespace ErpSystem.Tests;

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
            new ServiceCollection().AddHostCors(configuration));
    }

    [Fact]
    public void CorsService_ExposesCorrelationHeaderToBrowserClients()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["CorsSettings:AllowedOrigins:0"] = "https://localhost:3000"
        });
        var services = new ServiceCollection();
        services.AddHostCors(configuration);

        using var provider = services.BuildServiceProvider();
        var policy = provider.GetRequiredService<IOptions<CorsOptions>>()
            .Value.GetPolicy(HostInfrastructureServiceCollectionExtensions.BrowserCorsPolicy);

        Assert.NotNull(policy);
        Assert.Contains(HostCorrelationContext.HeaderName, policy!.ExposedHeaders);
    }

    [Fact]
    public void HostDeploymentConfiguration_RejectsUnsafeProductionValuesWithoutEchoingSecrets()
    {
        const string signingSecret = "signing-secret-must-not-appear";
        const string mailSecret = "mail-secret-must-not-appear";
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=db;Database=erp;User Id=app;Password=db-secret;Encrypt=False;TrustServerCertificate=True;",
            ["ConnectionStrings:HangfireConnection"] =
                "Server=db;Database=jobs;User Id=app;Password=job-secret;Encrypt=True;TrustServerCertificate=False;",
            ["AllowedHosts"] = "*",
            ["CorsSettings:AllowedOrigins:0"] = "http://localhost:3000",
            ["AppSettings:FrontendUrl"] = "http://localhost:3000",
            ["JwtOptions:Key"] = signingSecret,
            ["MailSettings:Password"] = mailSecret,
            ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true",
            ["DatabaseSettings:SeedOnStartup"] = "true",
            ["Modules:HR:Database:ApplyMigrationsOnStartup"] = "true",
            ["ExternalLogin:Google:ClientId"] = "configured-client"
        });

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(
                configuration,
                "Production",
                ["HR", "Accounting"]));

        Assert.Contains("AllowedHosts", exception.Message, StringComparison.Ordinal);
        Assert.True(exception.Message.Contains("TrustServerCertificate", StringComparison.Ordinal), exception.Message);
        Assert.Contains("Encrypt", exception.Message, StringComparison.Ordinal);
        Assert.Contains("DatabaseSettings:SeedOnStartup", exception.Message, StringComparison.Ordinal);
        Assert.Contains("ExternalLogin:Google", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain(signingSecret, exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain(mailSecret, exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("Password=db-secret", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void HostDeploymentConfiguration_RejectsMissingOrPlaceholderConnectionsForEveryModule()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] = "<set-via-environment-or-local-config>",
            ["ConnectionStrings:HangfireConnection"] = "<set-via-environment-or-local-config>"
        });

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(configuration, "Development", ["HR", "Accounting"]));

        Assert.Contains("ConnectionStrings:DefaultConnection", exception.Message, StringComparison.Ordinal);
        Assert.Contains("ConnectionStrings:HangfireConnection", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("set-via-environment", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void HostDeploymentConfiguration_AcceptsSecureProductionConfiguration()
    {
        var configuration = BuildSecureProductionConfiguration();

        HostDeploymentConfigurationValidator.Validate(configuration, "Production", ["HR", "Accounting"]);
    }

    [Fact]
    public void HostDeploymentConfiguration_AllowsLocalSqlTransportSettingsOutsideProduction()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\MSSQLLocalDB;Database=erp;Integrated Security=True;Encrypt=False;TrustServerCertificate=True;",
            ["ConnectionStrings:HangfireConnection"] =
                "Server=(localdb)\\MSSQLLocalDB;Database=jobs;Integrated Security=True;Encrypt=False;TrustServerCertificate=True;"
        });

        HostDeploymentConfigurationValidator.Validate(configuration, "Development", ["HR", "Accounting"]);
    }

    [Fact]
    public void HostDeploymentConfiguration_RejectsPlaceholderGoogleCredentialsInProduction()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["ExternalLogin:Google:ClientId"] = "<configure-client-id>";
        configuration["ExternalLogin:Google:ClientSecret"] = "<configure-client-secret>";

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(configuration, "Production", ["HR"]));

        Assert.Contains("ExternalLogin:Google", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("configure-client", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void HostDeploymentConfiguration_RunsBeforeServiceRegistration()
    {
        var source = File.ReadAllText(Path.Combine(FindApiRoot(), "ErpSystem.Api", "Program.cs"));
        var validation = source.IndexOf("HostDeploymentConfigurationValidator.Validate(", StringComparison.Ordinal);
        var registration = source.IndexOf("builder.Services.AddErpHostInfrastructure(", StringComparison.Ordinal);

        Assert.True(validation >= 0);
        Assert.True(registration > validation);
    }

    [Fact]
    public void OpenTelemetry_RejectsInvalidEnabledExporterConfiguration()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["OpenTelemetry:Enabled"] = "true",
            ["OpenTelemetry:TraceSamplingRatio"] = "1.1",
            ["OpenTelemetry:OtlpEndpoint"] = "not-a-uri",
            ["OpenTelemetry:OtlpProtocol"] = "unsupported"
        });

        Assert.Throws<InvalidOperationException>(() =>
            new ServiceCollection().AddHostOpenTelemetry(configuration));
    }

    [Fact]
    public void OpenTelemetry_DisabledModeDoesNotRequireExporterOrRegisterProviders()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["OpenTelemetry:Enabled"] = "false",
            ["OpenTelemetry:OtlpEndpoint"] = "",
            ["OpenTelemetry:OtlpProtocol"] = ""
        });
        var services = new ServiceCollection();

        services.AddHostOpenTelemetry(configuration);

        Assert.DoesNotContain(services, descriptor => descriptor.ServiceType == typeof(TracerProvider));
        Assert.DoesNotContain(services, descriptor => descriptor.ServiceType == typeof(MeterProvider));
    }

    [Fact]
    public void OpenTelemetry_RegistersTraceAndMetricProvidersWhenEnabled()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["OpenTelemetry:Enabled"] = "true",
            ["OpenTelemetry:ServiceName"] = "ErpSystem.Api.Tests",
            ["OpenTelemetry:ServiceNamespace"] = "ErpSystem.Tests",
            ["OpenTelemetry:TraceSamplingRatio"] = "1",
            ["OpenTelemetry:OtlpEndpoint"] = "http://localhost:4317",
            ["OpenTelemetry:OtlpProtocol"] = "grpc"
        });
        var services = new ServiceCollection();

        services.AddHostOpenTelemetry(configuration);

        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(TracerProvider));
        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(MeterProvider));
    }

    [Fact]
    public void HostPipeline_AuthenticatesBeforeRateLimitingAndAuthorization()
    {
        var source = File.ReadAllText(Path.Combine(FindApiRoot(), "ErpSystem.Api", "Program.cs"));
        var authentication = source.IndexOf("app.UseAuthentication();", StringComparison.Ordinal);
        var rateLimiter = source.IndexOf("app.UseRateLimiter();", StringComparison.Ordinal);
        var authorization = source.IndexOf("app.UseAuthorization();", StringComparison.Ordinal);

        Assert.True(authentication >= 0);
        Assert.True(rateLimiter > authentication);
        Assert.True(authorization > rateLimiter);
    }

    [Fact]
    public void HealthChecks_RegisterOneDatabaseReadinessDependencyPerInstalledModule()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\mssqllocaldb;Database=HealthChecks;Trusted_Connection=True;"
        });
        var modules = ErpModuleRegistry.Create();
        var services = new ServiceCollection();
        services.AddHostHealthChecks(configuration, modules.Select(module => module.Name));

        using var provider = services.BuildServiceProvider();
        var registrations = provider
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>()
            .Value.Registrations;

        Assert.Equal(modules.Length + 2, registrations.Count);
        Assert.All(registrations, registration => Assert.Contains("ready", registration.Tags));
        Assert.Equal(
            modules.Select(module => $"database:{module.Name}").OrderBy(name => name),
            registrations
                .Where(registration => registration.Name.StartsWith("database:", StringComparison.Ordinal))
                .Select(registration => registration.Name)
                .OrderBy(name => name));
        Assert.Single(registrations, registration => registration.Name == "hangfire");
        Assert.Single(registrations, registration => registration.Name == "module-schema");
        Assert.DoesNotContain(registrations, registration => registration.Name == "external api");
    }

    [Fact]
    public void HealthChecks_UseModuleSpecificConnectionWithoutRequiringDefaultConnection()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:HR"] = "Server=hr-db;Database=Hr;User Id=test;Password=test;TrustServerCertificate=True;",
            ["ConnectionStrings:Accounting"] = "Server=accounting-db;Database=Accounting;User Id=test;Password=test;TrustServerCertificate=True;"
        });
        var services = new ServiceCollection();

        services.AddHostHealthChecks(configuration, ["HR", "Accounting"]);

        using var provider = services.BuildServiceProvider();
        var names = provider
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>()
            .Value.Registrations
            .Select(registration => registration.Name)
            .ToArray();

        Assert.Contains("database:HR", names);
        Assert.Contains("database:Accounting", names);
        Assert.Contains("hangfire", names);
        Assert.Contains("module-schema", names);
    }

    [Fact]
    public void HealthChecks_RequireEffectiveConnectionForEveryInstalledModule()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:HR"] = "Server=hr-db;Database=Hr;User Id=test;Password=test;TrustServerCertificate=True;"
        });

        var exception = Assert.Throws<InvalidOperationException>(() =>
            new ServiceCollection().AddHostHealthChecks(configuration, ["HR", "Accounting"]));

        Assert.Contains("Accounting", exception.Message);
        Assert.DoesNotContain("Server=", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void HealthChecks_CanRegisterSharedDefaultConnectionForMultipleModulesIndependently()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\mssqllocaldb;Database=SharedModules;Trusted_Connection=True;"
        });
        var services = new ServiceCollection();

        services.AddHostHealthChecks(configuration, ["HR", "Accounting", "Contacts"]);

        using var provider = services.BuildServiceProvider();
        var registrations = provider
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>()
            .Value.Registrations;

        Assert.Equal(5, registrations.Count);
        Assert.Contains(registrations, registration => registration.Name == "database:HR");
        Assert.Contains(registrations, registration => registration.Name == "database:Accounting");
        Assert.Contains(registrations, registration => registration.Name == "database:Contacts");
        Assert.Contains(registrations, registration => registration.Name == "hangfire");
        Assert.Contains(registrations, registration => registration.Name == "module-schema");
    }

    [Fact]
    public void Liveness_RemainsDependencyFreeWhileReadinessIncludesRegisteredDependencies()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\mssqllocaldb;Database=HealthChecks;Trusted_Connection=True;"
        });
        var services = new ServiceCollection();
        services.AddHostHealthChecks(configuration, ["HR", "Accounting"]);

        using var provider = services.BuildServiceProvider();
        var registrations = provider
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>()
            .Value.Registrations;

        Assert.NotEmpty(registrations);
        Assert.All(registrations, registration =>
        {
            Assert.True(HostHealthCheckPredicates.IsReadiness(registration));
            Assert.False(HostHealthCheckPredicates.IsLiveness(registration));
        });
    }

    [Fact]
    public async Task ModuleSchemaReadiness_IsUnhealthyWhenInstalledModuleHasPendingMigration()
    {
        var catalog = new ModuleCatalog([
            new SchemaStatusModule("Ready", []),
            new SchemaStatusModule("Stale", ["202609110101_AddRequiredColumn"])
        ]);
        var services = new ServiceCollection();
        using var provider = services.BuildServiceProvider();
        var check = new ModuleSchemaCompatibilityHealthCheck(catalog, provider);

        var result = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Unhealthy, result.Status);
        Assert.Contains("pending database migrations", result.Description, StringComparison.OrdinalIgnoreCase);
        Assert.True(result.Data.TryGetValue("Stale", out var pending));
        Assert.Equal(["202609110101_AddRequiredColumn"], Assert.IsType<string[]>(pending));
        Assert.DoesNotContain("Ready", result.Data.Keys);
    }

    [Fact]
    public void HealthCheckRegistration_DependsOnlyOnNeutralModuleNames()
    {
        var method = typeof(HostInfrastructureServiceCollectionExtensions)
            .GetMethod(nameof(HostInfrastructureServiceCollectionExtensions.AddHostHealthChecks));

        Assert.NotNull(method);
        Assert.Equal(typeof(IServiceCollection), method!.GetParameters()[0].ParameterType);
        Assert.Equal(typeof(IConfiguration), method.GetParameters()[1].ParameterType);
        Assert.Equal(typeof(IEnumerable<string>), method.GetParameters()[2].ParameterType);
        Assert.DoesNotContain(
            method.GetParameters(),
            parameter => parameter.ParameterType.Namespace?.StartsWith("ErpSystem.Modules.", StringComparison.Ordinal) == true);
    }

    private static IConfiguration BuildConfiguration(Dictionary<string, string?> values) =>
        new ConfigurationBuilder().AddInMemoryCollection(values).Build();

    private static IConfiguration BuildSecureProductionConfiguration() =>
        BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=db;Database=erp;User Id=app;Password=db-secret;Encrypt=True;TrustServerCertificate=False;",
            ["ConnectionStrings:HangfireConnection"] =
                "Server=db;Database=jobs;User Id=app;Password=job-secret;Encrypt=True;TrustServerCertificate=False;",
            ["AllowedHosts"] = "api.example.com",
            ["CorsSettings:AllowedOrigins:0"] = "https://app.example.com",
            ["AppSettings:FrontendUrl"] = "https://app.example.com",
            ["JwtOptions:Key"] = "production-signing-key-with-more-than-thirty-two-characters",
            ["MailSettings:Password"] = "production-mail-password",
            ["DatabaseSettings:ApplyMigrationsOnStartup"] = "false",
            ["DatabaseSettings:SeedOnStartup"] = "false",
            ["ExternalLogin:Google:ClientId"] = "",
            ["ExternalLogin:Google:ClientSecret"] = ""
        });

    private static string FindApiRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "ErpSystem.sln")))
            directory = directory.Parent;

        return directory?.FullName
            ?? throw new InvalidOperationException("Could not locate the API solution root.");
    }

    private sealed class SchemaStatusModule(string name, IReadOnlyList<string> pendingMigrations) : IModule
    {
        public string Name { get; } = name;
        public ModuleDefinition Definition => new(Name.ToLowerInvariant(), Name, []);

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
        }

        public Task MigrateAsync(
            IServiceProvider services,
            CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
            IServiceProvider services,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(pendingMigrations);
    }
}
