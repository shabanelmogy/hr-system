using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
namespace ErpSystem.Modules.Platform.Application.Features.SystemLocalization;

public sealed record GetSystemLocalizationSettingsQuery : IQuery<Result<SystemLocalizationSettingsResponse>>;
public sealed record GetSystemLocalizationTextsQuery(CompanyLocalizationTextsQuery Query) : IQuery<Result<CompanyLocalizationTextsResponse>>;
public sealed record GetSystemLocalizationRuntimeQuery(string Client, string CatalogVersion) : IQuery<Result<SystemLocalizationRuntimeResponse>>;
public sealed record SetSystemTextCommand(SetCompanyTextRequest Request) : ICommand<Result>;
public sealed record ResetSystemTextCommand(ResetCompanyTextRequest Request) : ICommand<Result>;

public sealed class GetSystemLocalizationTextsValidator : AbstractValidator<GetSystemLocalizationTextsQuery>
{
    public GetSystemLocalizationTextsValidator()
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
public sealed class SystemLocalizationQueryHandler(ISystemLocalizationStore store, ICompanyUiCatalog catalog, SystemLocalizationErrors errors)
    : IQueryHandler<GetSystemLocalizationSettingsQuery, Result<SystemLocalizationSettingsResponse>>,
      IQueryHandler<GetSystemLocalizationTextsQuery, Result<CompanyLocalizationTextsResponse>>,
      IQueryHandler<GetSystemLocalizationRuntimeQuery, Result<SystemLocalizationRuntimeResponse>>
{
    public async Task<Result<SystemLocalizationSettingsResponse>> Handle(GetSystemLocalizationSettingsQuery request, CancellationToken token)
    {
        var value = await store.GetSettingsAsync(token);
        return value is null ? Result.Failure<SystemLocalizationSettingsResponse>(errors.Forbidden) : Result.Success(value);
    }
    public async Task<Result<CompanyLocalizationTextsResponse>> Handle(GetSystemLocalizationTextsQuery request, CancellationToken token)
    {
        var query = request.Query;
        if (query is null || !catalog.Sources.Any(item => item.Id == query.Source) ||
            !CompanyLocalizationValidation.IsLanguage(query.BaseLanguage) || !CompanyLocalizationValidation.IsLanguage(query.TargetLanguage) ||
            query.Status is not ("all" or "missing" or "customized") || query.Page is <1 or >100000 || query.PageSize is <1 or >100 || (query.Search?.Length ?? 0)>200)
            return Result.Failure<CompanyLocalizationTextsResponse>(errors.Invalid);
        if (!catalog.Sources.Single(item => item.Id == query.Source).Entries.Any(text => text.SystemPermissions is not null))
            return Result.Failure<CompanyLocalizationTextsResponse>(errors.Forbidden);
        var value = await store.GetTextsAsync(query, token);
        return value is null ? Result.Failure<CompanyLocalizationTextsResponse>(errors.Forbidden) : Result.Success(value);
    }
    public async Task<Result<SystemLocalizationRuntimeResponse>> Handle(GetSystemLocalizationRuntimeQuery request, CancellationToken token)
    {
        if (request.Client is not ("web" or "mobile")) return Result.Failure<SystemLocalizationRuntimeResponse>(errors.Invalid);
        if (request.CatalogVersion != catalog.GetVersion(request.Client))
            return Result.Failure<SystemLocalizationRuntimeResponse>(errors.CatalogOutdated);
        var value = await store.GetRuntimeAsync(request.Client, token);
        return value is null ? Result.Failure<SystemLocalizationRuntimeResponse>(errors.Forbidden) : Result.Success(value);
    }
}
public sealed class SystemLocalizationCommandHandler(ISystemLocalizationStore store, ICompanyUiCatalog catalog, SystemLocalizationErrors errors)
    : ICommandHandler<SetSystemTextCommand, Result>, ICommandHandler<ResetSystemTextCommand, Result>
{
    public Task<Result> Handle(SetSystemTextCommand command, CancellationToken token)
    {
        var request = command.Request;
        if (request is null || request.ExpectedRevision < 0 || !ValidKey(request.Source, request.Language, request.Key) ||
            string.IsNullOrWhiteSpace(request.Value) || request.Value.Length > 4000)
            return Task.FromResult(Result.Failure(errors.Invalid));
        var text = CompanyLocalizationValidation.Find(catalog, request.Source, request.Key)!;
        if (text.SystemPermissions is null)
            return Task.FromResult(Result.Failure(errors.Forbidden));
        if (!CompanyLocalizationTextPolicy.HasMatchingPlaceholders(CompanyLocalizationValidation.Shipped(text, request.Language), request.Value))
            return Task.FromResult(Result.Failure(errors.Invalid));
        return store.ApplyAsync(new(CompanyLocalizationChangeKind.SetText, request.Language, request.ExpectedRevision, request.Source, request.Key, request.Value), token);
    }
    public Task<Result> Handle(ResetSystemTextCommand command, CancellationToken token)
    {
        var request = command.Request;
        if (request is null || request.ExpectedRevision < 0 || !ValidKey(request.Source, request.Language, request.Key))
            return Task.FromResult(Result.Failure(errors.Invalid));
        if (CompanyLocalizationValidation.Find(catalog, request.Source, request.Key)!.SystemPermissions is null)
            return Task.FromResult(Result.Failure(errors.Forbidden));
        return store.ApplyAsync(new(CompanyLocalizationChangeKind.ResetText, request.Language, request.ExpectedRevision, request.Source, request.Key), token);
    }
    private bool ValidKey(string source, string language, string key) =>
        CompanyLocalizationValidation.IsIdentifier(source,100) && CompanyLocalizationValidation.IsIdentifier(key,400)
        && CompanyLocalizationValidation.IsLanguage(language) && CompanyLocalizationValidation.Find(catalog, source, key) is not null;
}
