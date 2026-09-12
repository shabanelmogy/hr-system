using Microsoft.Extensions.Configuration;

namespace ErpSystem.BuildingBlocks.Modularity;

/// <summary>
/// Resolves the startup-migration switch for a module without coupling the
/// host or one module to another module's settings type.
/// </summary>
public static class ModuleMigrationSettings
{
    public static bool ShouldApplyMigrations(
        IConfiguration configuration,
        string moduleName,
        string fallbackSection = "DatabaseSettings")
    {
        ArgumentNullException.ThrowIfNull(configuration);
        ArgumentException.ThrowIfNullOrWhiteSpace(moduleName);

        var moduleKey = $"Modules:{moduleName}:Database:ApplyMigrationsOnStartup";
        var moduleOverride = configuration[moduleKey];
        if (!string.IsNullOrWhiteSpace(moduleOverride))
        {
            if (bool.TryParse(moduleOverride, out var overrideValue))
                return overrideValue;

            throw InvalidBooleanSetting(moduleKey, moduleOverride);
        }

        var fallbackKey = $"{fallbackSection}:ApplyMigrationsOnStartup";
        var fallback = configuration[fallbackKey];
        if (string.IsNullOrWhiteSpace(fallback))
            return false;

        if (bool.TryParse(fallback, out var fallbackValue))
            return fallbackValue;

        throw InvalidBooleanSetting(fallbackKey, fallback);
    }

    private static InvalidOperationException InvalidBooleanSetting(string key, string value) =>
        new($"Configuration '{key}' must be 'true' or 'false'; received '{value}'.");
}
