using ErpSystem.Modules.Platform.Domain.Companies.Entities;

namespace ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;

public sealed record GetCompanyLocalizationSettingsQuery : IQuery<Result<CompanyLocalizationSettingsResponse>>;
public sealed record GetCompanyLocalizationTextsQuery(CompanyLocalizationTextsQuery Query) : IQuery<Result<CompanyLocalizationTextsResponse>>;
public sealed record GetCompanyLocalizationRuntimeQuery(string Client, string CatalogVersion) : IQuery<Result<CompanyLocalizationRuntimeResponse>>;
public sealed record SetCompanyLanguageCommand(SetCompanyLanguageRequest Request) : ICommand<Result>;
public sealed record SetCompanyTextCommand(SetCompanyTextRequest Request) : ICommand<Result>;
public sealed record ResetCompanyTextCommand(ResetCompanyTextRequest Request) : ICommand<Result>;

public sealed class GetCompanyLocalizationTextsValidator : AbstractValidator<GetCompanyLocalizationTextsQuery>
{
    public GetCompanyLocalizationTextsValidator()
    {
        RuleFor(item => item.Query).NotNull();
        When(item => item.Query is not null, () => {
            RuleFor(item => item.Query.Source).NotEmpty().MaximumLength(100);
            RuleFor(item => item.Query.BaseLanguage).Must(CompanyLocalizationValidation.IsLanguage);
            RuleFor(item => item.Query.TargetLanguage).Must(CompanyLocalizationValidation.IsLanguage);
            RuleFor(item => item.Query.Search).MaximumLength(200);
            RuleFor(item => item.Query.Status).Must(value => value is "all" or "missing" or "customized");
            RuleFor(item => item.Query.Page).InclusiveBetween(1, 100000);
            RuleFor(item => item.Query.PageSize).InclusiveBetween(1, 100);
        });
    }
}
public static class CompanyLocalizationValidation
{
    public static bool IsCompanyText(CompanyUiText text) => text.Scope is "company" or "shared";
    public static bool IsLanguage(string? language) => language is "en" or "ar";
    public static bool IsIdentifier(string? value, int max) => !string.IsNullOrWhiteSpace(value) && value.Length <= max && value == value.Trim();
    public static CompanyUiText? Find(ICompanyUiCatalog catalog, string source, string key) =>
        catalog.Sources.FirstOrDefault(item => item.Id == source)?.Entries.FirstOrDefault(item => item.Key == key);
    public static string Shipped(CompanyUiText text, string language) =>
        language == "ar" ? text.Ar ?? text.En ?? string.Empty : text.En ?? text.Ar ?? string.Empty;
}
public sealed class CompanyLocalizationQueryHandler(ICompanyLocalizationStore store, ICompanyUiCatalog catalog, CompanyLocalizationErrors errors)
    : IQueryHandler<GetCompanyLocalizationSettingsQuery, Result<CompanyLocalizationSettingsResponse>>,
      IQueryHandler<GetCompanyLocalizationTextsQuery, Result<CompanyLocalizationTextsResponse>>,
      IQueryHandler<GetCompanyLocalizationRuntimeQuery, Result<CompanyLocalizationRuntimeResponse>>
{
    public async Task<Result<CompanyLocalizationSettingsResponse>> Handle(GetCompanyLocalizationSettingsQuery request, CancellationToken token)
    {
        var value = await store.GetSettingsAsync(token);
        return value is null ? Result.Failure<CompanyLocalizationSettingsResponse>(errors.Forbidden) : Result.Success(value);
    }
    public async Task<Result<CompanyLocalizationTextsResponse>> Handle(GetCompanyLocalizationTextsQuery request, CancellationToken token)
    {
        var query = request.Query;
        if (query is null || !catalog.Sources.Any(item => item.Id == query.Source) ||
            !CompanyLocalizationValidation.IsLanguage(query.BaseLanguage) || !CompanyLocalizationValidation.IsLanguage(query.TargetLanguage) ||
            query.Status is not ("all" or "missing" or "customized") || query.Page is <1 or >100000 || query.PageSize is <1 or >100 || (query.Search?.Length ?? 0)>200)
            return Result.Failure<CompanyLocalizationTextsResponse>(errors.Invalid);
        if (!catalog.Sources.Single(item => item.Id == query.Source).Entries.Any(CompanyLocalizationValidation.IsCompanyText))
            return Result.Failure<CompanyLocalizationTextsResponse>(errors.Forbidden);
        var value = await store.GetTextsAsync(query, token);
        return value is null ? Result.Failure<CompanyLocalizationTextsResponse>(errors.Forbidden) : Result.Success(value);
    }
    public async Task<Result<CompanyLocalizationRuntimeResponse>> Handle(GetCompanyLocalizationRuntimeQuery request, CancellationToken token)
    {
        if (request.Client is not ("web" or "mobile")) return Result.Failure<CompanyLocalizationRuntimeResponse>(errors.Invalid);
        if (request.CatalogVersion != catalog.GetVersion(request.Client))
            return Result.Failure<CompanyLocalizationRuntimeResponse>(errors.CatalogOutdated);
        var value = await store.GetRuntimeAsync(request.Client, token);
        return value is null ? Result.Failure<CompanyLocalizationRuntimeResponse>(errors.Forbidden) : Result.Success(value);
    }
}
public sealed class CompanyLocalizationCommandHandler(ICompanyLocalizationStore store, ICompanyUiCatalog catalog, CompanyLocalizationErrors errors)
    : ICommandHandler<SetCompanyLanguageCommand, Result>, ICommandHandler<SetCompanyTextCommand, Result>, ICommandHandler<ResetCompanyTextCommand, Result>
{
    public Task<Result> Handle(SetCompanyLanguageCommand command, CancellationToken token)
    {
        var request = command.Request;
        if (request is null || request.ExpectedRevision < 0 || !CompanyLocalizationValidation.IsLanguage(request.Language))
            return Task.FromResult(Result.Failure(errors.Invalid));
        return store.ApplyAsync(new(CompanyLocalizationChangeKind.SetDefault, request.Language, request.ExpectedRevision), token);
    }
    public Task<Result> Handle(SetCompanyTextCommand command, CancellationToken token)
    {
        var request = command.Request;
        if (request is null || request.ExpectedRevision < 0 || !ValidKey(request.Source, request.Language, request.Key) ||
            string.IsNullOrWhiteSpace(request.Value) || request.Value.Length > 4000)
            return Task.FromResult(Result.Failure(errors.Invalid));
        var text = CompanyLocalizationValidation.Find(catalog, request.Source, request.Key)!;
        if (!CompanyLocalizationValidation.IsCompanyText(text))
            return Task.FromResult(Result.Failure(errors.Forbidden));
        if (!CompanyLocalizationTextPolicy.HasMatchingPlaceholders(CompanyLocalizationValidation.Shipped(text, request.Language), request.Value))
            return Task.FromResult(Result.Failure(errors.Invalid));
        return store.ApplyAsync(new(CompanyLocalizationChangeKind.SetText, request.Language, request.ExpectedRevision, request.Source, request.Key, request.Value), token);
    }
    public Task<Result> Handle(ResetCompanyTextCommand command, CancellationToken token)
    {
        var request = command.Request;
        if (request is null || request.ExpectedRevision < 0 || !ValidKey(request.Source, request.Language, request.Key))
            return Task.FromResult(Result.Failure(errors.Invalid));
        if (!CompanyLocalizationValidation.IsCompanyText(CompanyLocalizationValidation.Find(catalog, request.Source, request.Key)!))
            return Task.FromResult(Result.Failure(errors.Forbidden));
        return store.ApplyAsync(new(CompanyLocalizationChangeKind.ResetText, request.Language, request.ExpectedRevision, request.Source, request.Key), token);
    }
    private bool ValidKey(string source, string language, string key) =>
        CompanyLocalizationValidation.IsIdentifier(source,100) && CompanyLocalizationValidation.IsIdentifier(key,400)
        && CompanyLocalizationValidation.IsLanguage(language) && CompanyLocalizationValidation.Find(catalog, source, key) is not null;
}
