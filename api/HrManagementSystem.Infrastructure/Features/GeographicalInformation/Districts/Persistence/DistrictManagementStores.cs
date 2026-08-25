using System.Linq.Expressions;
using System.Text.Json;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Queries;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Persistence;

public sealed class DistrictReadStore(ApplicationDbContext context, TypeAdapterConfig mappingConfig) : IDistrictReadStore
{
    public async Task<PageResponse<DistrictListItemResponse>> GetPageAsync(GetDistrictsQuery request, CancellationToken cancellationToken)
    {
        var query = context.Districts.AsNoTracking();
        query = request.Status.ToUpperInvariant() switch
        {
            "ARCHIVED" => query.Where(district => district.IsDeleted),
            "ALL" => query,
            _ => query.Where(district => !district.IsDeleted)
        };

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = ApplySearch(query, request.SearchField, request.SearchOperator, request.Search.Trim().ToUpperInvariant());
        if (request.StateId.HasValue)
            query = query.Where(district => district.StateId == request.StateId.Value);
        if (request.HasAddresses.HasValue)
            query = request.HasAddresses.Value
                ? query.Where(district => district.Addresses.Any(address => !address.IsDeleted))
                : query.Where(district => !district.Addresses.Any(address => !address.IsDeleted));

        query = ApplyOrdering(query, request.SortBy, request.SortDirection);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectToType<DistrictListItemResponse>(mappingConfig)
            .ToListAsync(cancellationToken);
        var page = new PagedList<DistrictListItemResponse>(
            items,
            totalCount,
            request.PageNumber,
            request.PageSize,
            GetDistrictsQuery.MaxPageSize);
        return new PageResponse<DistrictListItemResponse>(page, page.MetaData);
    }

    public Task<DistrictDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        context.Districts.AsNoTracking().Where(district => district.Id == id)
            .ProjectToType<DistrictDetailResponse>(mappingConfig).FirstOrDefaultAsync(cancellationToken);

    public Task<DistrictWithAddressesResponse?> GetWithAddressesByIdAsync(int id, CancellationToken cancellationToken) =>
        context.Districts.AsNoTracking().Where(district => district.Id == id)
            .ProjectToType<DistrictWithAddressesResponse>(mappingConfig).FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<DistrictLookupResponse>> GetLookupAsync(int? stateId, CancellationToken cancellationToken)
    {
        var query = context.Districts.AsNoTracking()
            .Where(district => !district.IsDeleted && !district.State!.IsDeleted && !district.State.Country!.IsDeleted);
        if (stateId.HasValue)
            query = query.Where(district => district.StateId == stateId.Value);
        return await query.OrderBy(district => district.NameEn).ThenBy(district => district.Id)
            .ProjectToType<DistrictLookupResponse>(mappingConfig).ToListAsync(cancellationToken);
    }

