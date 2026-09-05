using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Abstractions;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;

namespace HrManagementSystem.Application.Features.Finance.FiscalYears.Queries.GetFiscalYears;

public sealed record GetFiscalYearsQuery : IQuery<PageResponse<FiscalYearListItemResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public string SearchField { get; init; } = "all";
    public string SearchOperator { get; init; } = "contains";
    public string RecordStatus { get; init; } = "active";
    public string LifecycleStatus { get; init; } = "all";
    public string SortBy { get; init; } = "startDate";
    public string SortDirection { get; init; } = "desc";
}

public sealed class GetFiscalYearsQueryValidator : AbstractValidator<GetFiscalYearsQuery>
{
    private static readonly string[] SearchFields = ["all", "code", "nameAr", "nameEn"];
    private static readonly string[] SearchOperators = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];
    private static readonly string[] RecordStatuses = ["active", "archived", "all"];
    private static readonly string[] LifecycleStatuses = ["all", "draft", "open", "closing", "closed", "locked"];
    private static readonly string[] SortColumns = ["code", "nameAr", "nameEn", "startDate", "endDate", "status", "createdOn"];

    public GetFiscalYearsQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.SearchField).Must(value => SearchFields.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SearchOperator).Must(value => SearchOperators.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.RecordStatus).Must(value => RecordStatuses.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.LifecycleStatus).Must(value => LifecycleStatuses.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortBy).Must(value => SortColumns.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(value => value.Equals("asc", StringComparison.OrdinalIgnoreCase) || value.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}

public sealed class GetFiscalYearsQueryHandler(IFiscalYearReadStore readStore)
    : IQueryHandler<GetFiscalYearsQuery, PageResponse<FiscalYearListItemResponse>>
{
    public Task<PageResponse<FiscalYearListItemResponse>> Handle(GetFiscalYearsQuery request, CancellationToken cancellationToken) =>
        readStore.GetPageAsync(request, cancellationToken);
}
