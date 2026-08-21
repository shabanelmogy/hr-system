using System.Linq.Expressions;
using System.Text.Json;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Queries;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.States.Persistence;

public sealed class StateReadStore(ApplicationDbContext context, TypeAdapterConfig mappingConfig) : IStateReadStore
{
    public async Task<PageResponse<StateListItemResponse>> GetPageAsync(GetStatesQuery request, CancellationToken cancellationToken)
    {
        var query = context.States.AsNoTracking();
        query = request.Status.ToUpperInvariant() switch
        {
            "ARCHIVED" => query.Where(state => state.IsDeleted),
            "ALL" => query,
            _ => query.Where(state => !state.IsDeleted)
        };

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = ApplySearch(query, request.SearchField, request.SearchOperator, request.Search.Trim().ToUpperInvariant());
        if (request.CountryId.HasValue)
            query = query.Where(state => state.CountryId == request.CountryId.Value);
        if (request.HasDistricts.HasValue)
            query = request.HasDistricts.Value
                ? query.Where(state => state.Districts.Any(district => !district.IsDeleted))
                : query.Where(state => !state.Districts.Any(district => !district.IsDeleted));

        query = ApplyOrdering(query, request.SortBy, request.SortDirection);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectToType<StateListItemResponse>(mappingConfig)
            .ToListAsync(cancellationToken);
        var page = new PagedList<StateListItemResponse>(items, totalCount, request.PageNumber, request.PageSize);
        return new PageResponse<StateListItemResponse>(page, page.MetaData);
    }

    public Task<StateDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        context.States.AsNoTracking().Where(state => state.Id == id)
            .ProjectToType<StateDetailResponse>(mappingConfig).FirstOrDefaultAsync(cancellationToken);

    public Task<StateWithDistrictsResponse?> GetWithDistrictsByIdAsync(int id, CancellationToken cancellationToken) =>
        context.States.AsNoTracking().Where(state => state.Id == id)
            .ProjectToType<StateWithDistrictsResponse>(mappingConfig).FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<StateLookupResponse>> GetLookupAsync(int? countryId, CancellationToken cancellationToken)
    {
        var query = context.States.AsNoTracking().Where(state => !state.IsDeleted && !state.Country!.IsDeleted);
        if (countryId.HasValue)
            query = query.Where(state => state.CountryId == countryId.Value);
        return await query.OrderBy(state => state.NameEn).ThenBy(state => state.Id)
            .ProjectToType<StateLookupResponse>(mappingConfig).ToListAsync(cancellationToken);
    }

    private static IQueryable<State> ApplySearch(IQueryable<State> query, string? searchField, string? searchOperator, string search)
    {
        var field = searchField?.ToUpperInvariant() ?? "ALL";
        var @operator = searchOperator?.ToUpperInvariant() ?? "CONTAINS";
        var state = Expression.Parameter(typeof(State), "state");
        var country = Expression.Property(state, nameof(State.Country));
        Expression[] conditions = field switch
        {
            "NAMEAR" => [CreateSearchCondition(Expression.Property(state, nameof(State.NameAr)), @operator, search)],
            "NAMEEN" => [CreateSearchCondition(Expression.Property(state, nameof(State.NameEn)), @operator, search)],
            "CODE" => [CreateSearchCondition(Expression.Property(state, nameof(State.Code)), @operator, search)],
            "COUNTRY" =>
            [
                CreateSearchCondition(Expression.Property(country, "NameAr"), @operator, search),
                CreateSearchCondition(Expression.Property(country, "NameEn"), @operator, search)
            ],
            _ =>
            [
                CreateSearchCondition(Expression.Property(state, nameof(State.NameAr)), @operator, search),
                CreateSearchCondition(Expression.Property(state, nameof(State.NameEn)), @operator, search),
                CreateSearchCondition(Expression.Property(state, nameof(State.Code)), @operator, search),
                CreateSearchCondition(Expression.Property(country, "NameAr"), @operator, search),
                CreateSearchCondition(Expression.Property(country, "NameEn"), @operator, search)
            ]
        };
        var requiresEveryField = @operator is "DOESNOTCONTAIN" or "DOESNOTEQUAL";
        var predicate = conditions.Aggregate((current, next) => requiresEveryField
            ? Expression.AndAlso(current, next)
            : Expression.OrElse(current, next));
        return query.Where(Expression.Lambda<Func<State, bool>>(predicate, state));
    }

