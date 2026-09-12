using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Data.SqlClient;

namespace ErpSystem.Api.Hosting;

/// <summary>
/// Validates deployment-sensitive host configuration before services, migrations,
/// seed work, or other startup side effects are registered. Diagnostics mention
/// configuration keys only; values are deliberately never included.
/// </summary>
public static class HostDeploymentConfigurationValidator
{
    private static readonly string[] PlaceholderMarkers =
    [
        "YOUR_",
        "YOUR-",
        "CHANGE_ME",
        "CHANGE-ME",
        "REPLACE_ME",
        "REPLACE-ME",
        "SET_VIA",
        "SET-VIA",
        "TODO"
    ];

    public static void Validate(
        IConfiguration configuration,
        string environmentName,
        IEnumerable<string> installedModuleNames)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        ArgumentException.ThrowIfNullOrWhiteSpace(environmentName);
        ArgumentNullException.ThrowIfNull(installedModuleNames);

        var moduleNames = installedModuleNames
            .Where(static name => !string.IsNullOrWhiteSpace(name))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var errors = new List<string>();
        var isProduction = string.Equals(
            environmentName,
            Environments.Production,
            StringComparison.OrdinalIgnoreCase);

        foreach (var moduleName in moduleNames)
        {
            var configuredKey = $"ConnectionStrings:{moduleName}";
            var connectionString = configuration.GetConnectionString(moduleName);
            if (connectionString is null)
            {
                configuredKey = "ConnectionStrings:DefaultConnection";
                connectionString = configuration.GetConnectionString("DefaultConnection");
            }

            ValidateSqlConnection(
                errors,
                connectionString,
                connectionString is null
                    ? $"ConnectionStrings:{moduleName} or ConnectionStrings:DefaultConnection"
                    : configuredKey,
                isProduction);
        }

        var hangfireConnection = configuration.GetConnectionString("HangfireConnection");
        if (hangfireConnection is null)
            hangfireConnection = configuration.GetConnectionString("DefaultConnection");

        ValidateSqlConnection(
            errors,
            hangfireConnection,
            hangfireConnection is null
                ? "ConnectionStrings:HangfireConnection or ConnectionStrings:DefaultConnection"
                : configuration.GetConnectionString("HangfireConnection") is null
                    ? "ConnectionStrings:DefaultConnection"
                    : "ConnectionStrings:HangfireConnection",
            isProduction);

        if (isProduction)
            ValidateProductionConfiguration(configuration, moduleNames, errors);

        if (errors.Count == 0)
            return;

