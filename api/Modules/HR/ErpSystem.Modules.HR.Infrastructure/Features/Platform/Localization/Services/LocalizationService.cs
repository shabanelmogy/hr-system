using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.Platform.Localization.Contracts;
using ErpSystem.Modules.HR.Application.Features.Platform.Localization.Errors;
using ErpSystem.Modules.HR.Application.Features.Platform.Localization.Services;
using ErpSystem.Modules.Platform.Contracts.Localization;
using Newtonsoft.Json;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.Localization.Services;

/// <summary>
/// Compatibility facade preserving the existing HR route/application Result
/// contract while Platform owns localization administration policy.
/// </summary>
public sealed class LocalizationService(
    ILocalizationAdministration localization,
    LocalizationError errors) : ILocalizationService
{
    public async Task<Result<Dictionary<string, string>>> GetLocalization(
        string language,
        CancellationToken cancellationToken = default)
    {
        var result = await localization.GetAsync(language, cancellationToken).ConfigureAwait(false);
        if (!result.IsSuccess)
            return Result.Failure<Dictionary<string, string>>(MapError(result.Failure));

        return Result.Success(result.Values!.ToDictionary(entry => entry.Key, entry => entry.Value));
    }

    public async Task<Result> SaveLocalization(
        string language,
        Dictionary<string, string> localizationData,
        CancellationToken cancellationToken = default)
    {
        var result = await localization.SaveAsync(language, localizationData, cancellationToken).ConfigureAwait(false);
        return result.IsSuccess ? Result.Success() : Result.Failure(MapError(result.Failure));
    }

    public async Task<Result> UpdateLocalizationKey(
        LocalizationRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await localization.UpdateKeyAsync(
            new LocalizationKeyUpdate(request.Language, request.Key, request.Value),
            cancellationToken).ConfigureAwait(false);
        return result.IsSuccess ? Result.Success() : Result.Failure(MapError(result.Failure));
    }

    public async Task<Result> DeleteLocalizationKey(
        string language,
        string key,
        CancellationToken cancellationToken = default)
    {
        var result = await localization.DeleteKeyAsync(language, key, cancellationToken).ConfigureAwait(false);
        return result.IsSuccess ? Result.Success() : Result.Failure(MapError(result.Failure));
    }

    private Error MapError(LocalizationFailure failure) => failure switch
    {
        LocalizationFailure.InvalidLanguage => errors.InvalidLanguage,
        LocalizationFailure.FileNotFound => errors.LocalizationFileNotFound,
        LocalizationFailure.KeyNotFound => errors.LocalizationKeyNotFound,
        _ => throw new InvalidOperationException("A successful localization result cannot be mapped to an error.")
    };
}

/// <summary>Legacy JSON-resource storage adapter for Platform localization policy.</summary>
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

/// <summary>HR-host effects retained for cache invalidation and existing realtime permission routing.</summary>
public sealed class LocalizationEffects(
    IDistributedCache cache,
    IRealtimeChangeDispatcher realtimeChanges) : ILocalizationEffects
{
    public Task InvalidateKeyAsync(
        string language,
        string key,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"locale_{Thread.CurrentThread.CurrentCulture.Name}_{key}";
        return cache.RemoveAsync(cacheKey, cancellationToken);
    }

    public void DispatchChange(string action, string entityId) =>
        realtimeChanges.Dispatch(new RealtimeChangeRequest(
            RealtimeAudience.ForPermission(Permissions.ViewLocalizations),
            "localizations",
            action,
            entityId,
            Guid.NewGuid()));
}
