using System.Linq.Expressions;
using System.Text.Json;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Queries;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Persistence;

public sealed class AddressTypeReadStore(ApplicationDbContext context, TypeAdapterConfig mappingConfig) : IAddressTypeReadStore
{
    public async Task<PageResponse<AddressTypeListItemResponse>> GetPageAsync(GetAddressTypesQuery request, CancellationToken cancellationToken)
    {
        var query = context.AddressTypes.AsNoTracking();
        query = request.Status.ToUpperInvariant() switch { "ARCHIVED" => query.Where(item => item.IsDeleted), "ALL" => query, _ => query.Where(item => !item.IsDeleted) };
        if (!string.IsNullOrWhiteSpace(request.Search)) query = ApplySearch(query, request.SearchField, request.SearchOperator, request.Search.Trim().ToUpperInvariant());
        query = ApplyOrdering(query, request.SortBy, request.SortDirection);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ProjectToType<AddressTypeListItemResponse>(mappingConfig).ToListAsync(cancellationToken);
        var page = new PagedList<AddressTypeListItemResponse>(items, totalCount, request.PageNumber, request.PageSize, GetAddressTypesQuery.MaxPageSize);
        return new PageResponse<AddressTypeListItemResponse>(page, page.MetaData);
    }
    public Task<AddressTypeDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) => context.AddressTypes.AsNoTracking().Where(item => item.Id == id).ProjectToType<AddressTypeDetailResponse>(mappingConfig).FirstOrDefaultAsync(cancellationToken);
    public Task<AddressTypeWithAddressesResponse?> GetWithAddressesByIdAsync(int id, CancellationToken cancellationToken) => context.AddressTypes.AsNoTracking().Where(item => item.Id == id).ProjectToType<AddressTypeWithAddressesResponse>(mappingConfig).FirstOrDefaultAsync(cancellationToken);
    public async Task<IReadOnlyList<AddressTypeLookupResponse>> GetLookupAsync(CancellationToken cancellationToken) => await context.AddressTypes.AsNoTracking().Where(item => !item.IsDeleted).OrderBy(item => item.NameEn).ThenBy(item => item.Id).ProjectToType<AddressTypeLookupResponse>(mappingConfig).ToListAsync(cancellationToken);
    private static IQueryable<AddressType> ApplySearch(IQueryable<AddressType> query, string? field, string? searchOperator, string search)
    {
        var names = field?.ToUpperInvariant() switch { "NAMEAR" => new[] { nameof(AddressType.NameAr) }, "NAMEEN" => new[] { nameof(AddressType.NameEn) }, _ => new[] { nameof(AddressType.NameAr), nameof(AddressType.NameEn) } };
        var parameter = Expression.Parameter(typeof(AddressType), "addressType"); var op = searchOperator?.ToUpperInvariant() ?? "CONTAINS";
        var conditions = names.Select(name => SearchCondition(Expression.Property(parameter, name), op, search)).ToArray();
        var every = op is "DOESNOTCONTAIN" or "DOESNOTEQUAL";
        var predicate = conditions.Aggregate((left, right) => every ? Expression.AndAlso(left, right) : Expression.OrElse(left, right));
        return query.Where(Expression.Lambda<Func<AddressType, bool>>(predicate, parameter));
    }
    private static Expression SearchCondition(Expression property, string op, string value)
    {
        var normalized = Expression.Call(property, nameof(string.ToUpper), Type.EmptyTypes); var target = Expression.Constant(value);
        Expression match = op switch { "EQUALS" or "DOESNOTEQUAL" => Expression.Equal(normalized, target), "STARTSWITH" => Expression.Call(normalized, nameof(string.StartsWith), Type.EmptyTypes, target), "ENDSWITH" => Expression.Call(normalized, nameof(string.EndsWith), Type.EmptyTypes, target), _ => Expression.Call(normalized, nameof(string.Contains), Type.EmptyTypes, target) };
        return op is "DOESNOTCONTAIN" or "DOESNOTEQUAL" ? Expression.Not(match) : match;
    }
    private static IQueryable<AddressType> ApplyOrdering(IQueryable<AddressType> query, string? sortBy, string? direction)
    {
        var descending = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);
        return (sortBy?.ToUpperInvariant(), descending) switch { ("NAMEAR", false) => query.OrderBy(item => item.NameAr).ThenBy(item => item.Id), ("NAMEAR", true) => query.OrderByDescending(item => item.NameAr).ThenByDescending(item => item.Id), ("CREATEDON", false) => query.OrderBy(item => item.CreatedOn).ThenBy(item => item.Id), ("CREATEDON", true) => query.OrderByDescending(item => item.CreatedOn).ThenByDescending(item => item.Id), ("NAMEEN", true) => query.OrderByDescending(item => item.NameEn).ThenByDescending(item => item.Id), _ => query.OrderBy(item => item.NameEn).ThenBy(item => item.Id) };
    }
}

