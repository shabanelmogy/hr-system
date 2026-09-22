using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.Platform.Application.Localization;
using Newtonsoft.Json;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Localization.Services;

/// <summary>JSON-resource storage adapter for Platform localization policy.</summary>
public sealed class LocalizationResourceStore : ILocalizationResourceStore
{
    private static string GetFilePath(string language) =>
        Path.Combine(AppContext.BaseDirectory, "Localization", "Resources", $"{language}.json");

    public async Task<Dictionary<string, string>?> ReadAsync(
        string language,
        CancellationToken cancellationToken = default)
    {
        var filePath = GetFilePath(language);
        if (!File.Exists(filePath))
            return null;

        var json = await File.ReadAllTextAsync(filePath, cancellationToken).ConfigureAwait(false);
        return JsonConvert.DeserializeObject<Dictionary<string, string>>(json) ?? [];
    }

    public async Task WriteAsync(
        string language,
        IReadOnlyDictionary<string, string> values,
        CancellationToken cancellationToken = default)
    {
        var json = JsonConvert.SerializeObject(values, Formatting.Indented);
        await File.WriteAllTextAsync(GetFilePath(language), json, cancellationToken).ConfigureAwait(false);
    }
}

/// <summary>Platform effects for cache invalidation and realtime permission routing.</summary>
public sealed class LocalizationEffects(
    IDistributedCache cache,
    IRealtimeChangeDispatcher realtimeChanges) : ILocalizationEffects
{
    public Task InvalidateKeyAsync(
        string language,
        string key,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"locale_{language}_{key}";
        return cache.RemoveAsync(cacheKey, cancellationToken);
    }

    public void DispatchChange(string action, string entityId) =>
        realtimeChanges.Dispatch(new RealtimeChangeRequest(
            RealtimeAudience.ForPermission(PlatformPermissions.ViewLocalizations),
            "localizations",
            action,
            entityId,
            Guid.NewGuid()));
}
