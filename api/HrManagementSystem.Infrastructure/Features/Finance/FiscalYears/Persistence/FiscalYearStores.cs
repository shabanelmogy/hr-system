using System.Linq.Expressions;
using System.Text.Json;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Abstractions;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Mapping;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Queries.GetFiscalYears;
using HrManagementSystem.Domain.Finance.FiscalYears.Entities;
using HrManagementSystem.Domain.Finance.FiscalYears.Enums;
using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;

namespace HrManagementSystem.Infrastructure.Features.Finance.FiscalYears.Persistence;

public sealed class FiscalYearReadStore(ApplicationDbContext context) : IFiscalYearReadStore
{
    public async Task<PageResponse<FiscalYearListItemResponse>> GetPageAsync(GetFiscalYearsQuery request, CancellationToken cancellationToken)
    {
        var query = context.FiscalYears.AsNoTracking();
        query = request.RecordStatus.ToUpperInvariant() switch
        {
            "ARCHIVED" => query.Where(item => item.IsDeleted),
            "ALL" => query,
            _ => query.Where(item => !item.IsDeleted)
        };

        if (!request.LifecycleStatus.Equals("all", StringComparison.OrdinalIgnoreCase) &&
            Enum.TryParse<FiscalYearStatus>(request.LifecycleStatus, true, out var lifecycleStatus))
        {
            query = query.Where(item => item.Status == lifecycleStatus);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = ApplySearch(query, request.SearchField, request.SearchOperator, request.Search.Trim().ToUpperInvariant());

        query = ApplyOrdering(query, request.SortBy, request.SortDirection);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(item => new FiscalYearListItemResponse(
                item.Id,
                item.Code,
                item.NameAr,
                item.NameEn,
                item.StartDate,
                item.EndDate,
                item.PeriodFrequency,
                item.Status,
                item.Periods.Count,
                item.CreatedOn,
                item.UpdatedOn,
                item.IsDeleted,
                Convert.ToBase64String(item.RowVersion)))
            .ToListAsync(cancellationToken);
        var page = new PagedList<FiscalYearListItemResponse>(items, totalCount, request.PageNumber, request.PageSize, PaginationRequest.MaxClientPageSize);
        return new PageResponse<FiscalYearListItemResponse>(page, page.MetaData);
    }

    public async Task<FiscalYearDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var fiscalYear = await context.FiscalYears.AsNoTracking()
            .Include(item => item.Periods)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        return fiscalYear is null ? null : FiscalYearResponseMapper.ToDetail(fiscalYear);
    }

    public async Task<IReadOnlyList<FiscalYearLookupResponse>> GetLookupAsync(CancellationToken cancellationToken) =>
        await context.FiscalYears.AsNoTracking()
            .Where(item => !item.IsDeleted && item.Status != FiscalYearStatus.Locked)
            .OrderByDescending(item => item.StartDate)
            .ThenByDescending(item => item.Id)
            .Select(item => new FiscalYearLookupResponse(item.Id, item.Code, item.NameAr, item.NameEn, item.StartDate, item.EndDate, item.Status))
            .ToListAsync(cancellationToken);

    private static IQueryable<FiscalYear> ApplySearch(IQueryable<FiscalYear> query, string field, string searchOperator, string search)
    {
        var parameter = Expression.Parameter(typeof(FiscalYear), "fiscalYear");
        var names = field.ToUpperInvariant() switch
        {
            "CODE" => new[] { nameof(FiscalYear.Code) },
            "NAMEAR" => new[] { nameof(FiscalYear.NameAr) },
            "NAMEEN" => new[] { nameof(FiscalYear.NameEn) },
            _ => new[] { nameof(FiscalYear.Code), nameof(FiscalYear.NameAr), nameof(FiscalYear.NameEn) }
        };
        var operation = searchOperator.ToUpperInvariant();
        var conditions = names.Select(name => SearchCondition(Expression.Property(parameter, name), operation, search)).ToArray();
        var every = operation is "DOESNOTCONTAIN" or "DOESNOTEQUAL";
        var predicate = conditions.Aggregate((left, right) => every ? Expression.AndAlso(left, right) : Expression.OrElse(left, right));
        return query.Where(Expression.Lambda<Func<FiscalYear, bool>>(predicate, parameter));
    }

    private static Expression SearchCondition(Expression property, string operation, string value)
    {
        var normalized = Expression.Call(property, nameof(string.ToUpper), Type.EmptyTypes);
        var target = Expression.Constant(value);
        Expression match = operation switch
        {
            "EQUALS" or "DOESNOTEQUAL" => Expression.Equal(normalized, target),
            "STARTSWITH" => Expression.Call(normalized, nameof(string.StartsWith), Type.EmptyTypes, target),
            "ENDSWITH" => Expression.Call(normalized, nameof(string.EndsWith), Type.EmptyTypes, target),
            _ => Expression.Call(normalized, nameof(string.Contains), Type.EmptyTypes, target)
        };
        return operation is "DOESNOTCONTAIN" or "DOESNOTEQUAL" ? Expression.Not(match) : match;
    }

