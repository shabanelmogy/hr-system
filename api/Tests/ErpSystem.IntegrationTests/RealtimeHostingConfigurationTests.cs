using System.Xml.Linq;

namespace ErpSystem.IntegrationTests;

public sealed class RealtimeHostingConfigurationTests
{
    [Fact]
    public void SignalRQueryTokensHaveABoundedHubOnlyIisEnvelope()
    {
        var root = RepositoryRoot();
        var document = XDocument.Load(Path.Combine(root, "api", "ErpSystem.Api", "web.config"));
        var locations = document.Root!.Elements("location").ToArray();
        var hub = Assert.Single(locations, location => (string?)location.Attribute("path") == "hubs/company");
        var limits = Assert.Single(hub.Descendants("requestLimits"));
        Assert.Equal("24576", (string?)limits.Attribute("maxQueryString"));
        Assert.Equal("24576", (string?)limits.Attribute("maxUrl"));
        Assert.Single(document.Descendants("requestLimits"));
        Assert.Empty(hub.Descendants("authentication"));
        Assert.Empty(hub.Descendants("authorization"));
        Assert.Empty(hub.Descendants("httpProtocol"));
        var application = Assert.Single(locations, location => (string?)location.Attribute("path") == ".");
        Assert.NotNull(application.Descendants("aspNetCore").SingleOrDefault());
    }

    private static string RepositoryRoot()
    {
        for (var directory = new DirectoryInfo(AppContext.BaseDirectory); directory is not null; directory = directory.Parent)
            if (File.Exists(Path.Combine(directory.FullName, "api", "ErpSystem.sln"))) return directory.FullName;
        throw new InvalidOperationException("Repository root not found.");
    }
}
