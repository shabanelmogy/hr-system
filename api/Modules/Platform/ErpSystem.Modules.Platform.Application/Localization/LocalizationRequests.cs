using ErpSystem.Modules.Platform.Application.Features.Platform.Localization.Errors;

namespace ErpSystem.Modules.Platform.Application.Localization;

public sealed record GetLocalizationQuery(string Language)
    : IQuery<Result<IReadOnlyDictionary<string, string>>>;

public sealed record SaveLocalizationCommand(
    string Language,
    IReadOnlyDictionary<string, string> Values) : ICommand<Result>;

public sealed record UpdateLocalizationKeyCommand(LocalizationKeyUpdate Request) : ICommand<Result>;

public sealed record DeleteLocalizationKeyCommand(string Language, string Key) : ICommand<Result>;

internal static class LocalizationPolicy
{
    private static readonly HashSet<string> SupportedLanguages = new(StringComparer.OrdinalIgnoreCase)
    {
        "en-US",
        "ar-EG"
    };

    public static bool IsSupported(string language) => SupportedLanguages.Contains(language);
}

public sealed class GetLocalizationQueryHandler(
    ILocalizationResourceStore store,
    LocalizationError errors)
    : IQueryHandler<GetLocalizationQuery, Result<IReadOnlyDictionary<string, string>>>
{
    public async Task<Result<IReadOnlyDictionary<string, string>>> Handle(
        GetLocalizationQuery request,
        CancellationToken cancellationToken)
    {
        if (!LocalizationPolicy.IsSupported(request.Language))
            return Result.Failure<IReadOnlyDictionary<string, string>>(errors.InvalidLanguage);

        var values = await store.ReadAsync(request.Language, cancellationToken).ConfigureAwait(false);
        return values is null
            ? Result.Failure<IReadOnlyDictionary<string, string>>(errors.LocalizationFileNotFound)
            : Result.Success<IReadOnlyDictionary<string, string>>(values);
    }
}

public sealed class SaveLocalizationCommandHandler(
    ILocalizationResourceStore store,
    ILocalizationEffects effects,
    LocalizationError errors)
    : ICommandHandler<SaveLocalizationCommand, Result>
{
    public async Task<Result> Handle(
        SaveLocalizationCommand command,
        CancellationToken cancellationToken)
    {
        if (!LocalizationPolicy.IsSupported(command.Language))
            return Result.Failure(errors.InvalidLanguage);

        var existing = await store.ReadAsync(command.Language, cancellationToken).ConfigureAwait(false) ?? [];
        foreach (var entry in command.Values)
            existing[entry.Key] = entry.Value;

        await store.WriteAsync(command.Language, existing, cancellationToken).ConfigureAwait(false);
        foreach (var key in command.Values.Keys)
            await effects.InvalidateKeyAsync(command.Language, key, cancellationToken).ConfigureAwait(false);
        effects.DispatchChange("Update", command.Language);
        return Result.Success();
    }
}

public sealed class UpdateLocalizationKeyCommandHandler(
    ILocalizationResourceStore store,
    ILocalizationEffects effects,
    LocalizationError errors)
    : ICommandHandler<UpdateLocalizationKeyCommand, Result>
{
    public async Task<Result> Handle(
        UpdateLocalizationKeyCommand command,
        CancellationToken cancellationToken)
    {
        var request = command.Request;
        if (!LocalizationPolicy.IsSupported(request.Language))
            return Result.Failure(errors.InvalidLanguage);

        var existing = await store.ReadAsync(request.Language, cancellationToken).ConfigureAwait(false) ?? [];
        if (!existing.ContainsKey(request.Key))
            return Result.Failure(errors.LocalizationKeyNotFound);

        existing[request.Key] = request.Value;
        await store.WriteAsync(request.Language, existing, cancellationToken).ConfigureAwait(false);
        await effects.InvalidateKeyAsync(request.Language, request.Key, cancellationToken).ConfigureAwait(false);
        effects.DispatchChange("Update", $"{request.Language}:{request.Key}");
        return Result.Success();
    }
}

public sealed class DeleteLocalizationKeyCommandHandler(
    ILocalizationResourceStore store,
    ILocalizationEffects effects,
    LocalizationError errors)
    : ICommandHandler<DeleteLocalizationKeyCommand, Result>
{
    public async Task<Result> Handle(
        DeleteLocalizationKeyCommand command,
        CancellationToken cancellationToken)
    {
        if (!LocalizationPolicy.IsSupported(command.Language))
            return Result.Failure(errors.InvalidLanguage);

        var existing = await store.ReadAsync(command.Language, cancellationToken).ConfigureAwait(false);
        if (existing is null)
            return Result.Failure(errors.LocalizationFileNotFound);
        if (!existing.Remove(command.Key))
            return Result.Failure(errors.LocalizationKeyNotFound);

        await store.WriteAsync(command.Language, existing, cancellationToken).ConfigureAwait(false);
        await effects.InvalidateKeyAsync(command.Language, command.Key, cancellationToken).ConfigureAwait(false);
        effects.DispatchChange("Delete", $"{command.Language}:{command.Key}");
        return Result.Success();
    }
}
