using FluentValidation;
using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;

public sealed record GetWorkforceBudgetsQuery : IQuery<PageResponse<WorkforceBudgetListItemResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public int? FiscalYearId { get; init; }
    public int? WorkforcePlanId { get; init; }
    public string Status { get; init; } = "all";
    public string SortBy { get; init; } = "createdOn";
    public string SortDirection { get; init; } = "desc";
}

public sealed class GetWorkforceBudgetsQueryValidator : AbstractValidator<GetWorkforceBudgetsQuery>
{
    private static readonly string[] SortColumns = ["budgetCode", "status", "createdOn", "grandTotal"];
    private static readonly string[] Statuses = ["all", "draft", "submitted", "approved", "rejected", "superseded", "closed"];

    public GetWorkforceBudgetsQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.FiscalYearId).GreaterThan(0).When(query => query.FiscalYearId.HasValue);
        RuleFor(query => query.WorkforcePlanId).GreaterThan(0).When(query => query.WorkforcePlanId.HasValue);
        RuleFor(query => query.Status).Must(value => Statuses.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortBy).Must(value => SortColumns.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(value => value.Equals("asc", StringComparison.OrdinalIgnoreCase) || value.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}

public sealed class GetWorkforceBudgetsQueryHandler(IWorkforceBudgetReadStore readStore)
    : IQueryHandler<GetWorkforceBudgetsQuery, PageResponse<WorkforceBudgetListItemResponse>>
{
    public Task<PageResponse<WorkforceBudgetListItemResponse>> Handle(GetWorkforceBudgetsQuery request, CancellationToken cancellationToken) =>
        readStore.GetPageAsync(request, cancellationToken);
}

public sealed record GetWorkforceBudgetByIdQuery(int Id) : IQuery<Result<WorkforceBudgetDetailResponse>>;

public sealed class GetWorkforceBudgetByIdQueryValidator : AbstractValidator<GetWorkforceBudgetByIdQuery>
{
    public GetWorkforceBudgetByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetWorkforceBudgetByIdQueryHandler(IWorkforceBudgetReadStore readStore, WorkforceBudgetErrors errors)
    : IQueryHandler<GetWorkforceBudgetByIdQuery, Result<WorkforceBudgetDetailResponse>>
{
    public async Task<Result<WorkforceBudgetDetailResponse>> Handle(GetWorkforceBudgetByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetByIdAsync(request.Id, cancellationToken);
        return response is null
            ? Result.Failure<WorkforceBudgetDetailResponse>(errors.NotFound)
            : Result.Success(response);
    }
}

public sealed record GetBudgetSourcePlansQuery : IQuery<PageResponse<BudgetSourcePlanResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public int? FiscalYearId { get; init; }
}

public sealed class GetBudgetSourcePlansQueryValidator : AbstractValidator<GetBudgetSourcePlansQuery>
{
    public GetBudgetSourcePlansQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.FiscalYearId).GreaterThan(0).When(query => query.FiscalYearId.HasValue);
    }
}

public sealed class GetBudgetSourcePlansQueryHandler(IWorkforceBudgetReadStore readStore)
    : IQueryHandler<GetBudgetSourcePlansQuery, PageResponse<BudgetSourcePlanResponse>>
{
    public Task<PageResponse<BudgetSourcePlanResponse>> Handle(GetBudgetSourcePlansQuery request, CancellationToken cancellationToken) =>
        readStore.GetSourcePlansAsync(request, cancellationToken);
}

public sealed record GetBudgetSourcePlanByIdQuery(int PlanId) : IQuery<Result<BudgetSourcePlanResponse>>;

public sealed class GetBudgetSourcePlanByIdQueryValidator : AbstractValidator<GetBudgetSourcePlanByIdQuery>
{
    public GetBudgetSourcePlanByIdQueryValidator() => RuleFor(query => query.PlanId).GreaterThan(0);
}

public sealed class GetBudgetSourcePlanByIdQueryHandler(IWorkforceBudgetReadStore readStore, WorkforceBudgetErrors errors)
    : IQueryHandler<GetBudgetSourcePlanByIdQuery, Result<BudgetSourcePlanResponse>>
{
    public async Task<Result<BudgetSourcePlanResponse>> Handle(GetBudgetSourcePlanByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetSourcePlanByIdAsync(request.PlanId, cancellationToken);
        return response is null
            ? Result.Failure<BudgetSourcePlanResponse>(errors.PlanNotFound)
            : Result.Success(response);
    }
}

public sealed record GetPositionEnvelopesQuery : IQuery<PageResponse<PositionEnvelopeListItemResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public int? FiscalYearId { get; init; }
    public int? WorkforceBudgetId { get; init; }
    public int? WorkforcePlanId { get; init; }
    public int? BranchId { get; init; }
    public int? DepartmentId { get; init; }
    public int? PositionId { get; init; }
    public string SortBy { get; init; } = "createdOn";
    public string SortDirection { get; init; } = "desc";
}

public sealed class GetPositionEnvelopesQueryValidator : AbstractValidator<GetPositionEnvelopesQuery>
{
    private static readonly string[] SortColumns = ["envelopeCode", "createdOn"];

    public GetPositionEnvelopesQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.FiscalYearId).GreaterThan(0).When(query => query.FiscalYearId.HasValue);
        RuleFor(query => query.WorkforceBudgetId).GreaterThan(0).When(query => query.WorkforceBudgetId.HasValue);
        RuleFor(query => query.WorkforcePlanId).GreaterThan(0).When(query => query.WorkforcePlanId.HasValue);
        RuleFor(query => query.BranchId).GreaterThan(0).When(query => query.BranchId.HasValue);
        RuleFor(query => query.DepartmentId).GreaterThan(0).When(query => query.DepartmentId.HasValue);
        RuleFor(query => query.PositionId).GreaterThan(0).When(query => query.PositionId.HasValue);
        RuleFor(query => query.SortBy).Must(value => SortColumns.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(value => value.Equals("asc", StringComparison.OrdinalIgnoreCase) || value.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}

public sealed class GetPositionEnvelopesQueryHandler(IWorkforceBudgetReadStore readStore)
    : IQueryHandler<GetPositionEnvelopesQuery, PageResponse<PositionEnvelopeListItemResponse>>
{
    public Task<PageResponse<PositionEnvelopeListItemResponse>> Handle(GetPositionEnvelopesQuery request, CancellationToken cancellationToken) =>
        readStore.GetEnvelopesAsync(request, cancellationToken);
}

public sealed record GetPositionEnvelopeByIdQuery(int Id) : IQuery<Result<PositionEnvelopeDetailResponse>>;

public sealed class GetPositionEnvelopeByIdQueryValidator : AbstractValidator<GetPositionEnvelopeByIdQuery>
{
    public GetPositionEnvelopeByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetPositionEnvelopeByIdQueryHandler(IWorkforceBudgetReadStore readStore, WorkforceBudgetErrors errors)
    : IQueryHandler<GetPositionEnvelopeByIdQuery, Result<PositionEnvelopeDetailResponse>>
{
    public async Task<Result<PositionEnvelopeDetailResponse>> Handle(GetPositionEnvelopeByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetEnvelopeByIdAsync(request.Id, cancellationToken);
        return response is null
            ? Result.Failure<PositionEnvelopeDetailResponse>(errors.EnvelopeNotFound)
            : Result.Success(response);
    }
}
