using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Abstractions;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Queries;

public sealed record GetJobRequisitionsPageQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Search = null,
    JobRequisitionStatusFilter? Status = null)
    : IQuery<PageResponse<JobRequisitionDto>>;

public sealed record GetJobRequisitionByIdQuery(int Id) : IQuery<Result<JobRequisitionDto>>;
public sealed record GetPositionHeadcountSummaryQuery(int PositionId) : IQuery<Result<PositionHeadcountSummaryDto>>;
public sealed record GetApprovedStaffingRequestOptionsQuery : IQuery<IReadOnlyList<ApprovedStaffingRequestOptionDto>>;

public sealed class GetJobRequisitionsPageQueryHandler(IJobRequisitionReadStore readStore)
    : IQueryHandler<GetJobRequisitionsPageQuery, PageResponse<JobRequisitionDto>>
{
    public Task<PageResponse<JobRequisitionDto>> Handle(GetJobRequisitionsPageQuery query, CancellationToken cancellationToken) =>
        readStore.GetPageAsync(query.PageNumber, query.PageSize, query.Search, query.Status, cancellationToken);
}

public sealed class GetJobRequisitionByIdQueryHandler(IJobRequisitionReadStore readStore)
    : IQueryHandler<GetJobRequisitionByIdQuery, Result<JobRequisitionDto>>
{
    public async Task<Result<JobRequisitionDto>> Handle(GetJobRequisitionByIdQuery query, CancellationToken cancellationToken)
    {
        var requisition = await readStore.GetByIdAsync(query.Id, cancellationToken);
        return requisition is not null
            ? Result.Success(requisition)
            : Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);
    }
}

public sealed class GetPositionHeadcountSummaryQueryHandler(
    IJobRequisitionReadStore readStore,
    IFiscalYearPlanningSource fiscalYears,
    ICurrentActor actor,
    TimeProvider clock)
    : IQueryHandler<GetPositionHeadcountSummaryQuery, Result<PositionHeadcountSummaryDto>>
{
    public async Task<Result<PositionHeadcountSummaryDto>> Handle(
        GetPositionHeadcountSummaryQuery query,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        var snapshot = await readStore.GetPositionHeadcountAsync(query.PositionId, today, cancellationToken);
        if (snapshot is null)
            return Result.Failure<PositionHeadcountSummaryDto>(RecruitmentErrors.PositionNotFound);

        var usePlannedCapacity = snapshot.AuthorizedHeadcount.HasValue &&
                                 await HasOpenFiscalYearAsync(snapshot.FiscalYearIds, actor, fiscalYears, cancellationToken);

        var targetHeadcount = usePlannedCapacity
            ? snapshot.AuthorizedHeadcount!.Value
            : snapshot.LegacyTargetHeadcount;
        var pending = usePlannedCapacity ? snapshot.ReservedHeadcount!.Value : 0;
        var available = usePlannedCapacity
            ? snapshot.AuthorizedHeadcount!.Value - snapshot.ReservedHeadcount!.Value - snapshot.HiredHeadcount!.Value
            : snapshot.LegacyTargetHeadcount - snapshot.ActiveHeadcount;

        if (available < 0)
            return Result.Failure<PositionHeadcountSummaryDto>(RecruitmentErrors.InvalidOperation);

        return Result.Success(new PositionHeadcountSummaryDto(
            snapshot.PositionId,
            snapshot.PositionCode,
            snapshot.JobTitleEn,
            snapshot.JobTitleAr,
            targetHeadcount,
            snapshot.ActiveHeadcount,
            pending,
            available,
            available == 0));
    }

    internal static async Task<bool> HasOpenFiscalYearAsync(
        IEnumerable<int> fiscalYearIds,
        ICurrentActor actor,
        IFiscalYearPlanningSource fiscalYears,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0)
            return false;

        foreach (var fiscalYearId in fiscalYearIds.Distinct())
        {
            var fiscalYear = await fiscalYears.GetAsync(actor.TenantId, actor.CompanyId.Value, fiscalYearId, cancellationToken);
            if (fiscalYear?.Status.Equals("Open", StringComparison.OrdinalIgnoreCase) == true)
                return true;
        }

        return false;
    }
}

public sealed class GetApprovedStaffingRequestOptionsQueryHandler(
    IJobRequisitionReadStore readStore,
    IFiscalYearPlanningSource fiscalYears,
    ICurrentActor actor)
    : IQueryHandler<GetApprovedStaffingRequestOptionsQuery, IReadOnlyList<ApprovedStaffingRequestOptionDto>>
{
    public async Task<IReadOnlyList<ApprovedStaffingRequestOptionDto>> Handle(
        GetApprovedStaffingRequestOptionsQuery query,
        CancellationToken cancellationToken)
    {
        var candidates = await readStore.GetApprovedStaffingRequestCandidatesAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0)
            return [];

        var result = new List<ApprovedStaffingRequestOptionDto>(candidates.Count);
        foreach (var candidate in candidates)
        {
            var fiscalYear = await fiscalYears.GetAsync(
                actor.TenantId,
                actor.CompanyId.Value,
                candidate.FiscalYearId,
                cancellationToken);
            if (fiscalYear?.Status.Equals("Open", StringComparison.OrdinalIgnoreCase) != true)
                continue;

            result.Add(new ApprovedStaffingRequestOptionDto(
                candidate.Id,
                candidate.EnvelopeCode,
                candidate.PositionId,
                candidate.BranchId,
                candidate.DepartmentId,
                candidate.DivisionId,
                candidate.RemainingAllocatable,
                candidate.RemainingToHire,
                candidate.EstimatedFiscalYearCostPerSlot,
                candidate.CurrencyCode,
                candidate.TargetStartDate));
        }

        return result;
    }
}