public sealed class AddressTypeWriteStore(ApplicationDbContext context) : IAddressTypeWriteStore
{
    public void Add(AddressType addressType) => context.AddressTypes.Add(addressType);
    public void AddRange(IReadOnlyCollection<AddressType> addressTypes) => context.AddressTypes.AddRange(addressTypes);
    public Task<AddressType?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => context.AddressTypes.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public async Task<IReadOnlyList<AddressType>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken) => await context.AddressTypes.Where(item => ids.Contains(item.Id)).ToListAsync(cancellationToken);
    public Task<bool> HasConflictAsync(AddressType candidate, int? excludedId, CancellationToken cancellationToken) => context.AddressTypes.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && (item.NameAr == candidate.NameAr || item.NameEn == candidate.NameEn), cancellationToken);
    public async Task<bool> HasAnyConflictAsync(IReadOnlyCollection<AddressType> addressTypes, int? excludedId, CancellationToken cancellationToken)
    {
        var nameAr = addressTypes.Select(item => item.NameAr.ToUpperInvariant()).Distinct().ToList(); var nameEn = addressTypes.Select(item => item.NameEn.ToUpperInvariant()).Distinct().ToList();
        return await context.AddressTypes.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && (nameAr.Contains(item.NameAr.ToUpper()) || nameEn.Contains(item.NameEn.ToUpper())), cancellationToken);
    }
    public Task<bool> HasActiveAddressesAsync(int addressTypeId, CancellationToken cancellationToken) => context.Addresses.AnyAsync(address => address.AddressTypeId == addressTypeId && !address.IsDeleted, cancellationToken);
    public Task<bool> HasActiveAddressesAsync(IReadOnlyCollection<int> addressTypeIds, CancellationToken cancellationToken) => context.Addresses.AnyAsync(address => addressTypeIds.Contains(address.AddressTypeId) && !address.IsDeleted, cancellationToken);
}

public sealed class AddressTypeAuditTrail(ApplicationDbContext context, ICurrentActor actor, TimeProvider timeProvider) : IAddressTypeAuditTrail
{
    public void RecordUpdate(AddressType existingAddressType, AddressType updatedAddressType)
    {
        var oldValues = Values(existingAddressType); var newValues = Values(updatedAddressType); var keys = oldValues.Keys.Where(key => !Equals(oldValues[key], newValues[key])).ToArray();
        if (keys.Length == 0) return;
        context.EntityChangeLogs.Add(new EntityChangeLog { EntityId = existingAddressType.Id, EntityName = nameof(AddressType), JsonOldValues = JsonSerializer.Serialize(keys.ToDictionary(key => key, key => oldValues[key])), JsonNewValues = JsonSerializer.Serialize(keys.ToDictionary(key => key, key => newValues[key])), ChangedById = actor.UserId ?? throw new InvalidOperationException("An authenticated actor is required to update an Address Type."), ChangedAt = timeProvider.GetUtcNow().UtcDateTime, ChangedByPc = Environment.MachineName });
    }
    private static Dictionary<string, string?> Values(AddressType item) => new(StringComparer.Ordinal) { [nameof(AddressType.NameAr)] = item.NameAr, [nameof(AddressType.NameEn)] = item.NameEn };
}
