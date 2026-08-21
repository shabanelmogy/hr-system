using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;

public sealed record GetCountriesQuery : IQuery<PageResponse<CountryListItemResponse>>
{
    public const int MaxPageSize = 50;
    public static readonly string[] SearchFields =
    [
        "all",
        "nameAr",
        "nameEn",
        "alpha2Code",
        "alpha3Code",
        "phoneCode",
        "currencyCode"
    ];
    public static readonly string[] SearchOperators =
    [
        "contains",
        "doesNotContain",
        "equals",
        "doesNotEqual",
        "startsWith",
        "endsWith"
    ];

    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public string SearchField { get; init; } = "all";
    public string SearchOperator { get; init; } = "contains";
    public string Status { get; init; } = "active";
    public string? CurrencyCode { get; init; }
    public bool? HasStates { get; init; }
    public string SortBy { get; init; } = "nameEn";
    public string SortDirection { get; init; } = "asc";
}

public sealed class GetCountriesQueryValidator : AbstractValidator<GetCountriesQuery>
{
    private static readonly string[] SortColumns =
    [
        "nameEn",
        "nameAr",
        "alpha2Code",
        "alpha3Code",
        "currencyCode",
        "createdOn"
    ];

    public GetCountriesQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, GetCountriesQuery.MaxPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.SearchField)
            .NotEmpty()
            .Must(field => GetCountriesQuery.SearchFields.Contains(field, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SearchOperator)
            .NotEmpty()
            .Must(@operator => GetCountriesQuery.SearchOperators.Contains(@operator, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.Status)
            .NotEmpty()
            .Must(status => status is not null &&
                new[] { "active", "archived", "all" }
                    .Contains(status, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.CurrencyCode)
            .Length(3)
            .Matches(RegexPattern.CurrencyCode)
            .When(query => !string.IsNullOrWhiteSpace(query.CurrencyCode));
        RuleFor(query => query.SortDirection)
            .Must(direction => direction is null ||
                direction.Equals("ASC", StringComparison.OrdinalIgnoreCase) ||
                direction.Equals("DESC", StringComparison.OrdinalIgnoreCase));
        RuleFor(query => query.SortBy)
            .NotEmpty()
            .Must(column => column is not null &&
                SortColumns.Contains(column, StringComparer.OrdinalIgnoreCase));
    }
}
