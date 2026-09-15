using ErpSystem.Modules.Reporting.Infrastructure;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class CrystalReportStorageOptionsTests
{
    [Fact]
    public void DisabledRuntime_AllowsBlankRuntimeConfiguration()
    {
        var options = Resolve(new Dictionary<string, string?>
        {
            ["CrystalReports:RuntimeEnabled"] = "false",
            ["CrystalReports:RuntimeBaseUrl"] = "",
            ["CrystalReports:RuntimeApiKey"] = ""
        });

        Assert.False(options.RuntimeEnabled);
        Assert.Equal(string.Empty, options.RuntimeBaseUrl);
        Assert.Equal(string.Empty, options.RuntimeApiKey);
    }

    [Fact]
    public void DisabledRuntime_StillValidatesLocalLimits()
    {
        var exception = Assert.Throws<OptionsValidationException>(() => Resolve(new Dictionary<string, string?>
        {
            ["CrystalReports:RuntimeEnabled"] = "false",
            ["CrystalReports:MaxFileSizeBytes"] = "0"
        }));

        Assert.Contains("size and response limits", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void EnabledRuntime_RequiresBaseUrlAndApiKey()
    {
        var exception = Assert.Throws<OptionsValidationException>(() => Resolve(new Dictionary<string, string?>
        {
            ["CrystalReports:RuntimeEnabled"] = "true"
        }));

        Assert.Contains("RuntimeBaseUrl", exception.Message, StringComparison.Ordinal);
        Assert.Contains("RuntimeApiKey", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void EnabledRuntime_AcceptsCompleteConfiguration()
    {
        var options = Resolve(new Dictionary<string, string?>
        {
            ["CrystalReports:RuntimeEnabled"] = "true",
            ["CrystalReports:RuntimeBaseUrl"] = "https://crystal.example.com/",
            ["CrystalReports:RuntimeApiKey"] = "runtime-secret"
        });

        Assert.True(options.RuntimeEnabled);
        Assert.Equal("https://crystal.example.com/", options.RuntimeBaseUrl);
    }

    private static CrystalReportStorageOptions Resolve(
        IDictionary<string, string?> values)
    {
        var configuredValues = new Dictionary<string, string?>(values)
        {
            ["ConnectionStrings:Reporting"] = "Server=(localdb)\\mssqllocaldb;Database=ReportingOptions;Trusted_Connection=True;"
        };
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configuredValues)
            .Build();
        var services = new ServiceCollection();
        services.AddReportingInfrastructure(configuration);
        using var provider = services.BuildServiceProvider();
        return provider.GetRequiredService<IOptions<CrystalReportStorageOptions>>().Value;
    }
}
