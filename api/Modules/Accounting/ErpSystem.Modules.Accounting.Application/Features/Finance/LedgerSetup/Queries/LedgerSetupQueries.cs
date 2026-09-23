using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Services;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Queries;

public sealed record GetAccountHierarchyLevelsQuery(string RecordStatus = "active") : IQuery<IReadOnlyList<AccountHierarchyLevelResponse>>;
public sealed class GetAccountHierarchyLevelsQueryValidator : AbstractValidator<GetAccountHierarchyLevelsQuery>
{ public GetAccountHierarchyLevelsQueryValidator() => RuleFor(item => item.RecordStatus).Must(LedgerSetupQuerySupport.ValidRecordStatus); }
public sealed class GetAccountHierarchyLevelsQueryHandler(IAccountHierarchyLevelStore store, ICurrentActor actor) : IQueryHandler<GetAccountHierarchyLevelsQuery, IReadOnlyList<AccountHierarchyLevelResponse>>
{ public Task<IReadOnlyList<AccountHierarchyLevelResponse>> Handle(GetAccountHierarchyLevelsQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<AccountHierarchyLevelResponse>>([]) : store.ListAsync(request.RecordStatus, cancellationToken); }

public sealed record GetAccountsQuery : IQuery<PageResponse<AccountResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
    public string? Search { get; init; }
    public string SearchField { get; init; } = "all";
    public string SearchOperator { get; init; } = "contains";
    public string RecordStatus { get; init; } = "active";
    public string SortBy { get; init; } = "code";
    public string SortDirection { get; init; } = "asc";
}
public sealed class GetAccountsQueryValidator : AbstractValidator<GetAccountsQuery>
{
    private static readonly string[] SearchFields = ["all", "code", "nameAr", "nameEn"];
    private static readonly string[] SearchOperators = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];
    private static readonly string[] RecordStatuses = ["active", "archived", "all"];
    private static readonly string[] SortColumns = ["code", "nameAr", "nameEn", "createdOn"];

    public GetAccountsQueryValidator()
    {
        RuleFor(item => item.PageNumber).GreaterThan(0);
        RuleFor(item => item.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(item => item.Search).MaximumLength(200);
        RuleFor(item => item.SearchField).Must(value => SearchFields.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(item => item.SearchOperator).Must(value => SearchOperators.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(item => item.RecordStatus).Must(value => RecordStatuses.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(item => item.SortBy).Must(value => SortColumns.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(item => item.SortDirection).Must(value => string.Equals(value, "asc", StringComparison.OrdinalIgnoreCase) || string.Equals(value, "desc", StringComparison.OrdinalIgnoreCase));
    }
}
public sealed class GetAccountsQueryHandler(IAccountReadStore store, ICurrentActor actor) : IQueryHandler<GetAccountsQuery, PageResponse<AccountResponse>>
{
    public Task<PageResponse<AccountResponse>> Handle(GetAccountsQuery request, CancellationToken cancellationToken)
    {
        if (actor.TenantId is null || actor.CompanyId is not > 0)
        {
            var empty = new PagedList<AccountResponse>([], 0, request.PageNumber, request.PageSize, PaginationRequest.MaxClientPageSize);
            return Task.FromResult(new PageResponse<AccountResponse>(empty, empty.MetaData));
        }

        return store.ListAsync(
            new AccountListQuery(
                request.PageNumber,
                request.PageSize,
                request.Search,
                request.SearchField,
                request.SearchOperator,
                request.RecordStatus,
                request.SortBy,
                request.SortDirection),
            cancellationToken);
    }
}
public sealed record GetAccountCodeProposalQuery : IQuery<Result<AccountCodeProposalResponse>>;
public sealed class GetAccountCodeProposalQueryHandler(IAccountReadStore store, ICurrentActor actor, LedgerSetupErrors errors)
    : IQueryHandler<GetAccountCodeProposalQuery, Result<AccountCodeProposalResponse>>
{
    public async Task<Result<AccountCodeProposalResponse>> Handle(GetAccountCodeProposalQuery request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out _, out _))
            return Result.Failure<AccountCodeProposalResponse>(errors.ScopeRequired);
        return Result.Success(await store.GetCodeProposalAsync(cancellationToken));
    }
}
public sealed record GetAccountByIdQuery(int Id) : IQuery<Result<AccountResponse>>;
public sealed class GetAccountByIdQueryHandler(IAccountReadStore store, LedgerSetupErrors errors, ICurrentActor actor) : IQueryHandler<GetAccountByIdQuery, Result<AccountResponse>>
{ public async Task<Result<AccountResponse>> Handle(GetAccountByIdQuery request, CancellationToken cancellationToken) { if (actor.TenantId is null || actor.CompanyId is not > 0) return Result.Failure<AccountResponse>(errors.ScopeRequired); var value = await store.GetByIdAsync(request.Id, cancellationToken); return value is null ? Result.Failure<AccountResponse>(errors.NotFound("Account")) : Result.Success(value); } }
public sealed record GetAccountLookupQuery : IQuery<IReadOnlyList<AccountLookupResponse>>;
public sealed class GetAccountLookupQueryHandler(IAccountReadStore store, ICurrentActor actor) : IQueryHandler<GetAccountLookupQuery, IReadOnlyList<AccountLookupResponse>>
{ public Task<IReadOnlyList<AccountLookupResponse>> Handle(GetAccountLookupQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<AccountLookupResponse>>([]) : store.LookupAsync(cancellationToken); }
public sealed record GetAccountTreeQuery : IQuery<IReadOnlyList<AccountTreeNodeResponse>>;
public sealed class GetAccountTreeQueryHandler(IAccountReadStore store, ICurrentActor actor) : IQueryHandler<GetAccountTreeQuery, IReadOnlyList<AccountTreeNodeResponse>>
{ public Task<IReadOnlyList<AccountTreeNodeResponse>> Handle(GetAccountTreeQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<AccountTreeNodeResponse>>([]) : store.TreeAsync(cancellationToken); }

public sealed record GetDimensionDefinitionsQuery(int PageNumber = 1, int PageSize = 50, string? Search = null, string RecordStatus = "active") : IQuery<IReadOnlyList<DimensionDefinitionResponse>>;
public sealed class GetDimensionDefinitionsQueryValidator : AbstractValidator<GetDimensionDefinitionsQuery>
{
    public GetDimensionDefinitionsQueryValidator()
    {
        RuleFor(item => item.PageNumber).GreaterThan(0);
        RuleFor(item => item.PageSize).InclusiveBetween(1, 500);
        RuleFor(item => item.RecordStatus).Must(LedgerSetupQuerySupport.ValidRecordStatus);
    }
}
public sealed class GetDimensionDefinitionsQueryHandler(IDimensionReadStore store, ICurrentActor actor) : IQueryHandler<GetDimensionDefinitionsQuery, IReadOnlyList<DimensionDefinitionResponse>>
{ public Task<IReadOnlyList<DimensionDefinitionResponse>> Handle(GetDimensionDefinitionsQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<DimensionDefinitionResponse>>([]) : store.DefinitionsAsync(new DimensionListQuery(request.PageNumber, request.PageSize, request.Search, request.RecordStatus), cancellationToken); }
public sealed record GetDimensionValuesQuery(int DefinitionId, string RecordStatus = "active", int PageNumber = 1, int PageSize = 100) : IQuery<IReadOnlyList<DimensionValueResponse>>;
public sealed class GetDimensionValuesQueryValidator : AbstractValidator<GetDimensionValuesQuery>
{
    public GetDimensionValuesQueryValidator()
    {
        RuleFor(item => item.DefinitionId).GreaterThan(0);
        RuleFor(item => item.RecordStatus).Must(LedgerSetupQuerySupport.ValidRecordStatus);
        RuleFor(item => item.PageNumber).GreaterThan(0);
        RuleFor(item => item.PageSize).InclusiveBetween(1, 500);
    }
}
public sealed class GetDimensionValuesQueryHandler(IDimensionReadStore store, ICurrentActor actor) : IQueryHandler<GetDimensionValuesQuery, IReadOnlyList<DimensionValueResponse>>
{ public Task<IReadOnlyList<DimensionValueResponse>> Handle(GetDimensionValuesQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<DimensionValueResponse>>([]) : store.ValuesAsync(request.DefinitionId, request.RecordStatus, request.PageNumber, request.PageSize, cancellationToken); }
public sealed record GetAccountDimensionPoliciesQuery(int AccountId) : IQuery<IReadOnlyList<AccountDimensionPolicyResponse>>;
public sealed class GetAccountDimensionPoliciesQueryHandler(IDimensionReadStore store, ICurrentActor actor) : IQueryHandler<GetAccountDimensionPoliciesQuery, IReadOnlyList<AccountDimensionPolicyResponse>>
{ public Task<IReadOnlyList<AccountDimensionPolicyResponse>> Handle(GetAccountDimensionPoliciesQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<AccountDimensionPolicyResponse>>([]) : store.PoliciesAsync(request.AccountId, cancellationToken); }

public sealed record GetBooksQuery(string RecordStatus = "active") : IQuery<IReadOnlyList<BookResponse>>;
public sealed class GetBooksQueryValidator : AbstractValidator<GetBooksQuery>
{ public GetBooksQueryValidator() => RuleFor(item => item.RecordStatus).Must(LedgerSetupQuerySupport.ValidRecordStatus); }
public sealed class GetBooksQueryHandler(IBookReadStore store, ICurrentActor actor) : IQueryHandler<GetBooksQuery, IReadOnlyList<BookResponse>>
{ public Task<IReadOnlyList<BookResponse>> Handle(GetBooksQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<BookResponse>>([]) : store.ListAsync(request.RecordStatus, cancellationToken); }
public sealed record GetBookByIdQuery(int Id) : IQuery<Result<BookResponse>>;
public sealed class GetBookByIdQueryHandler(IBookReadStore store, ICurrentActor actor, LedgerSetupErrors errors) : IQueryHandler<GetBookByIdQuery, Result<BookResponse>>
{ public async Task<Result<BookResponse>> Handle(GetBookByIdQuery request, CancellationToken cancellationToken) { if (actor.TenantId is null || actor.CompanyId is not > 0) return Result.Failure<BookResponse>(errors.ScopeRequired); var value = await store.GetByIdAsync(request.Id, cancellationToken); return value is null ? Result.Failure<BookResponse>(errors.NotFound("Book")) : Result.Success(value); } }
public sealed record GetJournalDefinitionsQuery(int? BookId = null, string RecordStatus = "active", int PageNumber = 1, int PageSize = 100) : IQuery<IReadOnlyList<JournalDefinitionResponse>>;
public sealed class GetJournalDefinitionsQueryValidator : AbstractValidator<GetJournalDefinitionsQuery>
{
    public GetJournalDefinitionsQueryValidator()
    {
        RuleFor(item => item.BookId).GreaterThan(0).When(item => item.BookId.HasValue);
        RuleFor(item => item.RecordStatus).Must(LedgerSetupQuerySupport.ValidRecordStatus);
        RuleFor(item => item.PageNumber).GreaterThan(0);
        RuleFor(item => item.PageSize).InclusiveBetween(1, 500);
    }
}
public sealed class GetJournalDefinitionsQueryHandler(IJournalDefinitionReadStore store, ICurrentActor actor) : IQueryHandler<GetJournalDefinitionsQuery, IReadOnlyList<JournalDefinitionResponse>>
{ public Task<IReadOnlyList<JournalDefinitionResponse>> Handle(GetJournalDefinitionsQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<JournalDefinitionResponse>>([]) : store.ListAsync(request.BookId, request.RecordStatus, request.PageNumber, request.PageSize, cancellationToken); }

public sealed record GetExchangeRateTypesQuery(string RecordStatus = "active") : IQuery<IReadOnlyList<ExchangeRateTypeResponse>>;
public sealed class GetExchangeRateTypesQueryValidator : AbstractValidator<GetExchangeRateTypesQuery>
{ public GetExchangeRateTypesQueryValidator() => RuleFor(item => item.RecordStatus).Must(LedgerSetupQuerySupport.ValidRecordStatus); }
public sealed class GetExchangeRateTypesQueryHandler(IExchangeRateTypeStore store, ICurrentActor actor) : IQueryHandler<GetExchangeRateTypesQuery, IReadOnlyList<ExchangeRateTypeResponse>>
{ public Task<IReadOnlyList<ExchangeRateTypeResponse>> Handle(GetExchangeRateTypesQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<ExchangeRateTypeResponse>>([]) : store.ListAsync(request.RecordStatus, cancellationToken); }
public sealed record GetExchangeRatesQuery(int? RateTypeId = null, int? FromCurrencyId = null, int? ToCurrencyId = null, int PageNumber = 1, int PageSize = 100) : IQuery<IReadOnlyList<ExchangeRateResponse>>;
public sealed class GetExchangeRatesQueryValidator : AbstractValidator<GetExchangeRatesQuery>
{ public GetExchangeRatesQueryValidator() { RuleFor(item => item.RateTypeId).GreaterThan(0).When(item => item.RateTypeId.HasValue); RuleFor(item => item.FromCurrencyId).GreaterThan(0).When(item => item.FromCurrencyId.HasValue); RuleFor(item => item.ToCurrencyId).GreaterThan(0).When(item => item.ToCurrencyId.HasValue); RuleFor(item => item.PageNumber).GreaterThan(0); RuleFor(item => item.PageSize).InclusiveBetween(1, 500); } }
public sealed class GetExchangeRatesQueryHandler(IExchangeRateStore store, ICurrentActor actor) : IQueryHandler<GetExchangeRatesQuery, IReadOnlyList<ExchangeRateResponse>>
{ public Task<IReadOnlyList<ExchangeRateResponse>> Handle(GetExchangeRatesQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<ExchangeRateResponse>>([]) : store.ListAsync(request.RateTypeId, request.FromCurrencyId, request.ToCurrencyId, request.PageNumber, request.PageSize, cancellationToken); }

public sealed record GetAccountMappingsQuery(string? PurposeCode = null, int PageNumber = 1, int PageSize = 100) : IQuery<IReadOnlyList<AccountMappingResponse>>;
public sealed class GetAccountMappingsQueryValidator : AbstractValidator<GetAccountMappingsQuery>
{ public GetAccountMappingsQueryValidator() { RuleFor(item => item.PurposeCode).MaximumLength(100); RuleFor(item => item.PageNumber).GreaterThan(0); RuleFor(item => item.PageSize).InclusiveBetween(1, 500); } }
public sealed class GetAccountMappingsQueryHandler(IAccountMappingStore store, ICurrentActor actor) : IQueryHandler<GetAccountMappingsQuery, IReadOnlyList<AccountMappingResponse>>
{ public Task<IReadOnlyList<AccountMappingResponse>> Handle(GetAccountMappingsQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<AccountMappingResponse>>([]) : store.ListAsync(request.PurposeCode, request.PageNumber, request.PageSize, cancellationToken); }
public sealed record GetPostingProfilesQuery(string? PurposeCode = null, int PageNumber = 1, int PageSize = 100) : IQuery<IReadOnlyList<PostingProfileResponse>>;
public sealed class GetPostingProfilesQueryValidator : AbstractValidator<GetPostingProfilesQuery>
{ public GetPostingProfilesQueryValidator() { RuleFor(item => item.PurposeCode).MaximumLength(100); RuleFor(item => item.PageNumber).GreaterThan(0); RuleFor(item => item.PageSize).InclusiveBetween(1, 500); } }
public sealed class GetPostingProfilesQueryHandler(IPostingProfileStore store, ICurrentActor actor) : IQueryHandler<GetPostingProfilesQuery, IReadOnlyList<PostingProfileResponse>>
{ public Task<IReadOnlyList<PostingProfileResponse>> Handle(GetPostingProfilesQuery request, CancellationToken cancellationToken) => actor.TenantId is null || actor.CompanyId is not > 0 ? Task.FromResult<IReadOnlyList<PostingProfileResponse>>([]) : store.ListAsync(request.PurposeCode, request.PageNumber, request.PageSize, cancellationToken); }
public sealed record ResolveAccountPreviewQuery(ResolveAccountPreviewRequest Request) : IQuery<Result<ResolveAccountPreviewResponse>>;
public sealed class ResolveAccountPreviewQueryValidator : AbstractValidator<ResolveAccountPreviewQuery>
{
    public ResolveAccountPreviewQueryValidator()
    {
        RuleFor(item => item.Request.BookId).GreaterThan(0);
        RuleFor(item => item.Request.PurposeCode).NotEmpty().MaximumLength(100);
    }
}
public sealed class ResolveAccountPreviewQueryHandler(IPostingProfileStore store, ICurrentActor actor, LedgerSetupErrors errors) : IQueryHandler<ResolveAccountPreviewQuery, Result<ResolveAccountPreviewResponse>>
{
    public async Task<Result<ResolveAccountPreviewResponse>> Handle(ResolveAccountPreviewQuery request, CancellationToken cancellationToken)
    {
        if (actor.TenantId is null || actor.CompanyId is not > 0) return Result.Failure<ResolveAccountPreviewResponse>(errors.ScopeRequired);
        var candidates = await store.CandidatesAsync(request.Request.BookId, request.Request.PurposeCode, request.Request.OnDate, request.Request.ContextReferenceId, cancellationToken);
        var result = AccountDeterminationResolver.Resolve(candidates);
        var response = new ResolveAccountPreviewResponse(result.Status, result.AccountId, result.MatchedCandidates.Select(item => new AccountResolutionCandidateResponse(item.RuleId, item.RuleType, item.AccountId, item.Specificity, item.Priority)).ToArray());
        return Result.Success(response);
    }
}

internal static class LedgerSetupQuerySupport
{
    public static bool ValidRecordStatus(string? value) =>
        string.Equals(value, "active", StringComparison.OrdinalIgnoreCase)
        || string.Equals(value, "archived", StringComparison.OrdinalIgnoreCase)
        || string.Equals(value, "all", StringComparison.OrdinalIgnoreCase);
}