    private static Expression CreateSearchCondition(Expression property, string searchOperator, string search)
    {
        var isNull = Expression.Equal(property, Expression.Constant(null, typeof(string)));
        var hasValue = Expression.Not(isNull);
        var normalized = Expression.Call(property, nameof(string.ToUpper), Type.EmptyTypes);
        var value = Expression.Constant(search);
        Expression match = searchOperator switch
        {
            "EQUALS" or "DOESNOTEQUAL" => Expression.Equal(normalized, value),
            "STARTSWITH" => Expression.Call(normalized, nameof(string.StartsWith), Type.EmptyTypes, value),
            "ENDSWITH" => Expression.Call(normalized, nameof(string.EndsWith), Type.EmptyTypes, value),
            _ => Expression.Call(normalized, nameof(string.Contains), Type.EmptyTypes, value)
        };
        return searchOperator is "DOESNOTCONTAIN" or "DOESNOTEQUAL"
            ? Expression.OrElse(isNull, Expression.Not(match))
            : Expression.AndAlso(hasValue, match);
    }

    private static IQueryable<State> ApplyOrdering(IQueryable<State> query, string? sortBy, string? sortDirection)
    {
        var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        return (sortBy?.ToUpperInvariant(), descending) switch
        {
            ("NAMEAR", false) => query.OrderBy(state => state.NameAr).ThenBy(state => state.Id),
            ("NAMEAR", true) => query.OrderByDescending(state => state.NameAr).ThenByDescending(state => state.Id),
            ("CODE", false) => query.OrderBy(state => state.Code).ThenBy(state => state.Id),
            ("CODE", true) => query.OrderByDescending(state => state.Code).ThenByDescending(state => state.Id),
            ("COUNTRY", false) => query.OrderBy(state => state.Country!.NameEn).ThenBy(state => state.Id),
            ("COUNTRY", true) => query.OrderByDescending(state => state.Country!.NameEn).ThenByDescending(state => state.Id),
            ("CREATEDON", false) => query.OrderBy(state => state.CreatedOn).ThenBy(state => state.Id),
            ("CREATEDON", true) => query.OrderByDescending(state => state.CreatedOn).ThenByDescending(state => state.Id),
            ("NAMEEN", true) => query.OrderByDescending(state => state.NameEn).ThenByDescending(state => state.Id),
            _ => query.OrderBy(state => state.NameEn).ThenBy(state => state.Id)
        };
    }
}

public sealed class StateWriteStore(ApplicationDbContext context) : IStateWriteStore
{
    public void Add(State state) => context.States.Add(state);

    public Task<State?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.States.Include(state => state.Country).FirstOrDefaultAsync(state => state.Id == id, cancellationToken);

    public async Task<IReadOnlyList<State>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken) =>
        await context.States.Include(state => state.Country).Where(state => ids.Contains(state.Id)).ToListAsync(cancellationToken);

    public Task<bool> IsCountryActiveAsync(int countryId, CancellationToken cancellationToken) =>
        context.Countries.AnyAsync(country => country.Id == countryId && !country.IsDeleted, cancellationToken);

    public Task<bool> HasActiveDistrictsAsync(int stateId, CancellationToken cancellationToken) =>
        context.Districts.AnyAsync(district => district.StateId == stateId && !district.IsDeleted, cancellationToken);

    public Task<bool> HasActiveDistrictsAsync(IReadOnlyCollection<int> stateIds, CancellationToken cancellationToken) =>
        context.Districts.AnyAsync(district => stateIds.Contains(district.StateId) && !district.IsDeleted, cancellationToken);

    public Task<bool> HasConflictAsync(State candidate, int? excludedId, CancellationToken cancellationToken) =>
        context.States.AnyAsync(state =>
            state.CountryId == candidate.CountryId &&
            (!excludedId.HasValue || state.Id != excludedId.Value) &&
            (state.NameAr == candidate.NameAr || state.NameEn == candidate.NameEn || state.Code == candidate.Code), cancellationToken);
}

public sealed class StateAuditTrail(ApplicationDbContext context, ICurrentActor currentActor, TimeProvider timeProvider) : IStateAuditTrail
{
    public void RecordUpdate(State existingState, State updatedState)
    {
        var oldValues = Values(existingState);
        var newValues = Values(updatedState);
        var changedKeys = oldValues.Keys.Where(key => !Equals(oldValues[key], newValues[key])).ToArray();
        if (changedKeys.Length == 0) return;

        context.EntityChangeLogs.Add(new EntityChangeLog
        {
            EntityId = existingState.Id,
            EntityName = nameof(State),
            JsonOldValues = JsonSerializer.Serialize(changedKeys.ToDictionary(key => key, key => oldValues[key])),
            JsonNewValues = JsonSerializer.Serialize(changedKeys.ToDictionary(key => key, key => newValues[key])),
            ChangedById = currentActor.UserId ?? throw new InvalidOperationException("An authenticated actor is required to update a state."),
            ChangedAt = timeProvider.GetUtcNow().UtcDateTime,
            ChangedByPc = Environment.MachineName
        });
    }

    private static Dictionary<string, string?> Values(State state) => new(StringComparer.Ordinal)
    {
        [nameof(State.NameAr)] = state.NameAr,
        [nameof(State.NameEn)] = state.NameEn,
        [nameof(State.Code)] = state.Code,
        [nameof(State.CountryId)] = state.CountryId.ToString(CultureInfo.InvariantCulture)
    };
}
