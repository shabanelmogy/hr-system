using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Net;
using ErpSystem.Api.Hosting;
using ErpSystem.Api.Modules;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging.Abstractions;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using BclIPNetwork = System.Net.IPNetwork;
using Microsoft.AspNetCore.DataProtection;
using System.Reflection;
using Microsoft.AspNetCore.WebUtilities;

namespace ErpSystem.IntegrationTests;

public sealed class OperationalFoundationTests
{
    [Fact]
    public void ExampleConfiguration_LoadsWithoutDuplicateKeys()
    {
        var path = Path.Combine(FindApiRoot(), "ErpSystem.Api", "appsettings.example.json");
        var configuration = new ConfigurationBuilder()
            .AddJsonFile(path, optional: false, reloadOnChange: false)
            .Build();

        Assert.Equal("ErpSystem", configuration["DataProtection:ApplicationName"]);
    }

    [Fact]
    public void MailSettings_DisabledWithBlankConfigurationIsValid()
    {
        var settings = new PlatformMailSettings();

        Assert.True(Validator.TryValidateObject(
            settings,
            new ValidationContext(settings),
            [],
            validateAllProperties: true));
    }

    [Fact]
    public void MailSettings_EnabledWithInvalidConfigurationIsRejectedByMember()
    {
        var settings = new PlatformMailSettings
        {
            Enabled = true,
            Mail = "not-an-email",
            DisplayName = "HR",
            Password = "",
            Host = "smtp example",
            Port = 0
        };

        var validationResults = new List<ValidationResult>();
        Assert.False(Validator.TryValidateObject(
            settings,
            new ValidationContext(settings),
            validationResults,
            validateAllProperties: true));
        Assert.Contains(validationResults, result => result.MemberNames.SequenceEqual([nameof(PlatformMailSettings.Mail)]));
        Assert.Contains(validationResults, result => result.MemberNames.SequenceEqual([nameof(PlatformMailSettings.Password)]));
        Assert.Contains(validationResults, result => result.MemberNames.SequenceEqual([nameof(PlatformMailSettings.Host)]));
        Assert.Contains(validationResults, result => result.MemberNames.SequenceEqual([nameof(PlatformMailSettings.Port)]));
    }

    [Fact]
    public void MailSettings_EnabledWithValidConfigurationIsAccepted()
    {
        var settings = new PlatformMailSettings
        {
            Enabled = true,
            Mail = "noreply@example.com",
            DisplayName = "ERP System",
            Password = "smtp-secret",
            Host = "smtp.example.com",
            Port = 465
        };

        Assert.True(Validator.TryValidateObject(
            settings,
            new ValidationContext(settings),
            [],
            validateAllProperties: true));
    }

    [Fact]
    public async Task MailSender_DisabledConfigurationFailsBeforeNetworkWork()
    {
        var sender = new PlatformIdentityEmailSender(
            Options.Create(new PlatformMailSettings
            {
                Enabled = false,
                Host = "127.0.0.1",
                Port = 1
            }),
            Options.Create(new PlatformPublicApplicationSettings
            {
                FrontendUrl = string.Empty
            }));

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            sender.SendInvitationAsync(
                "recipient@example.com",
                "Recipient",
                Guid.NewGuid(),
                "token",
                CancellationToken.None));

