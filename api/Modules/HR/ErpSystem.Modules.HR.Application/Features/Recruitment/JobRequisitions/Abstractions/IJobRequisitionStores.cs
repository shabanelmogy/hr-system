using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Abstractions;

public sealed record PositionHeadcountReadSnapshot(
    int PositionId,
    string PositionCode,
    string JobTitleEn,
    string JobTitleAr,
    int LegacyTargetHeadcount,
    int ActiveHeadcount,
    int? AuthorizedHeadcount,
    int? ReservedHeadcount,
    int? HiredHeadcount,
    IReadOnlyList<int> FiscalYearIds);

public sealed record ApprovedStaffingRequestCandidate(
    int Id,
    string EnvelopeCode,
    int PositionId,
    int? BranchId,
    int DepartmentId,
    int DivisionId,
    int RemainingAllocatable,
    int RemainingToHire,
    decimal EstimatedFiscalYearCostPerSlot,
    string CurrencyCode,
    DateOnly TargetStartDate,
    int FiscalYearId);

public sealed record RequisitionPositionSnapshot(int Id, int TargetHeadcount);

public sealed record RequisitionCancellationSnapshot(
    PlanningSource PlanningSource,
    int? StaffingRequestId,
    int? EnvelopeId);

public interface IJobRequisitionReadStore
{
    Task<PageResponse<JobRequisitionDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        JobRequisitionStatusFilter? status,
        CancellationToken cancellationToken);

    Task<JobRequisitionDto?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<PositionHeadcountReadSnapshot?> GetPositionHeadcountAsync(
        int positionId,
        DateOnly asOfDate,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<ApprovedStaffingRequestCandidate>> GetApprovedStaffingRequestCandidatesAsync(
        CancellationToken cancellationToken);
}

public interface IJobRequisitionRepository
{
    Task<RequisitionPositionSnapshot?> GetPositionAsync(int positionId, CancellationToken cancellationToken);
    Task<int> GetActiveHeadcountAsync(int positionId, DateOnly asOfDate, CancellationToken cancellationToken);
    Task<int> GetPendingRequestedPositionsAsync(int positionId, CancellationToken cancellationToken);
    Task<bool> EmployeeExistsAsync(int employeeId, CancellationToken cancellationToken);
    Task<StaffingRequest?> GetStaffingRequestForUpdateAsync(int staffingRequestId, CancellationToken cancellationToken);
    Task<PositionEnvelope?> GetEnvelopeSnapshotAsync(int envelopeId, CancellationToken cancellationToken);
    Task<bool> IsWorkforceBudgetEffectiveAsync(int workforceBudgetId, CancellationToken cancellationToken);
    Task<JobRequisition?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<RequisitionCancellationSnapshot?> GetCancellationSnapshotAsync(int id, CancellationToken cancellationToken);
    Task<bool> HasActiveOpeningAsync(int requisitionId, CancellationToken cancellationToken);
    void Add(JobRequisition requisition);
}

public interface IRecruitmentRequisitionPolicy
{
    bool RequireStaffingRequestForNewRequisitions { get; }
}
