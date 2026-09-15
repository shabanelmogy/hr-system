using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;

public sealed record GetEnvelopeAmendmentsQuery : IQuery<PageResponse<EnvelopeAmendmentListItemResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public int? EnvelopeId { get; init; }
    public string Status { get; init; } = "all";
    public string SortBy { get; init; } = "createdOn";
    public string SortDirection { get; init; } = "desc";
}

public sealed class GetEnvelopeAmendmentsQueryValidator : AbstractValidator<GetEnvelopeAmendmentsQuery>
{
    private static readonly string[] SortColumns = ["createdOn"];
    private static readonly string[] Statuses = ["all", "draft", "submitted", "approved", "rejected"];

    public GetEnvelopeAmendmentsQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.EnvelopeId).GreaterThan(0).When(query => query.EnvelopeId.HasValue);
        RuleFor(query => query.Status).Must(value => Statuses.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortBy).Must(value => SortColumns.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(value => value.Equals("asc", StringComparison.OrdinalIgnoreCase) || value.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}

public sealed class GetEnvelopeAmendmentsQueryHandler(IStaffingReadStore readStore)
    : IQueryHandler<GetEnvelopeAmendmentsQuery, PageResponse<EnvelopeAmendmentListItemResponse>>
{
    public Task<PageResponse<EnvelopeAmendmentListItemResponse>> Handle(GetEnvelopeAmendmentsQuery request, CancellationToken cancellationToken) =>
        readStore.GetAmendmentsAsync(request, cancellationToken);
}

public sealed record GetEnvelopeAmendmentByIdQuery(int Id) : IQuery<Result<EnvelopeAmendmentDetailResponse>>;

public sealed class GetEnvelopeAmendmentByIdQueryValidator : AbstractValidator<GetEnvelopeAmendmentByIdQuery>
{
    public GetEnvelopeAmendmentByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetEnvelopeAmendmentByIdQueryHandler(IStaffingReadStore readStore, StaffingErrors errors)
    : IQueryHandler<GetEnvelopeAmendmentByIdQuery, Result<EnvelopeAmendmentDetailResponse>>
{
    public async Task<Result<EnvelopeAmendmentDetailResponse>> Handle(GetEnvelopeAmendmentByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetAmendmentByIdAsync(request.Id, cancellationToken);
        return response is null
            ? Result.Failure<EnvelopeAmendmentDetailResponse>(errors.AmendmentNotFound)
            : Result.Success(response);
    }
}

public sealed record GetStaffingRequestsQuery : IQuery<PageResponse<StaffingRequestListItemResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public int? EnvelopeId { get; init; }
    public int? FiscalYearId { get; init; }
    public string Status { get; init; } = "all";
    public string SortBy { get; init; } = "createdOn";
    public string SortDirection { get; init; } = "desc";
}

public sealed class GetStaffingRequestsQueryValidator : AbstractValidator<GetStaffingRequestsQuery>
{
    private static readonly string[] SortColumns = ["createdOn", "targetStartDate"];
    private static readonly string[] Statuses = ["all", "draft", "submitted", "approved", "rejected", "closed"];

    public GetStaffingRequestsQueryValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, PaginationRequest.MaxClientPageSize);
        RuleFor(query => query.Search).MaximumLength(200);
        RuleFor(query => query.EnvelopeId).GreaterThan(0).When(query => query.EnvelopeId.HasValue);
        RuleFor(query => query.FiscalYearId).GreaterThan(0).When(query => query.FiscalYearId.HasValue);
        RuleFor(query => query.Status).Must(value => Statuses.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortBy).Must(value => SortColumns.Contains(value, StringComparer.OrdinalIgnoreCase));
        RuleFor(query => query.SortDirection).Must(value => value.Equals("asc", StringComparison.OrdinalIgnoreCase) || value.Equals("desc", StringComparison.OrdinalIgnoreCase));
    }
}

public sealed class GetStaffingRequestsQueryHandler(IStaffingReadStore readStore)
    : IQueryHandler<GetStaffingRequestsQuery, PageResponse<StaffingRequestListItemResponse>>
{
    public Task<PageResponse<StaffingRequestListItemResponse>> Handle(GetStaffingRequestsQuery request, CancellationToken cancellationToken) =>
        readStore.GetRequestsAsync(request, cancellationToken);
}

public sealed record GetStaffingRequestByIdQuery(int Id) : IQuery<Result<StaffingRequestDetailResponse>>;

public sealed class GetStaffingRequestByIdQueryValidator : AbstractValidator<GetStaffingRequestByIdQuery>
{
    public GetStaffingRequestByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetStaffingRequestByIdQueryHandler(IStaffingReadStore readStore, StaffingErrors errors)
    : IQueryHandler<GetStaffingRequestByIdQuery, Result<StaffingRequestDetailResponse>>
{
    public async Task<Result<StaffingRequestDetailResponse>> Handle(GetStaffingRequestByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetRequestByIdAsync(request.Id, cancellationToken);
        return response is null
            ? Result.Failure<StaffingRequestDetailResponse>(errors.NotFound)
            : Result.Success(response);
    }
}
