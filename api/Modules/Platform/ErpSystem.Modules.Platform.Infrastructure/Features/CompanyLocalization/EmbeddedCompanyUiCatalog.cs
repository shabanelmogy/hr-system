using System.Text.Json;
using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.CompanyLocalization;

/// <summary>Immutable shipped UI resources generated with both client fingerprints.</summary>
public sealed class EmbeddedCompanyUiCatalog : ICompanyUiCatalog
{
    private readonly CatalogArtifact _catalog;
    public EmbeddedCompanyUiCatalog()
    {
        var assembly = typeof(EmbeddedCompanyUiCatalog).Assembly;
        var name = assembly.GetManifestResourceNames().Single(item => item.EndsWith(".company-ui-catalog.json", StringComparison.Ordinal));
        using var stream = assembly.GetManifestResourceStream(name) ?? throw new InvalidOperationException("The UI catalog is missing.");
        _catalog = JsonSerializer.Deserialize<CatalogArtifact>(stream, new JsonSerializerOptions(JsonSerializerDefaults.Web))
            ?? throw new InvalidOperationException("The UI catalog is invalid.");
        if (_catalog.SchemaVersion != 3 || _catalog.Sources.Count == 0 ||
            _catalog.Sources.Any(source => source.Entries.Any(text => text.Scope is not ("system" or "company" or "shared"))) ||
            !_catalog.Versions.ContainsKey("web") || !_catalog.Versions.ContainsKey("mobile"))
            throw new InvalidOperationException("The UI catalog contract is invalid.");
    }
    public IReadOnlyList<CompanyUiSource> Sources => _catalog.Sources;
    public string GetVersion(string client) => _catalog.Versions.TryGetValue(client, out var version)
        ? version : throw new ArgumentException("Unknown UI client.", nameof(client));
    private sealed record CatalogArtifact(int SchemaVersion, Dictionary<string, string> Versions, List<CompanyUiSource> Sources);
}
