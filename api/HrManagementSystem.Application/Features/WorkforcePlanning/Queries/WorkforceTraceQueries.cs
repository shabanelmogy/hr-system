using FluentValidation;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.WorkforcePlanning.Abstractions;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Errors;

namespace HrManagementSystem.Application.Features.WorkforcePlanning.Queries;

public sealed record GetHiringTraceByApplicationQuery(int ApplicationId, bool IncludeFinancials) : IQuery<Result<HiringTraceResponse>>;

public sealed class GetHiringTraceByApplicationQueryValidator : AbstractValidator<GetHiringTraceByApplicationQuery>
{
    public GetHiringTraceByApplicationQueryValidator() => RuleFor(query => query.ApplicationId).GreaterThan(0);
}

public sealed class GetHiringTraceByApplicationQueryHandler(IWorkforceTraceReadStore readStore)
    : IQueryHandler<GetHiringTraceByApplicationQuery, Result<HiringTraceResponse>>
{
    public async Task<Result<HiringTraceResponse>> Handle(GetHiringTraceByApplicationQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetTraceByApplicationAsync(request.ApplicationId, request.IncludeFinancials, cancellationToken);
        return response is null
            ? Result.Failure<HiringTraceResponse>(WorkforceTraceErrors.TraceNotFound)
            : Result.Success(response);
    }
}

public sealed record GetHiringTraceByOfferQuery(int OfferId, bool IncludeFinancials) : IQuery<Result<HiringTraceResponse>>;

public sealed class GetHiringTraceByOfferQueryValidator : AbstractValidator<GetHiringTraceByOfferQuery>
{
    public GetHiringTraceByOfferQueryValidator() => RuleFor(query => query.OfferId).GreaterThan(0);
}

public sealed class GetHiringTraceByOfferQueryHandler(IWorkforceTraceReadStore readStore)
    : IQueryHandler<GetHiringTraceByOfferQuery, Result<HiringTraceResponse>>
{
    public async Task<Result<HiringTraceResponse>> Handle(GetHiringTraceByOfferQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetTraceByOfferAsync(request.OfferId, request.IncludeFinancials, cancellationToken);
        return response is null
            ? Result.Failure<HiringTraceResponse>(WorkforceTraceErrors.TraceNotFound)
            : Result.Success(response);
    }
}

public sealed record GetHiringTraceByEmployeeQuery(int EmployeeId, bool IncludeFinancials) : IQuery<Result<HiringTraceResponse>>;

public sealed class GetHiringTraceByEmployeeQueryValidator : AbstractValidator<GetHiringTraceByEmployeeQuery>
{
    public GetHiringTraceByEmployeeQueryValidator() => RuleFor(query => query.EmployeeId).GreaterThan(0);
}

public sealed class GetHiringTraceByEmployeeQueryHandler(IWorkforceTraceReadStore readStore)
    : IQueryHandler<GetHiringTraceByEmployeeQuery, Result<HiringTraceResponse>>
{
    public async Task<Result<HiringTraceResponse>> Handle(GetHiringTraceByEmployeeQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetTraceByEmployeeAsync(request.EmployeeId, request.IncludeFinancials, cancellationToken);
        return response is null
            ? Result.Failure<HiringTraceResponse>(WorkforceTraceErrors.TraceNotFound)
            : Result.Success(response);
    }
}

public sealed record GetPlanCommitmentSummaryQuery : IQuery<PageResponse<PlanCommitmentRowResponse>>
{
    public int FiscalYearId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public int? PositionId { get; init; }
    public int? BranchId { get; init; }
    public bool IncludeFinancials { get; init; }
}

public sealed class GetPlanCommitmentSummaryQueryValidator : AbstractValidator<GetPlanCommitmentSummaryQuery>
{
    public GetPlanCommitmentSummaryQueryValidator()
    {
        RuleFor(query => query.FiscalYearId).GreaterThan(0);
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(query => query.PositionId).GreaterThan(0).When(query => query.PositionId.HasValue);
        RuleFor(query => query.BranchId).GreaterThan(0).When(query => query.BranchId.HasValue);
    }
}

public sealed class GetPlanCommitmentSummaryQueryHandler(IWorkforceTraceReadStore readStore)
    : IQueryHandler<GetPlanCommitmentSummaryQuery, PageResponse<PlanCommitmentRowResponse>>
{
    public Task<PageResponse<PlanCommitmentRowResponse>> Handle(GetPlanCommitmentSummaryQuery request, CancellationToken cancellationToken) =>
        readStore.GetPlanCommitmentAsync(request, request.IncludeFinancials, cancellationToken);
}
