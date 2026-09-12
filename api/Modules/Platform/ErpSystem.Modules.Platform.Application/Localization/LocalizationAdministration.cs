using ErpSystem.Modules.Platform.Contracts.Localization;

namespace ErpSystem.Modules.Platform.Application.Localization;

internal sealed class LocalizationAdministration(
    ILocalizationResourceStore store,
    ILocalizationEffects effects) : ILocalizationAdministration
{
    private static readonly HashSet<string> SupportedLanguages = new(StringComparer.OrdinalIgnoreCase)
    {
        "en-US",
        "ar-EG"
    };

    public async Task<LocalizationReadResult> GetAsync(
        string language,
        CancellationToken cancellationToken = default)
    {
        if (!SupportedLanguages.Contains(language))
            return new(null, LocalizationFailure.InvalidLanguage);

        var values = await store.ReadAsync(language, cancellationToken).ConfigureAwait(false);
        return values is null
            ? new(null, LocalizationFailure.FileNotFound)
            : new(values, LocalizationFailure.None);
    }

    public async Task<LocalizationOperationResult> SaveAsync(
        string language,
        IReadOnlyDictionary<string, string> localizationData,
        CancellationToken cancellationToken = default)
    {
        if (!SupportedLanguages.Contains(language))
            return new(LocalizationFailure.InvalidLanguage);

        var existing = await store.ReadAsync(language, cancellationToken).ConfigureAwait(false) ?? [];
        foreach (var entry in localizationData)
            existing[entry.Key] = entry.Value;

        await store.WriteAsync(language, existing, cancellationToken).ConfigureAwait(false);
        effects.DispatchChange("Update", language);
        return new(LocalizationFailure.None);
    }

    public async Task<LocalizationOperationResult> UpdateKeyAsync(
        LocalizationKeyUpdate request,
        CancellationToken cancellationToken = default)
    {
        if (!SupportedLanguages.Contains(request.Language))
            return new(LocalizationFailure.InvalidLanguage);

        var existing = await store.ReadAsync(request.Language, cancellationToken).ConfigureAwait(false) ?? [];
        if (!existing.ContainsKey(request.Key))
            return new(LocalizationFailure.KeyNotFound);

        existing[request.Key] = request.Value;
        await store.WriteAsync(request.Language, existing, cancellationToken).ConfigureAwait(false);
        await effects.InvalidateKeyAsync(request.Language, request.Key, cancellationToken).ConfigureAwait(false);
        effects.DispatchChange("Update", $"{request.Language}:{request.Key}");
        return new(LocalizationFailure.None);
    }

    public async Task<LocalizationOperationResult> DeleteKeyAsync(
        string language,
        string key,
        CancellationToken cancellationToken = default)
    {
        if (!SupportedLanguages.Contains(language))
            return new(LocalizationFailure.InvalidLanguage);

        var existing = await store.ReadAsync(language, cancellationToken).ConfigureAwait(false);
        if (existing is null)
            return new(LocalizationFailure.FileNotFound);
        if (!existing.Remove(key))
            return new(LocalizationFailure.KeyNotFound);

        await store.WriteAsync(language, existing, cancellationToken).ConfigureAwait(false);
        effects.DispatchChange("Delete", $"{language}:{key}");
        return new(LocalizationFailure.None);
    }
}
