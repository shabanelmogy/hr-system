using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Recruitment.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class JobRequisition : CompanyAuditableEntity
{
    private JobRequisition()
    {
    }

    public JobRequisition(
        string requisitionNumber,
        int positionId,
        int branchId,
        int departmentId,
        int requestedByEmployeeId,
        int requestedPositions)
    {
        RequisitionNumber = Required(requisitionNumber, nameof(requisitionNumber));
        PositionId = Positive(positionId, nameof(positionId));
        BranchId = Positive(branchId, nameof(branchId));
        DepartmentId = Positive(departmentId, nameof(departmentId));
        RequestedByEmployeeId = Positive(requestedByEmployeeId, nameof(requestedByEmployeeId));
        RequestedPositions = Positive(requestedPositions, nameof(requestedPositions));
    }

    public int Id { get; private set; }
    public string RequisitionNumber { get; private set; } = string.Empty;
    public int PositionId { get; private set; }
    public int BranchId { get; private set; }
    public int DepartmentId { get; private set; }
    public int? DivisionId { get; private set; }
    public int RequestedByEmployeeId { get; private set; }
    public int RequestedPositions { get; private set; }
    public string BusinessReason { get; private set; } = string.Empty;
    public EmploymentType EmploymentType { get; private set; } = EmploymentType.FullTime;
    public WorkArrangement WorkArrangement { get; private set; } = WorkArrangement.OnSite;
    public DateOnly? TargetHireDate { get; private set; }
    public JobRequisitionStatus Status { get; private set; } = JobRequisitionStatus.Draft;
    public DateTimeOffset? SubmittedOn { get; private set; }
    public int? ReviewedByEmployeeId { get; private set; }
    public DateTimeOffset? ReviewedOn { get; private set; }
    public string? DecisionReason { get; private set; }

    public void UpdateDetails(
        string businessReason,
        EmploymentType employmentType,
        WorkArrangement workArrangement,
        DateOnly? targetHireDate,
        int? divisionId = null)
    {
        EnsureStatus(JobRequisitionStatus.Draft);
        var normalizedBusinessReason = Required(businessReason, nameof(businessReason));
        var normalizedDivisionId = PositiveOrNull(divisionId, nameof(divisionId));
        var normalizedEmploymentType = Defined(employmentType, nameof(employmentType));
        var normalizedWorkArrangement = Defined(workArrangement, nameof(workArrangement));

        BusinessReason = normalizedBusinessReason;
        EmploymentType = normalizedEmploymentType;
        WorkArrangement = normalizedWorkArrangement;
        TargetHireDate = targetHireDate;
        DivisionId = normalizedDivisionId;
    }

    public void Submit(DateTimeOffset submittedOn)
    {
        EnsureStatus(JobRequisitionStatus.Draft);

        if (string.IsNullOrWhiteSpace(BusinessReason))
        {
            throw new DomainRuleException(
                "Recruitment.JobRequisition.BusinessReasonRequired",
                "A business reason is required before submitting the requisition.");
        }

        Status = JobRequisitionStatus.PendingApproval;
        SubmittedOn = submittedOn;
    }

    public void Approve(int reviewedByEmployeeId, DateTimeOffset reviewedOn)
    {
        EnsureStatus(JobRequisitionStatus.PendingApproval);
        EnsureReviewTime(reviewedOn);
        ReviewedByEmployeeId = Positive(reviewedByEmployeeId, nameof(reviewedByEmployeeId));
        ReviewedOn = reviewedOn;
        DecisionReason = null;
        Status = JobRequisitionStatus.Approved;
    }

    public void Reject(int reviewedByEmployeeId, string reason, DateTimeOffset reviewedOn)
    {
        EnsureStatus(JobRequisitionStatus.PendingApproval);
        EnsureReviewTime(reviewedOn);
        var normalizedReviewerId = Positive(reviewedByEmployeeId, nameof(reviewedByEmployeeId));
        var normalizedReason = Required(reason, nameof(reason));

        ReviewedByEmployeeId = normalizedReviewerId;
        ReviewedOn = reviewedOn;
        DecisionReason = normalizedReason;
        Status = JobRequisitionStatus.Rejected;
    }

    public void Cancel(string reason)
    {
        if (Status is not (JobRequisitionStatus.Draft or
            JobRequisitionStatus.PendingApproval or
            JobRequisitionStatus.Approved))
            ThrowInvalidTransition(JobRequisitionStatus.Cancelled);

        var normalizedReason = Required(reason, nameof(reason));
        DecisionReason = normalizedReason;
        Status = JobRequisitionStatus.Cancelled;
    }

    public void MarkFulfilled()
    {
        EnsureStatus(JobRequisitionStatus.Approved);
        Status = JobRequisitionStatus.Fulfilled;
    }

    private void EnsureStatus(JobRequisitionStatus expected)
    {
        if (Status != expected)
            ThrowInvalidTransition(expected);
    }

    private void EnsureReviewTime(DateTimeOffset reviewedOn)
    {
        if (SubmittedOn.HasValue && reviewedOn < SubmittedOn.Value)
        {
            throw new DomainRuleException(
                "Recruitment.JobRequisition.InvalidReviewTime",
                "The review time cannot be earlier than the submission time.");
        }
    }

    private void ThrowInvalidTransition(JobRequisitionStatus target) =>
        throw new DomainRuleException(
            "Recruitment.JobRequisition.InvalidStatusTransition",
            $"The requisition cannot move from {Status} to {target}.");

}
