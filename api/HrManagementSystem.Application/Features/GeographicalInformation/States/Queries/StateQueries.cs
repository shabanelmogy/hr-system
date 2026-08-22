using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Errors;

namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Queries;

public sealed record GetStatesQuery : IQuery<PageResponse<StateListItemResponse>>
{
    public const int MaxPageSize = PaginationRequest.MaxClientPageSize;
    public static readonly string[] SearchFields = ["all", "nameAr", "nameEn", "code", "country"];
    public static readonly string[] SearchOperators = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];

    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public string SearchField { get; init; } = "all";
    public string SearchOperator { get; init; } = "contains";
    public string Status { get; init; } = "active";
    public int? CountryId { get; init; }
    public bool? HasDistricts { get; init; }
    public string SortBy { get; init; } = "nameEn";
    public string SortDirection { get; init; } = "asc";
}

public sealed class GetStatesQueryValidator : AbstractValidator<GetStatesQuery>
{
    private static readonly string[] SortColumns = ["nameEn", "nameAr", "code", "country", "createdOn"];

    public GetStatesQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, GetStatesQuery.MaxPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.SearchField).NotEmpty().Must(field =>
            GetStatesQuery.SearchFields.Contains(field, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SearchOperator).NotEmpty().Must(@operator =>
            GetStatesQuery.SearchOperators.Contains(@operator, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.Status).NotEmpty().Must(status =>
            new[] { "active", "archived", "all" }.Contains(status, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.CountryId).GreaterThan(0).When(query => query.CountryId.HasValue);
        RuleFor(query => query.SortBy).NotEmpty().Must(column =>
            SortColumns.Contains(column, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(direction =>
            direction.Equals("asc", StringComparison.OrdinalIgnoreCase) ||
            direction.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}

public sealed class GetStatesQueryHandler(IStateReadStore stateReadStore)
    : IQueryHandler<GetStatesQuery, PageResponse<StateListItemResponse>>
{
    public Task<PageResponse<StateListItemResponse>> Handle(GetStatesQuery request, CancellationToken cancellationToken) =>
        stateReadStore.GetPageAsync(request, cancellationToken);
}

public sealed record GetStateByIdQuery(int Id) : IQuery<Result<StateDetailResponse>>;

public sealed class GetStateByIdQueryValidator : AbstractValidator<GetStateByIdQuery>
{
    public GetStateByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetStateByIdQueryHandler(IStateReadStore stateReadStore, StateErrors stateErrors)
    : IQueryHandler<GetStateByIdQuery, Result<StateDetailResponse>>
{
    public async Task<Result<StateDetailResponse>> Handle(GetStateByIdQuery request, CancellationToken cancellationToken)
    {
        var state = await stateReadStore.GetByIdAsync(request.Id, cancellationToken);
        return state is null
            ? Result.Failure<StateDetailResponse>(stateErrors.StateNotFound)
            : Result.Success(state);
    }
}

public sealed record GetStateLookupQuery(int? CountryId) : IQuery<IReadOnlyList<StateLookupResponse>>;

public sealed class GetStateLookupQueryValidator : AbstractValidator<GetStateLookupQuery>
{
    public GetStateLookupQueryValidator() => RuleFor(query => query.CountryId).GreaterThan(0).When(query => query.CountryId.HasValue);
}

public sealed class GetStateLookupQueryHandler(IStateReadStore stateReadStore)
    : IQueryHandler<GetStateLookupQuery, IReadOnlyList<StateLookupResponse>>
{
    public Task<IReadOnlyList<StateLookupResponse>> Handle(GetStateLookupQuery request, CancellationToken cancellationToken) =>
        stateReadStore.GetLookupAsync(request.CountryId, cancellationToken);
}

public sealed record GetStateWithDistrictsQuery(int Id) : IQuery<Result<StateWithDistrictsResponse>>;

public sealed class GetStateWithDistrictsQueryValidator : AbstractValidator<GetStateWithDistrictsQuery>
{
    public GetStateWithDistrictsQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetStateWithDistrictsQueryHandler(IStateReadStore stateReadStore, StateErrors stateErrors)
    : IQueryHandler<GetStateWithDistrictsQuery, Result<StateWithDistrictsResponse>>
{
    public async Task<Result<StateWithDistrictsResponse>> Handle(GetStateWithDistrictsQuery request, CancellationToken cancellationToken)
    {
        var state = await stateReadStore.GetWithDistrictsByIdAsync(request.Id, cancellationToken);
        return state is null
            ? Result.Failure<StateWithDistrictsResponse>(stateErrors.StateNotFound)
            : Result.Success(state);
    }
}
