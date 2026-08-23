using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using System.Linq.Expressions;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Persistence;

public sealed class CountryReadStore(
    ApplicationDbContext context,
    TypeAdapterConfig mappingConfig) : ICountryReadStore
{
    public async Task<PageResponse<CountryListItemResponse>> GetPageAsync(
        GetCountriesQuery request,
        CancellationToken cancellationToken)
    {
        var query = context.Countries.AsNoTracking();

        query = request.Status.ToUpperInvariant() switch
        {
            "ARCHIVED" => query.Where(country => country.IsDeleted),
            "ALL" => query,
            _ => query.Where(country => !country.IsDeleted)
        };

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = ApplySearch(
                query,
                request.SearchField,
                request.SearchOperator,
                request.Search.Trim().ToUpper());
        }

        if (!string.IsNullOrWhiteSpace(request.CurrencyCode))
        {
            var currencyCode = request.CurrencyCode.Trim().ToUpperInvariant();
            query = query.Where(country => country.CurrencyCode == currencyCode);
        }

        if (request.HasStates.HasValue)
        {
            query = request.HasStates.Value
                ? query.Where(country => country.States.Any(state => !state.IsDeleted))
                : query.Where(country => !country.States.Any(state => !state.IsDeleted));
        }

        query = ApplyOrdering(query, request.SortBy, request.SortDirection);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectToType<CountryListItemResponse>(mappingConfig)
            .ToListAsync(cancellationToken);
        var page = new PagedList<CountryListItemResponse>(
            items,
            totalCount,
            request.PageNumber,
            request.PageSize,
            GetCountriesQuery.MaxPageSize);

        return new PageResponse<CountryListItemResponse>(page, page.MetaData);
    }

    public Task<CountryDetailResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken) =>
        context.Countries.AsNoTracking()
            .Where(country => country.Id == id)
            .ProjectToType<CountryDetailResponse>(mappingConfig)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<CountryResponse?> GetWithStatesByIdAsync(
        int id,
        CancellationToken cancellationToken) =>
        context.Countries.AsNoTracking()
            .Where(country => country.Id == id)
            .ProjectToType<CountryResponse>(mappingConfig)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<SimpleCountryResponse>> GetLookupAsync(
        CancellationToken cancellationToken) =>
        await ActiveCountries()
            .OrderBy(country => country.NameEn)
            .ThenBy(country => country.Id)
            .ProjectToType<SimpleCountryResponse>(mappingConfig)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CountryReportDataResponse>> GetReportDataAsync(
        CancellationToken cancellationToken) =>
        await ActiveCountries()
            .OrderBy(country => country.NameEn)
            .ThenBy(country => country.Id)
            .Select(country => new CountryReportDataResponse(
                country.Id,
                country.NameAr,
                country.NameEn,
                country.Alpha2Code,
                country.Alpha3Code,
                country.PhoneCode,
                country.CurrencyCode,
                true))
            .ToListAsync(cancellationToken);

    private IQueryable<Country> ActiveCountries() =>
        context.Countries.AsNoTracking().Where(country => !country.IsDeleted);

    private static IQueryable<Country> ApplySearch(
        IQueryable<Country> query,
        string? searchField,
        string? searchOperator,
        string search)
    {
        var normalizedField = searchField?.ToUpperInvariant() ?? "ALL";
        var normalizedOperator = searchOperator?.ToUpperInvariant() ?? "CONTAINS";
        string[] propertyNames = normalizedField switch
        {
            "NAMEAR" => [nameof(Country.NameAr)],
            "NAMEEN" => [nameof(Country.NameEn)],
            "ALPHA2CODE" => [nameof(Country.Alpha2Code)],
            "ALPHA3CODE" => [nameof(Country.Alpha3Code)],
            "PHONECODE" => [nameof(Country.PhoneCode)],
            "CURRENCYCODE" => [nameof(Country.CurrencyCode)],
            _ =>
            [
                nameof(Country.NameAr),
                nameof(Country.NameEn),
                nameof(Country.Alpha2Code),
                nameof(Country.Alpha3Code),
                nameof(Country.PhoneCode),
                nameof(Country.CurrencyCode)
            ]
        };
        var country = Expression.Parameter(typeof(Country), "country");
        var conditions = propertyNames
            .Select(propertyName => CreateSearchCondition(
                Expression.Property(country, propertyName),
                normalizedOperator,
                search))
            .ToArray();
        var requiresEveryColumn = normalizedOperator is "DOESNOTCONTAIN" or "DOESNOTEQUAL";
        var predicate = conditions.Aggregate((current, next) =>
            requiresEveryColumn
                ? Expression.AndAlso(current, next)
                : Expression.OrElse(current, next));

        return query.Where(Expression.Lambda<Func<Country, bool>>(predicate, country));
    }

    private static Expression CreateSearchCondition(
        Expression property,
        string searchOperator,
        string search)
    {
        var isNull = Expression.Equal(property, Expression.Constant(null, typeof(string)));
        var hasValue = Expression.Not(isNull);
        var normalizedProperty = Expression.Call(
            property,
            nameof(string.ToUpper),
            Type.EmptyTypes);
        var searchValue = Expression.Constant(search);
        Expression match = searchOperator switch
        {
            "EQUALS" or "DOESNOTEQUAL" => Expression.Equal(normalizedProperty, searchValue),
            "STARTSWITH" => Expression.Call(
                normalizedProperty,
                nameof(string.StartsWith),
                Type.EmptyTypes,
                searchValue),
            "ENDSWITH" => Expression.Call(
                normalizedProperty,
                nameof(string.EndsWith),
                Type.EmptyTypes,
                searchValue),
            _ => Expression.Call(
                normalizedProperty,
                nameof(string.Contains),
                Type.EmptyTypes,
                searchValue)
        };

        return searchOperator is "DOESNOTCONTAIN" or "DOESNOTEQUAL"
            ? Expression.OrElse(isNull, Expression.Not(match))
            : Expression.AndAlso(hasValue, match);
    }

    private static IQueryable<Country> ApplyOrdering(
        IQueryable<Country> query,
        string? sortBy,
        string? sortDirection)
    {
        var descending = string.Equals(sortDirection, "DESC", StringComparison.OrdinalIgnoreCase);
        return (sortBy?.ToUpperInvariant(), descending) switch
        {
            ("NAMEAR", false) => query.OrderBy(country => country.NameAr).ThenBy(country => country.Id),
            ("NAMEAR", true) => query.OrderByDescending(country => country.NameAr).ThenByDescending(country => country.Id),
            ("ALPHA2CODE", false) => query.OrderBy(country => country.Alpha2Code).ThenBy(country => country.Id),
            ("ALPHA2CODE", true) => query.OrderByDescending(country => country.Alpha2Code).ThenByDescending(country => country.Id),
            ("ALPHA3CODE", false) => query.OrderBy(country => country.Alpha3Code).ThenBy(country => country.Id),
            ("ALPHA3CODE", true) => query.OrderByDescending(country => country.Alpha3Code).ThenByDescending(country => country.Id),
            ("CURRENCYCODE", false) => query.OrderBy(country => country.CurrencyCode).ThenBy(country => country.Id),
            ("CURRENCYCODE", true) => query.OrderByDescending(country => country.CurrencyCode).ThenByDescending(country => country.Id),
            ("CREATEDON", false) => query.OrderBy(country => country.CreatedOn).ThenBy(country => country.Id),
            ("CREATEDON", true) => query.OrderByDescending(country => country.CreatedOn).ThenByDescending(country => country.Id),
            ("NAMEEN", true) => query.OrderByDescending(country => country.NameEn).ThenByDescending(country => country.Id),
            _ => query.OrderBy(country => country.NameEn).ThenBy(country => country.Id)
        };
    }
}