        Assert.Contains("MailSettings:Enabled", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void MailSender_InvitationLinkIncludesRouteAndQueryBeforeSmtpWork()
    {
        var sender = new PlatformIdentityEmailSender(
            Options.Create(new PlatformMailSettings
            {
                Enabled = true,
                Mail = "noreply@example.com",
                DisplayName = "ERP System",
                Password = "smtp-secret",
                Host = "smtp.example.com",
                Port = 465
            }),
            Options.Create(new PlatformPublicApplicationSettings
            {
                FrontendUrl = "https://app.example.com"
            }));
        var buildLink = typeof(PlatformIdentityEmailSender).GetMethod(
            "BuildLinkCore",
            BindingFlags.Instance | BindingFlags.NonPublic);

        var invitationId = Guid.NewGuid();
        var result = buildLink?.Invoke(
            sender,
            [
                "accept-invitation",
                new Dictionary<string, string?>
                {
                    ["invitationId"] = invitationId.ToString(),
                    ["token"] = "invite-token"
                }
            ]) as string;

        Assert.NotNull(result);
        var uri = new Uri(result!, UriKind.Absolute);
        Assert.Equal("/accept-invitation", uri.AbsolutePath);
        var query = QueryHelpers.ParseQuery(uri.Query);
        Assert.Equal(invitationId.ToString(), query["invitationId"].ToString());
        Assert.Equal("invite-token", query["token"].ToString());
    }

    [Fact]
    public void PlatformPublicApplicationSettings_MailDisabledAllowsBlankFrontendUrl()
    {
        var options = ResolvePlatformPublicApplicationSettings(mailEnabled: false, frontendUrl: null);

        Assert.Equal(string.Empty, options.FrontendUrl);
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-a-url")]
    public void PlatformPublicApplicationSettings_MailEnabledRejectsBlankOrInvalidFrontendUrl(string frontendUrl)
    {
        var exception = Assert.Throws<OptionsValidationException>(() =>
            ResolvePlatformPublicApplicationSettings(mailEnabled: true, frontendUrl));

        Assert.Contains(exception.Failures, failure =>
            failure.Contains("AppSettings:FrontendUrl", StringComparison.Ordinal));
    }

    [Fact]
    public void PlatformPublicApplicationSettings_MailEnabledAcceptsAbsoluteHttpFrontendUrl()
    {
        var options = ResolvePlatformPublicApplicationSettings(
            mailEnabled: true,
            frontendUrl: "https://app.example.com");

        Assert.Equal("https://app.example.com", options.FrontendUrl);
    }

    [Fact]
    public void AppSettings_RequireAbsoluteFrontendUrl()
    {
        var settings = new PlatformPublicApplicationSettings { FrontendUrl = "localhost" };

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
    public void CorsService_RegistersEmptyPolicyThatDeniesCrossOriginRequests()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddHostCors(BuildConfiguration([]));

        using var provider = services.BuildServiceProvider();
        var policy = provider.GetRequiredService<IOptions<CorsOptions>>()
            .Value.GetPolicy(HostInfrastructureServiceCollectionExtensions.BrowserCorsPolicy);

        Assert.NotNull(policy);
        Assert.Empty(policy!.Origins);
        Assert.False(policy.AllowAnyOrigin);

        var context = new DefaultHttpContext();
        context.Request.Headers.Origin = "https://client.example.com";
        var result = provider.GetRequiredService<ICorsService>().EvaluatePolicy(context, policy);

        Assert.False(result.IsOriginAllowed);
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
            ["MailSettings:Enabled"] = "false",
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
        Assert.Equal(
            1,
            exception.Message.Split("TrustServerCertificate", StringSplitOptions.None).Length - 1);
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
    public void HostDeploymentConfiguration_DefersStrictProductionReadinessWhenExplicitlyDisabled()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["DeploymentValidation:EnforceProductionReadiness"] = "false";
        configuration["ConnectionStrings:DefaultConnection"] =
            "Server=db;Database=erp;User Id=app;Password=db-secret;Encrypt=False;TrustServerCertificate=True;";
        configuration["ConnectionStrings:HangfireConnection"] =
            "Server=db;Database=jobs;User Id=app;Password=job-secret;Encrypt=False;TrustServerCertificate=True;";
        configuration["AllowedHosts"] = "*";
        configuration["CorsSettings:AllowedOrigins:0"] = "http://localhost:3000";
        configuration["AppSettings:FrontendUrl"] = "http://localhost:3000";
        configuration["JwtOptions:Key"] = "<set-via-environment-or-secret-manager>";
        configuration["MailSettings:Enabled"] = "false";
        configuration["FileSecurity:MalwareScanningEnabled"] = "false";
        configuration["FileSecurity:ScannerHost"] = "localhost";
        configuration["FileSecurity:ScannerPort"] = "0";
        configuration["DatabaseSettings:ApplyMigrationsOnStartup"] = "true";
        configuration["DatabaseSettings:SeedOnStartup"] = "true";

        HostDeploymentConfigurationValidator.Validate(configuration, "Production", ["HR", "Accounting"]);
    }

    [Fact]
    public void HostDeploymentConfiguration_RejectsLocalDbOutsideDevelopmentEvenWhenReadinessIsDeferred()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["DeploymentValidation:EnforceProductionReadiness"] = "false";
        configuration["ConnectionStrings:DefaultConnection"] =
            "Server=(LOCALDB)\\MSSQLLocalDB;Database=private-database;User Id=private-user;Password=private-password;Encrypt=True;TrustServerCertificate=False;";
        configuration["ConnectionStrings:HangfireConnection"] = null;

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(
                configuration,
                "Production",
                ["HR", "Accounting"]));

        const string diagnostic =
            "ConnectionStrings:DefaultConnection must not use SQL Server LocalDB outside Development.";
        Assert.Contains(diagnostic, exception.Message, StringComparison.Ordinal);
        Assert.Equal(1, exception.Message.Split(diagnostic, StringSplitOptions.None).Length - 1);
        Assert.DoesNotContain("private-database", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private-user", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private-password", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void HostDeploymentConfiguration_AcceptsLocalDbConnectionsInDevelopment()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\MSSQLLocalDB;Database=Development;Trusted_Connection=True;",
        });

