namespace ErpSystem.Modules.Platform.Contracts.Localization;

public enum LocalizationFailure
{
    None = 0,
    InvalidLanguage = 1,
    FileNotFound = 2,
    KeyNotFound = 3
}

public sealed record LocalizationKeyUpdate(
    string Language,
    string Key,
    string Value);

public sealed record LocalizationReadResult(
    IReadOnlyDictionary<string, string>? Values,
    LocalizationFailure Failure)
{
    public bool IsSuccess => Failure == LocalizationFailure.None;
}

public readonly record struct LocalizationOperationResult(LocalizationFailure Failure)
{
    public bool IsSuccess => Failure == LocalizationFailure.None;
}

/// <summary>
/// Storage boundary for localization resources. The current adapter keeps the
/// existing JSON resources in the legacy HR infrastructure output directory.
/// </summary>
public interface ILocalizationResourceStore
{
    Task<Dictionary<string, string>?> ReadAsync(
        string language,
        CancellationToken cancellationToken = default);

    Task WriteAsync(
        string language,
        IReadOnlyDictionary<string, string> values,
        CancellationToken cancellationToken = default);
}

/// <summary>Host effects that are intentionally outside localization policy.</summary>
public interface ILocalizationEffects
{
    Task InvalidateKeyAsync(
        string language,
        string key,
        CancellationToken cancellationToken = default);

    void DispatchChange(string action, string entityId);
}

public interface ILocalizationAdministration
{
    Task<LocalizationReadResult> GetAsync(
        string language,
        CancellationToken cancellationToken = default);

    Task<LocalizationOperationResult> SaveAsync(
        string language,
        IReadOnlyDictionary<string, string> localizationData,
        CancellationToken cancellationToken = default);

    Task<LocalizationOperationResult> UpdateKeyAsync(
        LocalizationKeyUpdate request,
        CancellationToken cancellationToken = default);

    Task<LocalizationOperationResult> DeleteKeyAsync(
        string language,
        string key,
        CancellationToken cancellationToken = default);
}
