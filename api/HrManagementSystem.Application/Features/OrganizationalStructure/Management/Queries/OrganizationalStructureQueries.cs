using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Abstractions;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Contracts;

namespace HrManagementSystem.Application.Features.OrganizationalStructure.Management.Queries;

public sealed record GetOrganizationalStructureQuery : IQuery<PageResponse<OrganizationalStructureItem>>
{
    public const int MaxPageSize = PaginationRequest.MaxClientPageSize;
    public static readonly string[] SearchFields = ["all", "nameAr", "nameEn", "code", "parent"];
    public static readonly string[] SearchOperators = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];
    public string Resource { get; init; } = OrganizationalResources.Branches;
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public string SearchField { get; init; } = "all";
    public string SearchOperator { get; init; } = "contains";
    public string Status { get; init; } = "active";
    public string SortBy { get; init; } = "nameEn";
    public string SortDirection { get; init; } = "asc";
    public int? ParentId { get; init; }
}

public sealed class GetOrganizationalStructureQueryValidator : AbstractValidator<GetOrganizationalStructureQuery>
{
    public GetOrganizationalStructureQueryValidator()
    {
        RuleFor(x => x.Resource).NotEmpty().Must(OrganizationalResources.IsSupported);
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, GetOrganizationalStructureQuery.MaxPageSize);
        RuleFor(x => x.Search).MaximumLength(200);
        RuleFor(x => x.SearchField).NotEmpty().Must(x =>
            GetOrganizationalStructureQuery.SearchFields.Contains(x, StringComparer.OrdinalIgnoreCase));
        RuleFor(x => x.SearchOperator).NotEmpty().Must(x =>
            GetOrganizationalStructureQuery.SearchOperators.Contains(x, StringComparer.OrdinalIgnoreCase));
        RuleFor(x => x.Status).Must(x => new[] { "active", "archived", "all", "draft", "approved", "rejected", "expired" }.Contains(x, StringComparer.OrdinalIgnoreCase));
        RuleFor(x => x.SortBy).Must(x => new[] { "nameEn", "nameAr", "code", "parent", "createdOn" }.Contains(x, StringComparer.OrdinalIgnoreCase));
        RuleFor(x => x.SortDirection).Must(x => x.Equals("asc", StringComparison.OrdinalIgnoreCase) || x.Equals("desc", StringComparison.OrdinalIgnoreCase));
        RuleFor(x => x.ParentId).GreaterThan(0).When(x => x.ParentId.HasValue);
    }
}

public sealed class GetOrganizationalStructureQueryHandler(IOrganizationalStructureManagement management)
    : IQueryHandler<GetOrganizationalStructureQuery, PageResponse<OrganizationalStructureItem>>
{
    public Task<PageResponse<OrganizationalStructureItem>> Handle(GetOrganizationalStructureQuery request, CancellationToken cancellationToken) =>
        management.GetPageAsync(request, cancellationToken);
}

public sealed record GetOrganizationalStructureItemQuery(string Resource, int Id)
    : IQuery<Result<OrganizationalStructureItem>>;

public sealed class GetOrganizationalStructureItemQueryValidator : AbstractValidator<GetOrganizationalStructureItemQuery>
{
    public GetOrganizationalStructureItemQueryValidator()
    {
        RuleFor(x => x.Resource).Must(OrganizationalResources.IsSupported);
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

public sealed class GetOrganizationalStructureItemQueryHandler(IOrganizationalStructureManagement management)
    : IQueryHandler<GetOrganizationalStructureItemQuery, Result<OrganizationalStructureItem>>
{
    public async Task<Result<OrganizationalStructureItem>> Handle(GetOrganizationalStructureItemQuery request, CancellationToken cancellationToken)
    {
        var item = await management.GetAsync(request.Resource, request.Id, cancellationToken);
        return item is null
            ? Result.Failure<OrganizationalStructureItem>(new Error("OrganizationalStructure.NotFound", "The organizational structure item was not found.", ErrorType.NotFound))
            : Result.Success(item);
    }
}

public sealed record GetOrganizationalStructureLookupQuery(string Resource, int? ParentId)
    : IQuery<IReadOnlyList<OrganizationalStructureLookup>>;

public sealed class GetOrganizationalStructureLookupQueryHandler(IOrganizationalStructureManagement management)
    : IQueryHandler<GetOrganizationalStructureLookupQuery, IReadOnlyList<OrganizationalStructureLookup>>
{
    public Task<IReadOnlyList<OrganizationalStructureLookup>> Handle(GetOrganizationalStructureLookupQuery request, CancellationToken cancellationToken) =>
        management.GetLookupAsync(request.Resource, request.ParentId, cancellationToken);
}
