using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Api.Hosting.Localization;

/// <summary>
/// Host-owned adapter for the shared JSON resource catalog.
/// Modules may consume IStringLocalizer but must not replace its global factory.
/// New bounded-context resources should remain module-owned behind a module port.
/// </summary>
public sealed class HostJsonStringLocalizer(IDistributedCache cache) : IStringLocalizer
{
    private const string ResourcePath = "Localization/Resources";
    private static readonly JsonSerializerOptions ResourceJsonOptions = new()
    {
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true
    };

    public LocalizedString this[string name]
    {
        get
        {
            var value = GetString(name);
            return new LocalizedString(name, value, string.Equals(value, name, StringComparison.Ordinal));
        }
    }

    public LocalizedString this[string name, params object[] arguments]
    {
        get
        {
            var value = this[name];
            return value.ResourceNotFound
                ? value
                : new LocalizedString(name, string.Format(CultureInfo.CurrentCulture, value.Value, arguments));
        }
    }

    public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
    {
        var file = ResolveResourceFilePath(CultureInfo.CurrentCulture);
        if (file is null)
            yield break;

        foreach (var pair in ReadResources(file))
            yield return new LocalizedString(pair.Key, pair.Value, resourceNotFound: false);
    }

    private string GetString(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
            return key;

        var culture = CultureInfo.CurrentCulture;
        var file = ResolveResourceFilePath(culture);
        if (file is null)
            return key;

        // This key is a public runtime contract with Platform.LocalizationEffects.
        var cacheKey = $"locale_{culture.Name}_{key}";
        var cached = cache.GetString(cacheKey);
        if (!string.IsNullOrEmpty(cached))
            return cached;

        var resources = ReadResources(file);
        if (!resources.TryGetValue(key, out var value) || string.IsNullOrWhiteSpace(value))
            return key;

        cache.SetString(cacheKey, value);
        return value;
    }

    private static string? ResolveResourceFilePath(CultureInfo culture)
    {
        foreach (var name in CandidateCultures(culture))
        {
            var path = Path.Combine(AppContext.BaseDirectory, ResourcePath, $"{name}.json");
            if (File.Exists(path))
                return path;
        }

        return null;
    }

    private static Dictionary<string, string> ReadResources(string path)
    {
        using var stream = File.Open(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        return JsonSerializer.Deserialize<Dictionary<string, string>>(stream, ResourceJsonOptions)
            ?? new Dictionary<string, string>(StringComparer.Ordinal);
    }

    private static IEnumerable<string> CandidateCultures(CultureInfo culture)
    {
        if (!string.IsNullOrWhiteSpace(culture.Name))
            yield return culture.Name;
        if (!string.IsNullOrWhiteSpace(culture.TwoLetterISOLanguageName))
            yield return culture.TwoLetterISOLanguageName.Equals("ar", StringComparison.OrdinalIgnoreCase) ? "ar-EG" : "en-US";
        yield return "en-US";
    }
}

public sealed class HostJsonStringLocalizerFactory(IDistributedCache cache) : IStringLocalizerFactory
{
    public IStringLocalizer Create(Type resourceSource) => new HostJsonStringLocalizer(cache);

    public IStringLocalizer Create(string baseName, string location) => new HostJsonStringLocalizer(cache);
}