    private static IQueryable<District> ApplySearch(IQueryable<District> query, string? searchField, string? searchOperator, string search)
    {
        var field = searchField?.ToUpperInvariant() ?? "ALL";
        var @operator = searchOperator?.ToUpperInvariant() ?? "CONTAINS";
        var district = Expression.Parameter(typeof(District), "district");
        var state = Expression.Property(district, nameof(District.State));
        Expression[] conditions = field switch
        {
            "NAMEAR" => [CreateSearchCondition(Expression.Property(district, nameof(District.NameAr)), @operator, search)],
            "NAMEEN" => [CreateSearchCondition(Expression.Property(district, nameof(District.NameEn)), @operator, search)],
            "CODE" => [CreateSearchCondition(Expression.Property(district, nameof(District.Code)), @operator, search)],
            "STATE" =>
            [
                CreateSearchCondition(Expression.Property(state, "NameAr"), @operator, search),
                CreateSearchCondition(Expression.Property(state, "NameEn"), @operator, search)
            ],
            _ =>
            [
                CreateSearchCondition(Expression.Property(district, nameof(District.NameAr)), @operator, search),
                CreateSearchCondition(Expression.Property(district, nameof(District.NameEn)), @operator, search),
                CreateSearchCondition(Expression.Property(district, nameof(District.Code)), @operator, search),
                CreateSearchCondition(Expression.Property(state, "NameAr"), @operator, search),
                CreateSearchCondition(Expression.Property(state, "NameEn"), @operator, search)
            ]
        };
        var requiresEveryField = @operator is "DOESNOTCONTAIN" or "DOESNOTEQUAL";
        var predicate = conditions.Aggregate((current, next) => requiresEveryField
            ? Expression.AndAlso(current, next)
            : Expression.OrElse(current, next));
        return query.Where(Expression.Lambda<Func<District, bool>>(predicate, district));
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

    private static IQueryable<District> ApplyOrdering(IQueryable<District> query, string? sortBy, string? sortDirection)
    {
        var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        return (sortBy?.ToUpperInvariant(), descending) switch
        {
            ("NAMEAR", false) => query.OrderBy(district => district.NameAr).ThenBy(district => district.Id),
            ("NAMEAR", true) => query.OrderByDescending(district => district.NameAr).ThenByDescending(district => district.Id),
            ("CODE", false) => query.OrderBy(district => district.Code).ThenBy(district => district.Id),
            ("CODE", true) => query.OrderByDescending(district => district.Code).ThenByDescending(district => district.Id),
            ("STATE", false) => query.OrderBy(district => district.State!.NameEn).ThenBy(district => district.Id),
            ("STATE", true) => query.OrderByDescending(district => district.State!.NameEn).ThenByDescending(district => district.Id),
            ("CREATEDON", false) => query.OrderBy(district => district.CreatedOn).ThenBy(district => district.Id),
            ("CREATEDON", true) => query.OrderByDescending(district => district.CreatedOn).ThenByDescending(district => district.Id),
            ("NAMEEN", true) => query.OrderByDescending(district => district.NameEn).ThenByDescending(district => district.Id),
            _ => query.OrderBy(district => district.NameEn).ThenBy(district => district.Id)
        };
    }
}

public sealed class DistrictWriteStore(ApplicationDbContext context) : IDistrictWriteStore
{
    public void Add(District district) => context.Districts.Add(district);

    public void AddRange(IReadOnlyCollection<District> districts) =>
        context.Districts.AddRange(districts);

    public Task<District?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.Districts.Include(district => district.State).FirstOrDefaultAsync(district => district.Id == id, cancellationToken);

    public async Task<IReadOnlyList<District>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken) =>
        await context.Districts.Include(district => district.State).Where(district => ids.Contains(district.Id)).ToListAsync(cancellationToken);

    public Task<int?> GetStateIdAsync(int districtId, CancellationToken cancellationToken) =>
        context.Districts.AsNoTracking()
            .Where(district => district.Id == districtId)
            .Select(district => (int?)district.StateId)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyDictionary<int, int>> GetStateIdsAsync(IReadOnlyCollection<int> districtIds, CancellationToken cancellationToken) =>
        await context.Districts.AsNoTracking()
            .Where(district => districtIds.Contains(district.Id))
            .Select(district => new { district.Id, district.StateId })
            .ToDictionaryAsync(district => district.Id, district => district.StateId, cancellationToken);

    public Task<bool> IsStateActiveAsync(int stateId, CancellationToken cancellationToken) =>
        context.States.AnyAsync(state => state.Id == stateId && !state.IsDeleted && !state.Country!.IsDeleted, cancellationToken);

    public async Task<bool> AreStatesActiveAsync(IReadOnlyCollection<int> stateIds, CancellationToken cancellationToken)
    {
        if (stateIds.Count == 0)
            return true;

        var distinctStateIds = stateIds.Distinct().ToList();
        var activeCount = await context.States.CountAsync(
            state => distinctStateIds.Contains(state.Id) && !state.IsDeleted && !state.Country!.IsDeleted,
            cancellationToken);
        return activeCount == distinctStateIds.Count;
    }