        HostDeploymentConfigurationValidator.Validate(
            configuration,
            "Development",
            ["HR", "Accounting"]);
    }

    [Fact]
    public void HostDeploymentConfiguration_StillRejectsPlaceholderConnectionWhenReadinessIsDeferred()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["DeploymentValidation:EnforceProductionReadiness"] = "false";
        configuration["ConnectionStrings:DefaultConnection"] =
            "<set-via-environment-or-secret-manager>";

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(configuration, "Production", ["HR"]));

        Assert.Contains("ConnectionStrings:DefaultConnection must not be a placeholder.", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void HostDeploymentConfiguration_StillRejectsMalformedConnectionWhenReadinessIsDeferred()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["DeploymentValidation:EnforceProductionReadiness"] = "false";
        configuration["ConnectionStrings:DefaultConnection"] = "Server=\"unterminated";

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(configuration, "Production", ["HR"]));

        Assert.Contains("ConnectionStrings:DefaultConnection must be a valid SQL connection string.", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void HostDeploymentConfiguration_EnforcesProductionReadinessWhenSwitchIsOmitted()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["AllowedHosts"] = "*";

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(configuration, "Production", ["HR"]));

        Assert.Contains("AllowedHosts", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void HostDeploymentConfiguration_RejectsDisabledMailInProduction()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["MailSettings:Enabled"] = "false";

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(configuration, "Production", ["HR"]));

        Assert.Contains("MailSettings:Enabled", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ReportingProduction_RequiresHttpsCrystalRuntime()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["CrystalReports:RuntimeEnabled"] = "true";
        configuration["CrystalReports:RuntimeBaseUrl"] = "http://crystal.example.com/";
        configuration["CrystalReports:RuntimeApiKey"] = "production-crystal-internal-key";

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(
                configuration,
                "Production",
                ["Reporting"]));

        Assert.Contains("CrystalReports:RuntimeBaseUrl", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ReportingProduction_AcceptsSecureCrystalRuntimeBoundary()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["CrystalReports:RuntimeEnabled"] = "true";
        configuration["CrystalReports:RuntimeBaseUrl"] = "https://crystal.example.com/";
        configuration["CrystalReports:RuntimeApiKey"] = "production-crystal-internal-key";

        HostDeploymentConfigurationValidator.Validate(
            configuration,
            "Production",
            ["Reporting"]);
    }

    [Fact]
    public void ReportingProduction_AllowsCrystalRuntimeToRemainDisabled()
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration["CrystalReports:RuntimeEnabled"] = "false";
        configuration["CrystalReports:RuntimeBaseUrl"] = "";
        configuration["CrystalReports:RuntimeApiKey"] = "";

        HostDeploymentConfigurationValidator.Validate(
            configuration,
            "Production",
            ["Reporting"]);
    }

    [Fact]
    public void DataProtection_PersistsKeysAcrossFreshProvidersAndRejectsDifferentRing()
    {
        var directory = Path.Combine(Path.GetTempPath(), $"erp-dp-{Guid.NewGuid():N}");
        Directory.CreateDirectory(directory);
        try
        {
            var values = new Dictionary<string, string?>
            {
                ["DataProtection:ApplicationName"] = "ErpSystem.Tests.Shared",
                ["DataProtection:KeyRingDirectory"] = directory
            };
            var first = new ServiceCollection();
            first.AddHostDataProtection(BuildConfiguration(values));
            using var firstProvider = first.BuildServiceProvider();
            var protector = firstProvider
                .GetRequiredService<IDataProtectionProvider>()
                .CreateProtector("cross-provider");
            var protectedValue = protector.Protect("stable-payload");

            var second = new ServiceCollection();
            second.AddHostDataProtection(BuildConfiguration(values));
            using var secondProvider = second.BuildServiceProvider();
            var unprotected = secondProvider
                .GetRequiredService<IDataProtectionProvider>()
                .CreateProtector("cross-provider")
                .Unprotect(protectedValue);
            Assert.Equal("stable-payload", unprotected);

            var differentRing = new ServiceCollection();
            differentRing.AddHostDataProtection(BuildConfiguration(new Dictionary<string, string?>
            {
                ["DataProtection:ApplicationName"] = "ErpSystem.Tests.Other",
                ["DataProtection:KeyRingDirectory"] = Path.Combine(directory, "other")
            }));
            using var differentProvider = differentRing.BuildServiceProvider();
            Assert.ThrowsAny<CryptographicException>(() =>
                differentProvider
                    .GetRequiredService<IDataProtectionProvider>()
                    .CreateProtector("cross-provider")
                    .Unprotect(protectedValue));
        }
        finally
        {
            Directory.Delete(directory, recursive: true);
        }
    }

    [Fact]
    public void DataProtection_EncryptsSharedRingWithConfiguredCertificateAcrossProviders()
    {
        using var oldRsa = RSA.Create(2048);
        using var newRsa = RSA.Create(2048);
        using var oldCertificate = CreateDataProtectionCertificate(oldRsa);
        using var newCertificate = CreateDataProtectionCertificate(newRsa);

        var root = Path.Combine(Path.GetTempPath(), $"erp-dp-cert-{Guid.NewGuid():N}");
        var keyRing = Path.Combine(root, "keys");
        var oldCertificatePath = Path.Combine(root, "protection-old.pfx");
        var newCertificatePath = Path.Combine(root, "protection-new.pfx");
        Directory.CreateDirectory(root);
        File.WriteAllBytes(oldCertificatePath, oldCertificate.Export(X509ContentType.Pfx, "old-password"));
        File.WriteAllBytes(newCertificatePath, newCertificate.Export(X509ContentType.Pfx, "new-password"));
        try
        {
            var firstValues = new Dictionary<string, string?>
            {
                ["DataProtection:ApplicationName"] = "ErpSystem.Tests.Certificate",
                ["DataProtection:KeyRingDirectory"] = keyRing,
                ["DataProtection:ProtectionCertificatePath"] = oldCertificatePath,
                ["DataProtection:ProtectionCertificatePassword"] = "old-password",
                ["DataProtection:SharedKeyRing"] = "true"
            };

            var first = new ServiceCollection();
            first.AddHostDataProtection(BuildConfiguration(firstValues));
            using var firstProvider = first.BuildServiceProvider();
            var protectedValue = firstProvider
                .GetRequiredService<IDataProtectionProvider>()
                .CreateProtector("certificate-ring")
                .Protect("encrypted-payload");

            var keyFile = Assert.Single(Directory.EnumerateFiles(keyRing, "key-*.xml"));
            var keyXml = System.Xml.Linq.XDocument.Load(keyFile);
            Assert.Contains(keyXml.Descendants(), element => element.Name.LocalName == "encryptedSecret");
            Assert.DoesNotContain(keyXml.Descendants(), element => element.Name.LocalName == "masterKey");
            firstProvider.Dispose();

            // A different certificate alone must not read the old persisted ring.
            var wrongCertificateValues = new Dictionary<string, string?>(firstValues)
            {
                ["DataProtection:ProtectionCertificatePath"] = newCertificatePath,
                ["DataProtection:ProtectionCertificatePassword"] = "new-password"
            };
            var wrongCertificateServices = new ServiceCollection();
            wrongCertificateServices.AddHostDataProtection(BuildConfiguration(wrongCertificateValues));
            using var wrongCertificateProvider = wrongCertificateServices.BuildServiceProvider();
            Assert.ThrowsAny<CryptographicException>(() => wrongCertificateProvider
                .GetRequiredService<IDataProtectionProvider>()
                .CreateProtector("certificate-ring")
                .Unprotect(protectedValue));

            var secondValues = new Dictionary<string, string?>(firstValues)
            {
                ["DataProtection:ProtectionCertificatePath"] = newCertificatePath,
                ["DataProtection:ProtectionCertificatePassword"] = "new-password",
                ["DataProtection:PreviousProtectionCertificates:0:Path"] = oldCertificatePath,
                ["DataProtection:PreviousProtectionCertificates:0:Password"] = "old-password"
            };
            var second = new ServiceCollection();
            second.AddHostDataProtection(BuildConfiguration(secondValues));
            using var secondProvider = second.BuildServiceProvider();
            var unprotected = secondProvider
                .GetRequiredService<IDataProtectionProvider>()
                .CreateProtector("certificate-ring")
                .Unprotect(protectedValue);

            Assert.Equal("encrypted-payload", unprotected);
            Assert.NotEmpty(Directory.EnumerateFiles(keyRing, "*.xml"));
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    private static X509Certificate2 CreateDataProtectionCertificate(RSA rsa)
    {
        var request = new CertificateRequest(
            "CN=ErpSystem.Tests.DataProtection",
            rsa,
            HashAlgorithmName.SHA256,
            RSASignaturePadding.Pkcs1);
        return request.CreateSelfSigned(
            DateTimeOffset.UtcNow.AddMinutes(-5),
            DateTimeOffset.UtcNow.AddHours(1));
    }

    [Fact]
    public void DataProtectionSettings_RequireAbsolutePathsAndPairedCertificateCredentials()
    {
        var relative = new HostDataProtectionSettings { KeyRingDirectory = "keys" };
        Assert.False(relative.IsValid(out var relativeError));
        Assert.Contains("absolute", relativeError, StringComparison.OrdinalIgnoreCase);

        var unpaired = new HostDataProtectionSettings { ProtectionCertificatePath = Path.GetFullPath("protection.pfx") };
        Assert.False(unpaired.IsValid(out var unpairedError));
        Assert.Contains("together", unpairedError, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData("DataProtection:KeyRingDirectory")]
    [InlineData("DataProtection:ProtectionCertificatePath")]
    [InlineData("DataProtection:ProtectionCertificatePassword")]
    public void Production_RequiresPersistentEncryptedDataProtectionEvenForOneReplica(string setting)
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration[setting] = null;
        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(configuration, "Production", ["HR"]));
        Assert.Contains(setting, exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void DataProtection_InvalidCertificateDoesNotExposePassword()
    {
        const string password = "secret-must-not-be-in-diagnostics";
        var values = new Dictionary<string, string?>
        {
            ["DataProtection:ProtectionCertificatePath"] = Path.Combine(Path.GetTempPath(), $"missing-{Guid.NewGuid():N}.pfx"),
            ["DataProtection:ProtectionCertificatePassword"] = password
        };
        var exception = Assert.Throws<InvalidOperationException>(() =>
            new ServiceCollection().AddHostDataProtection(BuildConfiguration(values)));
        Assert.DoesNotContain(password, exception.ToString(), StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("FileSecurity:MalwareScanningEnabled", "false")]
    [InlineData("FileSecurity:ScannerHost", "")]
    [InlineData("FileSecurity:ScannerPort", "0")]
    public void HostDeploymentConfiguration_RejectsIncompleteProductionFileSecurity(
        string setting,
        string value)
    {
        var configuration = BuildSecureProductionConfiguration();
        configuration[setting] = value;

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDeploymentConfigurationValidator.Validate(configuration, "Production", ["HR"]));

        Assert.Contains(setting, exception.Message, StringComparison.Ordinal);
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
    public void HostPipeline_ServesSwaggerBeforeAuthenticationAndAuthorization()
    {
        var source = File.ReadAllText(Path.Combine(FindApiRoot(), "ErpSystem.Api", "Program.cs"));
        var swagger = source.IndexOf("app.UseSwagger();", StringComparison.Ordinal);
        var swaggerUi = source.IndexOf("app.UseSwaggerUI", StringComparison.Ordinal);
        var authentication = source.IndexOf("app.UseAuthentication();", StringComparison.Ordinal);
        var authorization = source.IndexOf("app.UseAuthorization();", StringComparison.Ordinal);

        Assert.True(swagger >= 0);
        Assert.True(swaggerUi > swagger);
        Assert.True(authentication > swaggerUi);
        Assert.True(authorization > swaggerUi);
    }

    [Fact]
    public void ForwardedHeaders_RejectEnabledConfigurationWithoutTrustedSources()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ForwardedHeaders:Enabled"] = "true",
            ["ForwardedHeaders:ForwardLimit"] = "1"
        });

        Assert.Throws<InvalidOperationException>(() =>
            new ServiceCollection().AddHostForwardedHeaders(configuration));
    }

    [Fact]
    public void ForwardedHeaders_RejectUnsafeGlobalTrustShortcut()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ASPNETCORE_FORWARDEDHEADERS_ENABLED"] = "true"
        });

        var exception = Assert.Throws<InvalidOperationException>(() =>
            new ServiceCollection().AddHostForwardedHeaders(configuration));

        Assert.Contains("ASPNETCORE_FORWARDEDHEADERS_ENABLED", exception.Message);
    }

    [Theory]
    [InlineData("not-an-ip", null)]
    [InlineData(null, "not-a-network")]
    [InlineData(null, "0.0.0.0/0")]
    [InlineData(null, "::/0")]
    public void ForwardedHeaders_RejectInvalidOrUniversalTrustedSources(
        string? proxy,
        string? network)
    {
        var values = new Dictionary<string, string?>
        {
            ["ForwardedHeaders:Enabled"] = "true",
            ["ForwardedHeaders:ForwardLimit"] = "1"
        };
        if (proxy is not null)
            values["ForwardedHeaders:KnownProxies:0"] = proxy;
        if (network is not null)
            values["ForwardedHeaders:KnownNetworks:0"] = network;

        Assert.Throws<InvalidOperationException>(() =>
            new ServiceCollection().AddHostForwardedHeaders(BuildConfiguration(values)));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public void ForwardedHeaders_RejectUnsafeForwardLimits(int forwardLimit)
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ForwardedHeaders:Enabled"] = "true",
            ["ForwardedHeaders:ForwardLimit"] = forwardLimit.ToString(),
            ["ForwardedHeaders:KnownProxies:0"] = "10.0.0.10"
        });

        Assert.Throws<InvalidOperationException>(() =>
            new ServiceCollection().AddHostForwardedHeaders(configuration));
    }

    [Fact]
    public async Task ForwardedHeaders_AcceptConfiguredProxyAndIgnoreSpoofedSource()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["ForwardedHeaders:Enabled"] = "true",
            ["ForwardedHeaders:ForwardLimit"] = "1",
            ["ForwardedHeaders:RequireHeaderSymmetry"] = "true",
            ["ForwardedHeaders:KnownProxies:0"] = "10.0.0.10",
            ["ForwardedHeaders:KnownNetworks:0"] = "10.20.0.0/16"
        });
        var services = new ServiceCollection();
        services.AddHostForwardedHeaders(configuration);
        using var provider = services.BuildServiceProvider();
        var options = provider.GetRequiredService<IOptions<ForwardedHeadersOptions>>();

        var trusted = await InvokeForwardedHeadersAsync(
            options,
            "10.0.0.10",
            "203.0.113.7",
            "https");
        var untrusted = await InvokeForwardedHeadersAsync(
            options,
            "192.0.2.10",
            "203.0.113.8",
            "https");
        var trustedNetwork = await InvokeForwardedHeadersAsync(
            options,
            "10.20.5.25",
            "203.0.113.9",
            "https");

        Assert.Equal("203.0.113.7", trusted.RemoteIpAddress);
        Assert.Equal("https", trusted.Scheme);
        Assert.Equal("192.0.2.10", untrusted.RemoteIpAddress);
        Assert.Equal("http", untrusted.Scheme);
        Assert.Equal("203.0.113.9", trustedNetwork.RemoteIpAddress);
        Assert.Equal("https", trustedNetwork.Scheme);
        Assert.Equal(
            ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
            options.Value.ForwardedHeaders);
        Assert.False(options.Value.ForwardedHeaders.HasFlag(ForwardedHeaders.XForwardedHost));
        Assert.Equal(1, options.Value.ForwardLimit);
        Assert.True(options.Value.RequireHeaderSymmetry);
        Assert.Contains(IPAddress.Parse("10.0.0.10"), options.Value.KnownProxies);
        Assert.Contains(
            options.Value.KnownIPNetworks,
            network => network == BclIPNetwork.Parse("10.20.0.0/16"));
    }

    [Fact]
    public void HostPipeline_ProcessesForwardedHeadersBeforeSecurityAndRequestIdentity()
    {
        var source = File.ReadAllText(Path.Combine(FindApiRoot(), "ErpSystem.Api", "Program.cs"));
        var forwardedHeaders = source.IndexOf("app.UseForwardedHeaders();", StringComparison.Ordinal);
        var exceptionHandler = source.IndexOf("app.UseExceptionHandler();", StringComparison.Ordinal);
        var correlation = source.IndexOf("HostCorrelationIdMiddleware", StringComparison.Ordinal);
        var httpsRedirection = source.IndexOf("app.UseHttpsRedirection();", StringComparison.Ordinal);
        var authentication = source.IndexOf("app.UseAuthentication();", StringComparison.Ordinal);
        var rateLimiter = source.IndexOf("app.UseRateLimiter();", StringComparison.Ordinal);

        Assert.True(forwardedHeaders >= 0);
        Assert.True(exceptionHandler > forwardedHeaders);
        Assert.True(correlation > forwardedHeaders);
        Assert.True(httpsRedirection > forwardedHeaders);
        Assert.True(authentication > forwardedHeaders);
        Assert.True(rateLimiter > forwardedHeaders);
    }

    [Fact]
    public void DistributedRuntime_UsesProcessLocalServicesByDefault()
    {
        var services = new ServiceCollection();
        services.AddLogging();

        services.AddHostDistributedRuntime(BuildConfiguration([]));

        using var provider = services.BuildServiceProvider();
        Assert.IsType<MemoryDistributedCache>(provider.GetRequiredService<IDistributedCache>());
        Assert.DoesNotContain(
            "RedisHubLifetimeManager",
            provider.GetRequiredService<HubLifetimeManager<DistributedRuntimeTestHub>>()
                .GetType().Name,
            StringComparison.Ordinal);
    }

    [Fact]
    public void DistributedRuntime_RegistersRedisCacheAndSignalRBackplaneWhenEnabled()
    {
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["DistributedRuntime:Enabled"] = "true",
            ["DistributedRuntime:ReplicaCount"] = "1",
            ["DistributedRuntime:RedisConnectionStringName"] = "Redis",
            ["DistributedRuntime:CacheInstanceName"] = "ErpSystem.Tests:",
            ["DistributedRuntime:SignalRChannelPrefix"] = "ErpSystem.Tests",
            ["ConnectionStrings:Redis"] = "localhost:6379,abortConnect=false"
        });
        var services = new ServiceCollection();
        services.AddLogging();

        services.AddHostDistributedRuntime(configuration);

        using var provider = services.BuildServiceProvider();
        Assert.IsAssignableFrom<RedisCache>(provider.GetRequiredService<IDistributedCache>());
        Assert.Contains(
            "RedisHubLifetimeManager",
            provider.GetRequiredService<HubLifetimeManager<DistributedRuntimeTestHub>>()
                .GetType().Name,
            StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("DistributedRuntime:Enabled")]
    [InlineData("DistributedRuntime:ExternalRateLimitingEnabled")]
    [InlineData("DistributedRuntime:SharedFileStorageEnabled")]
    [InlineData("DistributedRuntime:SessionAffinityEnabled")]
    public void DistributedRuntime_RejectsIncompleteMultipleReplicaConfiguration(string omittedSetting)
    {
        var values = BuildValidMultipleReplicaRuntimeConfiguration();
        values[omittedSetting] = "false";

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDistributedRuntimeServiceCollectionExtensions.GetValidatedSettings(
                BuildConfiguration(values)));

        Assert.Contains(omittedSetting, exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void DistributedRuntime_AcceptsCompleteMultipleReplicaContract()
    {
        var settings = HostDistributedRuntimeServiceCollectionExtensions.GetValidatedSettings(
            BuildConfiguration(BuildValidMultipleReplicaRuntimeConfiguration()));

        Assert.True(settings.Enabled);
        Assert.Equal(2, settings.ReplicaCount);
        Assert.True(settings.ExternalRateLimitingEnabled);
        Assert.True(settings.SharedFileStorageEnabled);
        Assert.True(settings.SessionAffinityEnabled);
    }

    [Fact]
    public void DistributedRuntime_RejectsMissingRedisSecretWithoutEchoingConfiguredValue()
    {
        const string placeholder = "<redis-secret-must-not-be-logged>";
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["DistributedRuntime:Enabled"] = "true",
            ["ConnectionStrings:Redis"] = placeholder
        });

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDistributedRuntimeServiceCollectionExtensions.GetValidatedSettings(configuration));

        Assert.Contains("ConnectionStrings:Redis", exception.Message, StringComparison.Ordinal);
        Assert.DoesNotContain(placeholder, exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void DistributedRuntime_RejectsUnsafeConnectionNameWithoutEchoingIt()
    {
        const string unsafeName = "Redis\r\nInjected-Diagnostic";
        var configuration = BuildConfiguration(new Dictionary<string, string?>
        {
            ["DistributedRuntime:Enabled"] = "true",
            ["DistributedRuntime:RedisConnectionStringName"] = unsafeName
        });

        var exception = Assert.Throws<InvalidOperationException>(() =>
            HostDistributedRuntimeServiceCollectionExtensions.GetValidatedSettings(configuration));

        Assert.Contains("DistributedRuntime values are malformed", exception.Message);
        Assert.DoesNotContain(unsafeName, exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void HealthChecks_RegisterRedisReadinessOnlyWhenDistributedRuntimeIsEnabled()
    {
        var values = new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\mssqllocaldb;Database=HealthChecks;Trusted_Connection=True;",
            ["DistributedRuntime:Enabled"] = "true",
            ["ConnectionStrings:Redis"] = "localhost:6379,abortConnect=false"
        };
        var services = new ServiceCollection();

        services.AddHostHealthChecks(BuildConfiguration(values), ["HR"]);

        using var provider = services.BuildServiceProvider();
        var registrations = provider
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>()
            .Value.Registrations;
        Assert.Single(
            registrations,
            registration => registration.Name == "distributed-runtime:redis");
        Assert.Equal(
            TimeSpan.FromSeconds(5),
            registrations.Single(
                registration => registration.Name == "distributed-runtime:redis").Timeout);
    }

    [Fact]
    public void HealthChecks_RegisterCrystalReadinessOnlyWhenRuntimeIsEnabled()
    {
        var values = new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\mssqllocaldb;Database=HealthChecks;Trusted_Connection=True;",
            ["CrystalReports:RuntimeEnabled"] = "true",
            ["CrystalReports:RuntimeBaseUrl"] = "https://crystal.example.com/"
        };
        var services = new ServiceCollection();

        services.AddHostHealthChecks(BuildConfiguration(values), ["Reporting"]);

        using var provider = services.BuildServiceProvider();
        var registrations = provider
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>()
            .Value.Registrations;

        Assert.Contains(registrations, registration => registration.Name == "reporting:crystal-runtime");
    }

    [Fact]
    public void HealthChecks_DoNotRegisterCrystalReadinessWhenRuntimeIsDisabled()
    {
        var values = new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(localdb)\\mssqllocaldb;Database=HealthChecks;Trusted_Connection=True;",
            ["CrystalReports:RuntimeEnabled"] = "false",
            ["CrystalReports:RuntimeBaseUrl"] = ""
        };
        var services = new ServiceCollection();

        services.AddHostHealthChecks(BuildConfiguration(values), ["Reporting"]);

        using var provider = services.BuildServiceProvider();
        var registrations = provider
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>()
            .Value.Registrations;

        Assert.DoesNotContain(registrations, registration => registration.Name == "reporting:crystal-runtime");
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

    private static PlatformPublicApplicationSettings ResolvePlatformPublicApplicationSettings(
        bool mailEnabled,
        string? frontendUrl)
    {
        var values = new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] =
                "Server=(local);Database=unused;Trusted_Connection=True;TrustServerCertificate=True",
            ["MailSettings:Enabled"] = mailEnabled.ToString(),
            ["MailSettings:Mail"] = "noreply@example.com",
            ["MailSettings:DisplayName"] = "ERP System",
            ["MailSettings:Password"] = "smtp-secret",
            ["MailSettings:Host"] = "smtp.example.com",
            ["MailSettings:Port"] = "465"
        };
        if (frontendUrl is not null)
            values["AppSettings:FrontendUrl"] = frontendUrl;

        var configuration = BuildConfiguration(values);
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddPlatformInfrastructure(configuration);
        using var provider = services.BuildServiceProvider();
        return provider.GetRequiredService<IOptions<PlatformPublicApplicationSettings>>().Value;
    }

    private static Dictionary<string, string?> BuildValidMultipleReplicaRuntimeConfiguration() => new()
    {
        ["DistributedRuntime:Enabled"] = "true",
        ["DistributedRuntime:ReplicaCount"] = "2",
        ["DistributedRuntime:RedisConnectionStringName"] = "Redis",
        ["DistributedRuntime:CacheInstanceName"] = "ErpSystem.Tests:",
        ["DistributedRuntime:SignalRChannelPrefix"] = "ErpSystem.Tests",
        ["DistributedRuntime:ExternalRateLimitingEnabled"] = "true",
        ["DistributedRuntime:SharedFileStorageEnabled"] = "true",
        ["DistributedRuntime:SessionAffinityEnabled"] = "true",
        ["ConnectionStrings:Redis"] = "localhost:6379,abortConnect=false"
    };

    private sealed class DistributedRuntimeTestHub : Hub;

    private static async Task<(string? RemoteIpAddress, string Scheme)> InvokeForwardedHeadersAsync(
        IOptions<ForwardedHeadersOptions> options,
        string transportRemoteIp,
        string forwardedClientIp,
        string forwardedScheme)
    {
        string? capturedRemoteIp = null;
        string? capturedScheme = null;
        var middleware = new ForwardedHeadersMiddleware(
            context =>
            {
                capturedRemoteIp = context.Connection.RemoteIpAddress?.ToString();
                capturedScheme = context.Request.Scheme;
                return Task.CompletedTask;
            },
            NullLoggerFactory.Instance,
            options);
        var context = new DefaultHttpContext();
        context.Connection.RemoteIpAddress = IPAddress.Parse(transportRemoteIp);
        context.Request.Scheme = "http";
        context.Request.Headers[ForwardedHeadersDefaults.XForwardedForHeaderName] = forwardedClientIp;
        context.Request.Headers[ForwardedHeadersDefaults.XForwardedProtoHeaderName] = forwardedScheme;

        await middleware.Invoke(context);

        return (capturedRemoteIp, capturedScheme ?? string.Empty);
    }

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
            ["MailSettings:Enabled"] = "true",
            ["MailSettings:Mail"] = "noreply@example.com",
            ["MailSettings:DisplayName"] = "ERP System",
            ["MailSettings:Password"] = "production-mail-password",
            ["MailSettings:Host"] = "smtp.example.com",
            ["MailSettings:Port"] = "465",
            ["FileSecurity:MalwareScanningEnabled"] = "true",
            ["FileSecurity:ScannerHost"] = "127.0.0.1",
            ["FileSecurity:ScannerPort"] = "3310",
            ["DatabaseSettings:ApplyMigrationsOnStartup"] = "false",
            ["DatabaseSettings:SeedOnStartup"] = "false",
            ["ExternalLogin:Google:ClientId"] = "",
            ["ExternalLogin:Google:ClientSecret"] = "",
            ["DataProtection:KeyRingDirectory"] = Path.Combine(Path.GetTempPath(), "erp-system-production-key-ring"),
            ["DataProtection:ProtectionCertificatePath"] = Path.Combine(Path.GetTempPath(), "erp-system-production-protection.pfx"),
            ["DataProtection:ProtectionCertificatePassword"] = "configured-by-secret-store"
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

