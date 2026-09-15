using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Abstractions;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobRequisitions.Persistence;

public sealed class JobRequisitionReadStore(
    ApplicationDbContext context,
    TypeAdapterConfig mappingConfig) : IJobRequisitionReadStore
{
    public async Task<PageResponse<JobRequisitionDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        JobRequisitionStatusFilter? status,
        CancellationToken cancellationToken)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, PaginationRequest.MaxPageSize);
        var query = context.JobRequisitions.AsNoTracking();

        if (status.HasValue)
            query = query.Where(requisition => requisition.Status == (JobRequisitionStatus)(int)status.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(requisition =>
                requisition.RequisitionNumber.ToLower().Contains(term) ||
                requisition.BusinessReason.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(requisition => requisition.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ProjectToType<JobRequisitionDto>(mappingConfig)
            .ToListAsync(cancellationToken);

        return new PageResponse<JobRequisitionDto>(items, new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    public Task<JobRequisitionDto?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        context.JobRequisitions.AsNoTracking()
            .Where(requisition => requisition.Id == id)
            .ProjectToType<JobRequisitionDto>(mappingConfig)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<PositionHeadcountReadSnapshot?> GetPositionHeadcountAsync(
        int positionId,
        DateOnly asOfDate,
        CancellationToken cancellationToken)
    {
        var position = await context.Positions.AsNoTracking()
            .Where(position => position.Id == positionId)
            .Select(position => new
            {
                position.Id,
                position.PositionCode,
                position.TargetHeadcount,
                JobTitleEn = position.JobTitle.TitleEn,
                JobTitleAr = position.JobTitle.TitleAr
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (position is null)
            return null;

        var activeHeadcount = await context.EmployeeAssignments.AsNoTracking()
            .CountAsync(assignment =>
                assignment.PositionId == positionId &&
                assignment.IsPrimary &&
                (assignment.EffectiveTo == null || assignment.EffectiveTo >= asOfDate),
                cancellationToken);

        var capacity = await (from envelope in context.PositionEnvelopes.AsNoTracking()
                              join budget in context.WorkforceBudgets.AsNoTracking()
                                  on envelope.WorkforceBudgetId equals budget.Id
                              where envelope.PositionId == positionId &&
                                    budget.Status == WorkforceBudgetStatus.Approved &&
                                    budget.ActivatedOn.HasValue &&
                                    !budget.SupersededOn.HasValue
                              select envelope)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                Authorized = group.Sum(envelope => envelope.AuthorizedHeadcount),
                Reserved = group.Sum(envelope => envelope.ReservedHeadcount),
                Hired = group.Sum(envelope => envelope.HiredHeadcount)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var fiscalYearIds = capacity is null
            ? []
            : await context.PositionEnvelopes.AsNoTracking()
                .Where(envelope => envelope.PositionId == positionId && !envelope.IsDeleted)
                .Select(envelope => envelope.FiscalYearId)
                .Distinct()
                .ToListAsync(cancellationToken);

        return new PositionHeadcountReadSnapshot(
            position.Id,
            position.PositionCode,
            position.JobTitleEn,
            position.JobTitleAr,
            position.TargetHeadcount,
            activeHeadcount,
            capacity?.Authorized,
            capacity?.Reserved,
            capacity?.Hired,
            fiscalYearIds);
    }

    public async Task<IReadOnlyList<ApprovedStaffingRequestCandidate>> GetApprovedStaffingRequestCandidatesAsync(
        CancellationToken cancellationToken) =>
        await (from request in context.StaffingRequests.AsNoTracking()
               join envelope in context.PositionEnvelopes.AsNoTracking()
                   on request.EnvelopeId equals envelope.Id
               join budget in context.WorkforceBudgets.AsNoTracking()
                   on envelope.WorkforceBudgetId equals budget.Id
               where request.Status == StaffingRequestStatus.Approved &&
                     budget.Status == WorkforceBudgetStatus.Approved &&
                     budget.ActivatedOn.HasValue &&
                     !budget.SupersededOn.HasValue &&
                     request.RequestedHeadcount > request.AllocatedRequisitionPositions
               orderby request.TargetStartDate, envelope.EnvelopeCode
               select new ApprovedStaffingRequestCandidate(
                   request.Id,
                   envelope.EnvelopeCode,
                   envelope.PositionId,
                   envelope.BranchId,
                   envelope.DepartmentId,
                   envelope.DivisionId,
                   request.RequestedHeadcount - request.AllocatedRequisitionPositions,
                   request.RequestedHeadcount - request.HiredPositions,
                   request.EstimatedFiscalYearCostPerSlot,
                   request.CurrencyCode,
                   request.TargetStartDate,
                   envelope.FiscalYearId))
            .Take(200)
            .ToListAsync(cancellationToken);

}

public sealed class JobRequisitionRepository(ApplicationDbContext context) : IJobRequisitionRepository
{
    public Task<RequisitionPositionSnapshot?> GetPositionAsync(int positionId, CancellationToken cancellationToken) =>
        context.Positions.AsNoTracking()
            .Where(position => position.Id == positionId)
            .Select(position => new RequisitionPositionSnapshot(position.Id, position.TargetHeadcount))
            .FirstOrDefaultAsync(cancellationToken);

    public Task<int> GetActiveHeadcountAsync(int positionId, DateOnly asOfDate, CancellationToken cancellationToken) =>
        context.EmployeeAssignments.AsNoTracking().CountAsync(assignment =>
            assignment.PositionId == positionId &&
            assignment.IsPrimary &&
            (assignment.EffectiveTo == null || assignment.EffectiveTo >= asOfDate),
            cancellationToken);

    public async Task<int> GetPendingRequestedPositionsAsync(int positionId, CancellationToken cancellationToken) =>
        await context.JobRequisitions.AsNoTracking()
            .Where(requisition => requisition.PositionId == positionId &&
                (requisition.Status == JobRequisitionStatus.Draft ||
                 requisition.Status == JobRequisitionStatus.PendingApproval ||
                 requisition.Status == JobRequisitionStatus.Approved))
            .SumAsync(requisition => (int?)requisition.RequestedPositions, cancellationToken) ?? 0;

    public Task<bool> EmployeeExistsAsync(int employeeId, CancellationToken cancellationToken) =>
        context.Employees.AsNoTracking().AnyAsync(employee => employee.Id == employeeId, cancellationToken);

    public Task<StaffingRequest?> GetStaffingRequestForUpdateAsync(int staffingRequestId, CancellationToken cancellationToken) =>
        context.StaffingRequests.FirstOrDefaultAsync(request => request.Id == staffingRequestId, cancellationToken);

    public Task<PositionEnvelope?> GetEnvelopeSnapshotAsync(int envelopeId, CancellationToken cancellationToken) =>
        context.PositionEnvelopes.AsNoTracking().FirstOrDefaultAsync(envelope => envelope.Id == envelopeId, cancellationToken);

    public Task<bool> IsWorkforceBudgetEffectiveAsync(int workforceBudgetId, CancellationToken cancellationToken) =>
        context.WorkforceBudgets.AsNoTracking().AnyAsync(budget =>
            budget.Id == workforceBudgetId &&
            budget.Status == WorkforceBudgetStatus.Approved &&
            budget.ActivatedOn.HasValue &&
            !budget.SupersededOn.HasValue,
            cancellationToken);

    public Task<JobRequisition?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.JobRequisitions.FirstOrDefaultAsync(requisition => requisition.Id == id, cancellationToken);

    public async Task<RequisitionCancellationSnapshot?> GetCancellationSnapshotAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var requisition = await context.JobRequisitions.AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new { item.PlanningSource, item.StaffingRequestId })
            .FirstOrDefaultAsync(cancellationToken);
        if (requisition is null)
            return null;

        int? envelopeId = null;
        if (requisition.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId is > 0)
        {
            envelopeId = await context.StaffingRequests.AsNoTracking()
                .Where(request => request.Id == requisition.StaffingRequestId.Value)
                .Select(request => (int?)request.EnvelopeId)
                .FirstOrDefaultAsync(cancellationToken);
        }

        return new RequisitionCancellationSnapshot(
            requisition.PlanningSource,
            requisition.StaffingRequestId,
            envelopeId);
    }

    public Task<bool> HasActiveOpeningAsync(int requisitionId, CancellationToken cancellationToken) =>
        context.JobOpenings.AsNoTracking().AnyAsync(opening =>
            opening.JobRequisitionId == requisitionId &&
            (opening.Status == JobOpeningStatus.Draft ||
             opening.Status == JobOpeningStatus.Open ||
             opening.Status == JobOpeningStatus.Paused),
            cancellationToken);

    public void Add(JobRequisition requisition) => context.JobRequisitions.Add(requisition);
}

public sealed class RecruitmentRequisitionPolicy(IConfiguration configuration) : IRecruitmentRequisitionPolicy
{
    public bool RequireStaffingRequestForNewRequisitions { get; } =
        configuration.GetValue<bool>("WorkforcePlanning:RequireStaffingRequestForNewRequisitions");
}
