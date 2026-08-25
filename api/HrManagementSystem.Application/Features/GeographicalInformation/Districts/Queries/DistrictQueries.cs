using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Errors;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Districts.Queries;

public sealed record GetDistrictsQuery : IQuery<PageResponse<DistrictListItemResponse>>
{
    public const int MaxPageSize = PaginationRequest.MaxClientPageSize;
    public static readonly string[] SearchFields = ["all", "nameAr", "nameEn", "code", "state"];
    public static readonly string[] SearchOperators = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];

    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public string SearchField { get; init; } = "all";
    public string SearchOperator { get; init; } = "contains";
    public string Status { get; init; } = "active";
    public int? StateId { get; init; }
    public bool? HasAddresses { get; init; }
    public string SortBy { get; init; } = "nameEn";
    public string SortDirection { get; init; } = "asc";
}

public sealed class GetDistrictsQueryValidator : AbstractValidator<GetDistrictsQuery>
{
    private static readonly string[] SortColumns = ["nameEn", "nameAr", "code", "state", "createdOn"];

    public GetDistrictsQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, GetDistrictsQuery.MaxPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.SearchField).NotEmpty().Must(field =>
            GetDistrictsQuery.SearchFields.Contains(field, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SearchOperator).NotEmpty().Must(@operator =>
            GetDistrictsQuery.SearchOperators.Contains(@operator, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.Status).NotEmpty().Must(status =>
            new[] { "active", "archived", "all" }.Contains(status, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.StateId).GreaterThan(0).When(query => query.StateId.HasValue);
        RuleFor(query => query.SortBy).NotEmpty().Must(column =>
            SortColumns.Contains(column, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(direction =>
            direction.Equals("asc", StringComparison.OrdinalIgnoreCase) ||
            direction.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}

public sealed class GetDistrictsQueryHandler(IDistrictReadStore districtReadStore)
    : IQueryHandler<GetDistrictsQuery, PageResponse<DistrictListItemResponse>>
{
    public Task<PageResponse<DistrictListItemResponse>> Handle(GetDistrictsQuery request, CancellationToken cancellationToken) =>
        districtReadStore.GetPageAsync(request, cancellationToken);
}

public sealed record GetDistrictByIdQuery(int Id) : IQuery<Result<DistrictDetailResponse>>;

public sealed class GetDistrictByIdQueryValidator : AbstractValidator<GetDistrictByIdQuery>
{
    public GetDistrictByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetDistrictByIdQueryHandler(IDistrictReadStore districtReadStore, DistrictErrors districtErrors)
    : IQueryHandler<GetDistrictByIdQuery, Result<DistrictDetailResponse>>
{
    public async Task<Result<DistrictDetailResponse>> Handle(GetDistrictByIdQuery request, CancellationToken cancellationToken)
    {
        var district = await districtReadStore.GetByIdAsync(request.Id, cancellationToken);
        return district is null
            ? Result.Failure<DistrictDetailResponse>(districtErrors.DistrictNotFound)
            : Result.Success(district);
    }
}

public sealed record GetDistrictLookupQuery(int? StateId) : IQuery<IReadOnlyList<DistrictLookupResponse>>;

public sealed class GetDistrictLookupQueryValidator : AbstractValidator<GetDistrictLookupQuery>
{
    public GetDistrictLookupQueryValidator() => RuleFor(query => query.StateId).GreaterThan(0).When(query => query.StateId.HasValue);
}

public sealed class GetDistrictLookupQueryHandler(IDistrictReadStore districtReadStore)
    : IQueryHandler<GetDistrictLookupQuery, IReadOnlyList<DistrictLookupResponse>>
{
    public Task<IReadOnlyList<DistrictLookupResponse>> Handle(GetDistrictLookupQuery request, CancellationToken cancellationToken) =>
        districtReadStore.GetLookupAsync(request.StateId, cancellationToken);
}

public sealed record GetDistrictWithAddressesQuery(int Id) : IQuery<Result<DistrictWithAddressesResponse>>;

public sealed class GetDistrictWithAddressesQueryValidator : AbstractValidator<GetDistrictWithAddressesQuery>
{
    public GetDistrictWithAddressesQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetDistrictWithAddressesQueryHandler(IDistrictReadStore districtReadStore, DistrictErrors districtErrors)
    : IQueryHandler<GetDistrictWithAddressesQuery, Result<DistrictWithAddressesResponse>>
{
    public async Task<Result<DistrictWithAddressesResponse>> Handle(GetDistrictWithAddressesQuery request, CancellationToken cancellationToken)
    {
        var district = await districtReadStore.GetWithAddressesByIdAsync(request.Id, cancellationToken);
        return district is null
            ? Result.Failure<DistrictWithAddressesResponse>(districtErrors.DistrictNotFound)
            : Result.Success(district);
    }
}
