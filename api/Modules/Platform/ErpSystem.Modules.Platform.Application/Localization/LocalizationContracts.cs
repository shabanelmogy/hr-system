namespace ErpSystem.Modules.Platform.Application.Localization;

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

public interface ILocalizationEffects
{
    Task InvalidateKeyAsync(
        string language,
        string key,
        CancellationToken cancellationToken = default);

    void DispatchChange(string action, string entityId);
}
