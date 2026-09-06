using FluentValidation;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.WorkforcePlanning.Abstractions;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Errors;

namespace HrManagementSystem.Application.Features.WorkforcePlanning.Queries;

public sealed record GetWorkforcePlansQuery : IQuery<PageResponse<WorkforcePlanListItemResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public int? FiscalYearId { get; init; }
    public string Status { get; init; } = "all";
    public string RecordStatus { get; init; } = "active";
    public string SortBy { get; init; } = "createdOn";
    public string SortDirection { get; init; } = "desc";
}

public sealed class GetWorkforcePlansQueryValidator : AbstractValidator<GetWorkforcePlansQuery>
{
    private static readonly string[] SortColumns = ["planCode", "titleEn", "titleAr", "status", "createdOn"];
    private static readonly string[] Statuses = ["all", "draft", "submitted", "underReview", "approved", "rejected", "superseded"];
    private static readonly string[] RecordStatuses = ["active", "archived", "all"];

    public GetWorkforcePlansQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.FiscalYearId).GreaterThan(0).When(query => query.FiscalYearId.HasValue);
        RuleFor(query => query.Status).Must(value => Statuses.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.RecordStatus).Must(value => RecordStatuses.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortBy).Must(value => SortColumns.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(value => value.Equals("asc", StringComparison.OrdinalIgnoreCase) || value.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}

public sealed class GetWorkforcePlansQueryHandler(IWorkforcePlanReadStore readStore)
    : IQueryHandler<GetWorkforcePlansQuery, PageResponse<WorkforcePlanListItemResponse>>
{
    public Task<PageResponse<WorkforcePlanListItemResponse>> Handle(GetWorkforcePlansQuery request, CancellationToken cancellationToken) =>
        readStore.GetPageAsync(request, cancellationToken);
}

public sealed record GetWorkforcePlanByIdQuery(int Id) : IQuery<Result<WorkforcePlanDetailResponse>>;

public sealed class GetWorkforcePlanByIdQueryValidator : AbstractValidator<GetWorkforcePlanByIdQuery>
{
    public GetWorkforcePlanByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetWorkforcePlanByIdQueryHandler(IWorkforcePlanReadStore readStore, WorkforcePlanErrors errors)
    : IQueryHandler<GetWorkforcePlanByIdQuery, Result<WorkforcePlanDetailResponse>>
{
    public async Task<Result<WorkforcePlanDetailResponse>> Handle(GetWorkforcePlanByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetByIdAsync(request.Id, cancellationToken);
        return response is null
            ? Result.Failure<WorkforcePlanDetailResponse>(errors.NotFound)
            : Result.Success(response);
    }
}

public sealed record GetWorkforcePlanRevisionsQuery(int Id)
    : IQuery<Result<IReadOnlyList<WorkforcePlanDetailResponse>>>;

public sealed class GetWorkforcePlanRevisionsQueryValidator : AbstractValidator<GetWorkforcePlanRevisionsQuery>
{
    public GetWorkforcePlanRevisionsQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetWorkforcePlanRevisionsQueryHandler(IWorkforcePlanReadStore readStore, WorkforcePlanErrors errors)
    : IQueryHandler<GetWorkforcePlanRevisionsQuery, Result<IReadOnlyList<WorkforcePlanDetailResponse>>>
{
    public async Task<Result<IReadOnlyList<WorkforcePlanDetailResponse>>> Handle(
        GetWorkforcePlanRevisionsQuery request,
        CancellationToken cancellationToken)
    {
        var revisions = await readStore.GetRevisionsAsync(request.Id, cancellationToken);
        return revisions.Count == 0
            ? Result.Failure<IReadOnlyList<WorkforcePlanDetailResponse>>(errors.NotFound)
            : Result.Success(revisions);
    }
}