    public Task<bool> HasConflictAsync(District candidate, int? excludedId, CancellationToken cancellationToken) =>
        context.Districts.AnyAsync(district =>
            district.StateId == candidate.StateId &&
            (!excludedId.HasValue || district.Id != excludedId.Value) &&
            (district.NameAr == candidate.NameAr || district.NameEn == candidate.NameEn || district.Code == candidate.Code), cancellationToken);

    public async Task<bool> HasAnyConflictAsync(IReadOnlyCollection<District> districts, CancellationToken cancellationToken)
    {
        var stateIds = districts.Select(district => district.StateId).Distinct().ToList();
        var nameArValues = districts.Select(district => district.NameAr.ToUpperInvariant()).Distinct().ToList();
        var nameEnValues = districts.Select(district => district.NameEn.ToUpperInvariant()).Distinct().ToList();
        var codeValues = districts.Select(district => district.Code.ToUpperInvariant()).Distinct().ToList();

        var existing = await context.Districts.AsNoTracking()
            .Where(district =>
                stateIds.Contains(district.StateId) &&
                (nameArValues.Contains(district.NameAr.ToUpper()) ||
                 nameEnValues.Contains(district.NameEn.ToUpper()) ||
                 codeValues.Contains(district.Code.ToUpper())))
            .Select(district => new { district.StateId, district.NameAr, district.NameEn, district.Code })
            .ToListAsync(cancellationToken);

        return existing.Any(row => districts.Any(candidate =>
            candidate.StateId == row.StateId &&
            (string.Equals(candidate.NameAr, row.NameAr, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(candidate.NameEn, row.NameEn, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(candidate.Code, row.Code, StringComparison.OrdinalIgnoreCase))));
    }

    public Task<bool> HasActiveAddressesAsync(int districtId, CancellationToken cancellationToken) =>
        context.Addresses.AnyAsync(address => address.DistrictId == districtId && !address.IsDeleted, cancellationToken);

    public Task<bool> HasActiveAddressesAsync(IReadOnlyCollection<int> districtIds, CancellationToken cancellationToken) =>
        context.Addresses.AnyAsync(address => districtIds.Contains(address.DistrictId) && !address.IsDeleted, cancellationToken);
}

public sealed class DistrictAuditTrail(ApplicationDbContext context, ICurrentActor currentActor, TimeProvider timeProvider) : IDistrictAuditTrail
{
    public void RecordUpdate(District existingDistrict, District updatedDistrict)
    {
        var oldValues = Values(existingDistrict);
        var newValues = Values(updatedDistrict);
        var changedKeys = oldValues.Keys.Where(key => !Equals(oldValues[key], newValues[key])).ToArray();
        if (changedKeys.Length == 0) return;

        context.EntityChangeLogs.Add(new EntityChangeLog
        {
            EntityId = existingDistrict.Id,
            EntityName = nameof(District),
            JsonOldValues = JsonSerializer.Serialize(changedKeys.ToDictionary(key => key, key => oldValues[key])),
            JsonNewValues = JsonSerializer.Serialize(changedKeys.ToDictionary(key => key, key => newValues[key])),
            ChangedById = currentActor.UserId ?? throw new InvalidOperationException("An authenticated actor is required to update a District."),
            ChangedAt = timeProvider.GetUtcNow().UtcDateTime,
            ChangedByPc = Environment.MachineName
        });
    }

    private static Dictionary<string, string?> Values(District district) => new(StringComparer.Ordinal)
    {
        [nameof(District.NameAr)] = district.NameAr,
        [nameof(District.NameEn)] = district.NameEn,
        [nameof(District.Code)] = district.Code,
        [nameof(District.StateId)] = district.StateId.ToString(CultureInfo.InvariantCulture)
    };
}