    private static IQueryable<FiscalYear> ApplyOrdering(IQueryable<FiscalYear> query, string sortBy, string sortDirection)
    {
        var descending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
        return (sortBy.ToUpperInvariant(), descending) switch
        {
            ("CODE", false) => query.OrderBy(item => item.Code).ThenBy(item => item.Id),
            ("CODE", true) => query.OrderByDescending(item => item.Code).ThenByDescending(item => item.Id),
            ("NAMEAR", false) => query.OrderBy(item => item.NameAr).ThenBy(item => item.Id),
            ("NAMEAR", true) => query.OrderByDescending(item => item.NameAr).ThenByDescending(item => item.Id),
            ("NAMEEN", false) => query.OrderBy(item => item.NameEn).ThenBy(item => item.Id),
            ("NAMEEN", true) => query.OrderByDescending(item => item.NameEn).ThenByDescending(item => item.Id),
            ("ENDDATE", false) => query.OrderBy(item => item.EndDate).ThenBy(item => item.Id),
            ("ENDDATE", true) => query.OrderByDescending(item => item.EndDate).ThenByDescending(item => item.Id),
            ("STATUS", false) => query.OrderBy(item => item.Status).ThenBy(item => item.Id),
            ("STATUS", true) => query.OrderByDescending(item => item.Status).ThenByDescending(item => item.Id),
            ("CREATEDON", false) => query.OrderBy(item => item.CreatedOn).ThenBy(item => item.Id),
            ("CREATEDON", true) => query.OrderByDescending(item => item.CreatedOn).ThenByDescending(item => item.Id),
            ("STARTDATE", false) => query.OrderBy(item => item.StartDate).ThenBy(item => item.Id),
            _ => query.OrderByDescending(item => item.StartDate).ThenByDescending(item => item.Id)
        };
    }
}

public sealed class FiscalYearWriteStore(ApplicationDbContext context) : IFiscalYearWriteStore
{
    public void Add(FiscalYear fiscalYear) => context.FiscalYears.Add(fiscalYear);

    public Task<FiscalYear?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.FiscalYears.Include(item => item.Periods).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

    public Task<bool> CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken) =>
        context.FiscalYears.AnyAsync(item =>
            (!excludedId.HasValue || item.Id != excludedId.Value) && item.Code == code,
            cancellationToken);

    public Task<bool> OverlapExistsAsync(DateOnly startDate, DateOnly endDate, int? excludedId, CancellationToken cancellationToken) =>
        context.FiscalYears.AnyAsync(item =>
            !item.IsDeleted &&
            (!excludedId.HasValue || item.Id != excludedId.Value) &&
            item.StartDate <= endDate && startDate <= item.EndDate,
            cancellationToken);

    public void RemovePeriods(IReadOnlyCollection<FiscalPeriod> periods) => context.FiscalPeriods.RemoveRange(periods);

    public void ApplyOriginalRowVersion(FiscalYear fiscalYear, byte[] rowVersion) =>
        context.Entry(fiscalYear).Property(item => item.RowVersion).OriginalValue = rowVersion;
}

public sealed class FiscalYearAuditTrail(ApplicationDbContext context, ICurrentActor actor, TimeProvider timeProvider) : IFiscalYearAuditTrail
{
    public void RecordUpdate(FiscalYear existingFiscalYear, FiscalYear updatedFiscalYear)
    {
        var oldValues = Values(existingFiscalYear);
        var newValues = Values(updatedFiscalYear);
        var keys = oldValues.Keys.Where(key => !Equals(oldValues[key], newValues[key])).ToArray();
        if (keys.Length == 0) return;
        Add(existingFiscalYear.Id, keys.ToDictionary(key => key, key => oldValues[key]), keys.ToDictionary(key => key, key => newValues[key]));
    }

    public void RecordLifecycle(FiscalYear fiscalYear, string oldStatus, string newStatus) =>
        Add(fiscalYear.Id, new Dictionary<string, string?> { [nameof(FiscalYear.Status)] = oldStatus }, new Dictionary<string, string?> { [nameof(FiscalYear.Status)] = newStatus });

    private void Add(int id, IReadOnlyDictionary<string, string?> oldValues, IReadOnlyDictionary<string, string?> newValues) =>
        context.EntityChangeLogs.Add(new EntityChangeLog
        {
            EntityId = id,
            EntityName = nameof(FiscalYear),
            JsonOldValues = JsonSerializer.Serialize(oldValues),
            JsonNewValues = JsonSerializer.Serialize(newValues),
            ChangedById = actor.UserId ?? throw new InvalidOperationException("An authenticated actor is required to change a fiscal year."),
            ChangedAt = timeProvider.GetUtcNow().UtcDateTime,
            ChangedByPc = Environment.MachineName
        });

    private static Dictionary<string, string?> Values(FiscalYear item) => new(StringComparer.Ordinal)
    {
        [nameof(FiscalYear.Code)] = item.Code,
        [nameof(FiscalYear.NameAr)] = item.NameAr,
        [nameof(FiscalYear.NameEn)] = item.NameEn,
        [nameof(FiscalYear.StartDate)] = item.StartDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        [nameof(FiscalYear.EndDate)] = item.EndDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        [nameof(FiscalYear.PeriodFrequency)] = item.PeriodFrequency.ToString()
    };
}
