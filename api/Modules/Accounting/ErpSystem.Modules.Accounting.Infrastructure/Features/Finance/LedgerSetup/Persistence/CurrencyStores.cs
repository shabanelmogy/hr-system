using System.Linq.Expressions;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Queries;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

namespace ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Persistence;

public sealed class CurrencyReadStore(AccountingDbContext context) : ICurrencyReadStore
{
    public async Task<PageResponse<CurrencyResponse>> GetPageAsync(GetCurrenciesQuery criteria, CancellationToken cancellationToken)
    {
        var query = context.Currencies.AsNoTracking();
        query = criteria.RecordStatus.ToUpperInvariant() switch
        {
            "ARCHIVED" => query.Where(item => item.IsDeleted),
            "ALL" => query,
            _ => query.Where(item => !item.IsDeleted)
        };

        if (!string.IsNullOrWhiteSpace(criteria.Search))
            query = ApplySearch(query, criteria.SearchField, criteria.SearchOperator, criteria.Search.Trim().ToUpperInvariant());

        query = ApplyOrdering(query, criteria.SortBy, criteria.SortDirection);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((criteria.PageNumber - 1) * criteria.PageSize)
            .Take(criteria.PageSize)
            .Select(item => new CurrencyResponse(
                item.Id,
                item.CurrencyCode,
                item.NameEn,
                item.NameAr,
                item.Symbol,
                item.CreatedOn,
                item.UpdatedOn,
                item.IsDeleted,
                Convert.ToBase64String(item.RowVersion)))
            .ToListAsync(cancellationToken);
        var page = new PagedList<CurrencyResponse>(items, totalCount, criteria.PageNumber, criteria.PageSize, PaginationRequest.MaxClientPageSize);
        return new PageResponse<CurrencyResponse>(page, page.MetaData);
    }

    public async Task<CurrencyResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        await context.Currencies.AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new CurrencyResponse(
                item.Id,
                item.CurrencyCode,
                item.NameEn,
                item.NameAr,
                item.Symbol,
                item.CreatedOn,
                item.UpdatedOn,
                item.IsDeleted,
                Convert.ToBase64String(item.RowVersion)))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<CurrencyLookupResponse>> GetLookupAsync(CancellationToken cancellationToken) =>
        await context.Currencies.AsNoTracking()
            .Where(item => !item.IsDeleted)
            .OrderBy(item => item.CurrencyCode)
            .ThenBy(item => item.Id)
            .Select(item => new CurrencyLookupResponse(item.Id, item.CurrencyCode, item.NameEn, item.NameAr, item.Symbol))
            .ToListAsync(cancellationToken);

    private static IQueryable<Currency> ApplyOrdering(IQueryable<Currency> query, string sortBy, string sortDirection)
    {
        var descending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
        return (sortBy.ToUpperInvariant(), descending) switch
        {
            ("CURRENCYCODE", true) => query.OrderByDescending(item => item.CurrencyCode).ThenByDescending(item => item.Id),
            ("NAMEAR", false) => query.OrderBy(item => item.NameAr).ThenBy(item => item.Id),
            ("NAMEAR", true) => query.OrderByDescending(item => item.NameAr).ThenByDescending(item => item.Id),
            ("NAMEEN", false) => query.OrderBy(item => item.NameEn).ThenBy(item => item.Id),
            ("NAMEEN", true) => query.OrderByDescending(item => item.NameEn).ThenByDescending(item => item.Id),
            ("SYMBOL", false) => query.OrderBy(item => item.Symbol).ThenBy(item => item.Id),
            ("SYMBOL", true) => query.OrderByDescending(item => item.Symbol).ThenByDescending(item => item.Id),
            ("CREATEDON", false) => query.OrderBy(item => item.CreatedOn).ThenBy(item => item.Id),
            ("CREATEDON", true) => query.OrderByDescending(item => item.CreatedOn).ThenByDescending(item => item.Id),
            _ => query.OrderBy(item => item.CurrencyCode).ThenBy(item => item.Id)
        };
    }

    private static IQueryable<Currency> ApplySearch(
        IQueryable<Currency> query,
        string field,
        string searchOperator,
        string search)
    {
        var parameter = Expression.Parameter(typeof(Currency), "currency");
        string[] propertyNames = field.ToUpperInvariant() switch
        {
            "CURRENCYCODE" => [nameof(Currency.CurrencyCode)],
            "NAMEAR" => [nameof(Currency.NameAr)],
            "NAMEEN" => [nameof(Currency.NameEn)],
            "SYMBOL" => [nameof(Currency.Symbol)],
            _ => [nameof(Currency.CurrencyCode), nameof(Currency.NameAr), nameof(Currency.NameEn), nameof(Currency.Symbol)]
        };
        var operation = searchOperator.ToUpperInvariant();
        var negative = operation is "DOESNOTCONTAIN" or "DOESNOTEQUAL";
        Expression? predicate = null;
        foreach (var propertyName in propertyNames)
        {
            var property = Expression.Property(parameter, propertyName);
            var normalized = Expression.Call(property, nameof(string.ToUpper), Type.EmptyTypes);
            var target = Expression.Constant(search);
            Expression comparison = operation switch
            {
                "EQUALS" or "DOESNOTEQUAL" => Expression.Equal(normalized, target),
                "STARTSWITH" => Expression.Call(normalized, nameof(string.StartsWith), Type.EmptyTypes, target),
                "ENDSWITH" => Expression.Call(normalized, nameof(string.EndsWith), Type.EmptyTypes, target),
                _ => Expression.Call(normalized, nameof(string.Contains), Type.EmptyTypes, target)
            };
            if (negative) comparison = Expression.Not(comparison);
            predicate = predicate is null
                ? comparison
                : negative ? Expression.AndAlso(predicate, comparison) : Expression.OrElse(predicate, comparison);
        }
        return query.Where(Expression.Lambda<Func<Currency, bool>>(predicate!, parameter));
    }
}

public sealed class CurrencyWriteStore(AccountingDbContext context) : ICurrencyWriteStore
{
    public void Add(Currency currency) => context.Currencies.Add(currency);

    public Task<Currency?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.Currencies.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

    public Task<bool> CodeExistsAsync(string currencyCode, int? excludedId, CancellationToken cancellationToken) =>
        context.Currencies.AnyAsync(item =>
            (!excludedId.HasValue || item.Id != excludedId.Value) &&
            item.CurrencyCode == currencyCode,
            cancellationToken);

    public async Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken) =>
        await context.AccountingCompanySettings.AnyAsync(item => item.FunctionalCurrencyId == id, cancellationToken) ||
        await context.Accounts.AnyAsync(item => item.SpecificCurrencyId == id, cancellationToken) ||
        await context.ExchangeRates.AnyAsync(
            item => item.FromCurrencyId == id || item.ToCurrencyId == id,
            cancellationToken);

    public void ApplyOriginalRowVersion(Currency currency, byte[] rowVersion) =>
        context.Entry(currency).Property(item => item.RowVersion).OriginalValue = rowVersion;
}