        throw new InvalidOperationException(
            "Host deployment configuration validation failed:" +
            Environment.NewLine +
            string.Join(Environment.NewLine, errors.Select(error => $"- {error}")));
    }

    private static void ValidateProductionConfiguration(
        IConfiguration configuration,
        IReadOnlyCollection<string> moduleNames,
        ICollection<string> errors)
    {
        ValidateAllowedHosts(configuration["AllowedHosts"], errors);
        ValidateSecureOrigins(
            configuration.GetSection("CorsSettings:AllowedOrigins")
                .GetChildren()
                .Select(section => section.Value)
                .Where(static value => value is not null)
                .Cast<string>(),
            "CorsSettings:AllowedOrigins",
            errors);
        ValidateSecureUrl(configuration["AppSettings:FrontendUrl"], "AppSettings:FrontendUrl", errors);

        RequireProductionSecret(configuration["JwtOptions:Key"], "JwtOptions:Key", errors);
        RequireProductionSecret(configuration["MailSettings:Password"], "MailSettings:Password", errors);

        ValidateFalseSwitch(configuration, "DatabaseSettings:SeedOnStartup", errors);
        ValidateFalseSwitch(configuration, "DatabaseSettings:ApplyMigrationsOnStartup", errors);
        foreach (var moduleName in moduleNames)
        {
            ValidateFalseSwitch(
                configuration,
                $"Modules:{moduleName}:Database:ApplyMigrationsOnStartup",
                errors);
        }

        var googleClientId = configuration["ExternalLogin:Google:ClientId"];
        var googleClientSecret = configuration["ExternalLogin:Google:ClientSecret"];
        var clientIdPresent = !string.IsNullOrWhiteSpace(googleClientId);
        var clientSecretPresent = !string.IsNullOrWhiteSpace(googleClientSecret);
        if (clientIdPresent || clientSecretPresent)
        {
            if (!clientIdPresent ||
                !clientSecretPresent ||
                IsUnsetOrPlaceholder(googleClientId) ||
                IsUnsetOrPlaceholder(googleClientSecret))
            {
                errors.Add(
                    "ExternalLogin:Google:ClientId and ExternalLogin:Google:ClientSecret must both be non-placeholder values or both be empty.");
            }
        }
    }

    private static void ValidateSqlConnection(
        ICollection<string> errors,
        string? connectionString,
        string settingKey,
        bool requireProductionTransportSecurity)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            errors.Add($"{settingKey} must be configured.");
            return;
        }

        if (IsUnsetOrPlaceholder(connectionString))
        {
            errors.Add($"{settingKey} must not be a placeholder.");
            return;
        }

        try
        {
            var builder = new SqlConnectionStringBuilder(connectionString);
            if (!requireProductionTransportSecurity)
                return;

            if (builder.TrustServerCertificate)
            {
                errors.Add($"{settingKey}:TrustServerCertificate must be false in production.");
            }

            if (builder.ContainsKey("Encrypt") &&
                IsFalseValue(builder["Encrypt"]?.ToString()))
            {
                errors.Add($"{settingKey}:Encrypt must not be false in production.");
            }
        }
        catch (ArgumentException)
        {
            errors.Add($"{settingKey} must be a valid SQL connection string.");
        }
    }

    private static void ValidateAllowedHosts(string? allowedHosts, ICollection<string> errors)
    {
        if (string.IsNullOrWhiteSpace(allowedHosts))
        {
            errors.Add("AllowedHosts must contain an explicit production host.");
            return;
        }

        var hosts = allowedHosts
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (hosts.Length == 0 || hosts.Any(static host => host.Contains('*', StringComparison.Ordinal)))
        {
            errors.Add("AllowedHosts must not be empty or wildcarded in production.");
            return;
        }

        foreach (var host in hosts)
        {
            if (host.Contains('/', StringComparison.Ordinal) ||
                host.Contains("://", StringComparison.Ordinal) ||
                !IsValidHostWithoutPort(host) ||
                IsLoopbackHost(host))
            {
                errors.Add("AllowedHosts must contain valid host names without schemes, ports, paths, or loopback hosts.");
                return;
            }
        }
    }

    private static void ValidateSecureOrigins(
        IEnumerable<string> origins,
        string settingKey,
        ICollection<string> errors)
    {
        var values = origins.ToArray();
        if (values.Length == 0)
        {
            errors.Add($"{settingKey} must contain at least one HTTPS origin in production.");
            return;
        }

        foreach (var origin in values)
        {
            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri) ||
                !string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase) ||
                IsLoopbackHost(uri.Host) ||
                !string.IsNullOrEmpty(uri.UserInfo) ||
                !string.Equals(
                    origin.TrimEnd('/'),
                    uri.GetLeftPart(UriPartial.Authority),
                    StringComparison.OrdinalIgnoreCase))
            {
                errors.Add($"{settingKey} must contain only HTTPS origins without loopback hosts or paths.");
                return;
            }
        }
    }

    private static void ValidateSecureUrl(string? value, string settingKey, ICollection<string> errors)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) ||
            !string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase) ||
            IsLoopbackHost(uri.Host) ||
            !string.IsNullOrEmpty(uri.UserInfo))
        {
            errors.Add($"{settingKey} must be an HTTPS URL on a non-loopback host in production.");
        }
    }

    private static void RequireProductionSecret(string? value, string settingKey, ICollection<string> errors)
    {
        if (IsUnsetOrPlaceholder(value))
            errors.Add($"{settingKey} must be provided by a production secret store.");
    }

    private static void ValidateFalseSwitch(
        IConfiguration configuration,
        string settingKey,
        ICollection<string> errors)
    {
        var value = configuration[settingKey];
        if (string.IsNullOrWhiteSpace(value))
            return;

        if (!bool.TryParse(value, out var parsed))
        {
            errors.Add($"{settingKey} must be 'false' in production.");
            return;
        }

        if (parsed)
            errors.Add($"{settingKey} must be false in production; run migrations as a deployment step.");
    }

    private static bool IsValidHostWithoutPort(string host)
    {
        var normalized = host.Trim();
        if (normalized.StartsWith("[", StringComparison.Ordinal) &&
            normalized.EndsWith("]", StringComparison.Ordinal))
        {
            return IPAddress.TryParse(normalized.Trim('[', ']'), out _);
        }

        return !normalized.Contains(':', StringComparison.Ordinal) &&
            Uri.CheckHostName(normalized) is UriHostNameType.Dns or UriHostNameType.IPv4;
    }

    private static bool IsFalseValue(string? value) =>
        value?.Trim().ToLowerInvariant() is "0" or "false" or "no";

    private static bool IsUnsetOrPlaceholder(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return true;

        var normalized = value.Trim();
        if (normalized.StartsWith('<') && normalized.EndsWith('>'))
            return true;

        return PlaceholderMarkers.Any(marker =>
            normalized.Contains(marker, StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsLoopbackHost(string host)
    {
        var normalized = host.Trim().Trim('[', ']');
        if (string.Equals(normalized, "localhost", StringComparison.OrdinalIgnoreCase))
            return true;

        return IPAddress.TryParse(normalized, out var address) && IPAddress.IsLoopback(address);
    }
}
