using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Errors;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Queries;

public sealed record GetCurrenciesQuery : IQuery<PageResponse<CurrencyResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public string SearchField { get; init; } = "all";
    public string SearchOperator { get; init; } = "contains";
    public string RecordStatus { get; init; } = "active";
    public string SortBy { get; init; } = "currencyCode";
    public string SortDirection { get; init; } = "asc";
}

public sealed class GetCurrenciesQueryValidator : AbstractValidator<GetCurrenciesQuery>
{
    private static readonly string[] SearchFields = ["all", "currencyCode", "nameAr", "nameEn", "symbol"];
    private static readonly string[] SearchOperators = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];
    private static readonly string[] RecordStatuses = ["active", "archived", "all"];
    private static readonly string[] SortColumns = ["currencyCode", "nameAr", "nameEn", "symbol", "createdOn"];

    public GetCurrenciesQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.SearchField).Must(value => SearchFields.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SearchOperator).Must(value => SearchOperators.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.RecordStatus).Must(value => RecordStatuses.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortBy).Must(value => SortColumns.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(value =>
            value.Equals("asc", StringComparison.OrdinalIgnoreCase) ||
            value.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}

public sealed class GetCurrenciesQueryHandler(ICurrencyReadStore readStore)
    : IQueryHandler<GetCurrenciesQuery, PageResponse<CurrencyResponse>>
{
    public Task<PageResponse<CurrencyResponse>> Handle(GetCurrenciesQuery request, CancellationToken cancellationToken) =>
        readStore.GetPageAsync(request, cancellationToken);
}

public sealed record GetCurrencyByIdQuery(int Id) : IQuery<Result<CurrencyResponse>>;

public sealed class GetCurrencyByIdQueryValidator : AbstractValidator<GetCurrencyByIdQuery>
{
    public GetCurrencyByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetCurrencyByIdQueryHandler(ICurrencyReadStore readStore, CurrencyErrors errors)
    : IQueryHandler<GetCurrencyByIdQuery, Result<CurrencyResponse>>
{
    public async Task<Result<CurrencyResponse>> Handle(GetCurrencyByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetByIdAsync(request.Id, cancellationToken);
        return response is null ? Result.Failure<CurrencyResponse>(errors.NotFound) : Result.Success(response);
    }
}

public sealed record GetCurrencyLookupQuery : IQuery<IReadOnlyList<CurrencyLookupResponse>>;

public sealed class GetCurrencyLookupQueryHandler(ICurrencyReadStore readStore)
    : IQueryHandler<GetCurrencyLookupQuery, IReadOnlyList<CurrencyLookupResponse>>
{
    public Task<IReadOnlyList<CurrencyLookupResponse>> Handle(GetCurrencyLookupQuery request, CancellationToken cancellationToken) =>
        readStore.GetLookupAsync(cancellationToken);
}
