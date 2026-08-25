using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Errors;

namespace HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Queries;

public sealed record GetAddressTypesQuery : IQuery<PageResponse<AddressTypeListItemResponse>>
{
    public const int MaxPageSize = PaginationRequest.MaxClientPageSize;
    public static readonly string[] SearchFields = ["all", "nameAr", "nameEn"];
    public static readonly string[] SearchOperators = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public string SearchField { get; init; } = "all";
    public string SearchOperator { get; init; } = "contains";
    public string Status { get; init; } = "active";
    public string SortBy { get; init; } = "nameEn";
    public string SortDirection { get; init; } = "asc";
}
public sealed class GetAddressTypesQueryValidator : AbstractValidator<GetAddressTypesQuery>
{
    private static readonly string[] SortColumns = ["nameEn", "nameAr", "createdOn"];
    public GetAddressTypesQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0); RuleFor(query => query.PageSize).InclusiveBetween(1, GetAddressTypesQuery.MaxPageSize); RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.SearchField).NotEmpty().Must(field => GetAddressTypesQuery.SearchFields.Contains(field, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SearchOperator).NotEmpty().Must(@operator => GetAddressTypesQuery.SearchOperators.Contains(@operator, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.Status).NotEmpty().Must(status => new[] { "active", "archived", "all" }.Contains(status, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortBy).NotEmpty().Must(column => SortColumns.Contains(column, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(direction => direction.Equals("asc", StringComparison.OrdinalIgnoreCase) || direction.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}
public sealed class GetAddressTypesQueryHandler(IAddressTypeReadStore readStore) : IQueryHandler<GetAddressTypesQuery, PageResponse<AddressTypeListItemResponse>>
{ public Task<PageResponse<AddressTypeListItemResponse>> Handle(GetAddressTypesQuery request, CancellationToken cancellationToken) => readStore.GetPageAsync(request, cancellationToken); }
public sealed record GetAddressTypeByIdQuery(int Id) : IQuery<Result<AddressTypeDetailResponse>>;
public sealed class GetAddressTypeByIdQueryValidator : AbstractValidator<GetAddressTypeByIdQuery> { public GetAddressTypeByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0); }
public sealed class GetAddressTypeByIdQueryHandler(IAddressTypeReadStore readStore, AddressTypeErrors errors) : IQueryHandler<GetAddressTypeByIdQuery, Result<AddressTypeDetailResponse>>
{ public async Task<Result<AddressTypeDetailResponse>> Handle(GetAddressTypeByIdQuery request, CancellationToken cancellationToken) { var item = await readStore.GetByIdAsync(request.Id, cancellationToken); return item is null ? Result.Failure<AddressTypeDetailResponse>(errors.AddressTypeNotFound) : Result.Success(item); } }
public sealed record GetAddressTypeLookupQuery : IQuery<IReadOnlyList<AddressTypeLookupResponse>>;
public sealed class GetAddressTypeLookupQueryHandler(IAddressTypeReadStore readStore) : IQueryHandler<GetAddressTypeLookupQuery, IReadOnlyList<AddressTypeLookupResponse>>
{ public Task<IReadOnlyList<AddressTypeLookupResponse>> Handle(GetAddressTypeLookupQuery request, CancellationToken cancellationToken) => readStore.GetLookupAsync(cancellationToken); }
public sealed record GetAddressTypeWithAddressesQuery(int Id) : IQuery<Result<AddressTypeWithAddressesResponse>>;
public sealed class GetAddressTypeWithAddressesQueryValidator : AbstractValidator<GetAddressTypeWithAddressesQuery> { public GetAddressTypeWithAddressesQueryValidator() => RuleFor(query => query.Id).GreaterThan(0); }
public sealed class GetAddressTypeWithAddressesQueryHandler(IAddressTypeReadStore readStore, AddressTypeErrors errors) : IQueryHandler<GetAddressTypeWithAddressesQuery, Result<AddressTypeWithAddressesResponse>>
{ public async Task<Result<AddressTypeWithAddressesResponse>> Handle(GetAddressTypeWithAddressesQuery request, CancellationToken cancellationToken) { var item = await readStore.GetWithAddressesByIdAsync(request.Id, cancellationToken); return item is null ? Result.Failure<AddressTypeWithAddressesResponse>(errors.AddressTypeNotFound) : Result.Success(item); } }
