using ErpSystem.BuildingBlocks.Modularity;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.BuildingBlocks.Tests;

public sealed class ModuleMigrationSettingsTests
{
    [Theory]
    [InlineData(null, "true", true)]
    [InlineData(null, "false", false)]
    [InlineData("true", "false", true)]
    [InlineData("false", "true", false)]
    public void ShouldApplyMigrations_UsesModuleOverrideBeforeFallback(
        string? moduleOverride,
        string fallback,
        bool expected)
    {
        var values = new Dictionary<string, string?>
        {
            ["DatabaseSettings:ApplyMigrationsOnStartup"] = fallback
        };
        if (moduleOverride is not null)
            values["Modules:HR:Database:ApplyMigrationsOnStartup"] = moduleOverride;

        var configuration = new ConfigurationBuilder().AddInMemoryCollection(values).Build();

        Assert.Equal(expected, ModuleMigrationSettings.ShouldApplyMigrations(configuration, "HR"));
    }

    [Fact]
    public void ShouldApplyMigrations_RejectsInvalidModuleOverride()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Modules:HR:Database:ApplyMigrationsOnStartup"] = "sometimes",
                ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true"
            })
            .Build();

        var exception = Assert.Throws<InvalidOperationException>(() =>
            ModuleMigrationSettings.ShouldApplyMigrations(configuration, "HR"));

        Assert.Contains("Modules:HR:Database:ApplyMigrationsOnStartup", exception.Message, StringComparison.Ordinal);
        Assert.Contains("sometimes", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ShouldApplyMigrations_RejectsInvalidFallback()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DatabaseSettings:ApplyMigrationsOnStartup"] = "sometimes"
            })
            .Build();

        var exception = Assert.Throws<InvalidOperationException>(() =>
            ModuleMigrationSettings.ShouldApplyMigrations(configuration, "HR"));

        Assert.Contains("DatabaseSettings:ApplyMigrationsOnStartup", exception.Message, StringComparison.Ordinal);
        Assert.Contains("sometimes", exception.Message, StringComparison.Ordinal);
    }
}
