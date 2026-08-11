using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Recruitment.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class JobOpening : CompanyAuditableEntity
{
    private JobOpening()
    {
    }

    public JobOpening(
        string openingNumber,
        int jobRequisitionId,
        int positionId,
        int branchId,
        int departmentId,
        int positionCount,
        EmploymentType employmentType,
        WorkArrangement workArrangement,
        int? divisionId = null)
    {
        PublicId = Guid.NewGuid();
        OpeningNumber = Required(openingNumber, nameof(openingNumber));
        JobRequisitionId = Positive(jobRequisitionId, nameof(jobRequisitionId));
        PositionId = Positive(positionId, nameof(positionId));
        BranchId = Positive(branchId, nameof(branchId));
        DepartmentId = Positive(departmentId, nameof(departmentId));
        PositionCount = Positive(positionCount, nameof(positionCount));
        EmploymentType = Defined(employmentType, nameof(employmentType));
        WorkArrangement = Defined(workArrangement, nameof(workArrangement));
        DivisionId = PositiveOrNull(divisionId, nameof(divisionId));
    }

    public int Id { get; private set; }
    public Guid PublicId { get; private set; }
    public string OpeningNumber { get; private set; } = string.Empty;
    public int JobRequisitionId { get; private set; }
    public int PositionId { get; private set; }
    public int BranchId { get; private set; }
    public int DepartmentId { get; private set; }
    public int? DivisionId { get; private set; }
    public int PositionCount { get; private set; }
    public int HiredCount { get; private set; }
    public int AvailablePositions => PositionCount - HiredCount;
    public EmploymentType EmploymentType { get; private set; }
    public WorkArrangement WorkArrangement { get; private set; }
    public JobOpeningStatus Status { get; private set; } = JobOpeningStatus.Draft;
    public DateTimeOffset? OpenedOn { get; private set; }
    public DateTimeOffset? ClosedOn { get; private set; }
    public string? ClosureReason { get; private set; }

    public void Open(DateTimeOffset openedOn)
    {
        if (Status is not (JobOpeningStatus.Draft or JobOpeningStatus.Paused))
            ThrowInvalidTransition(JobOpeningStatus.Open);

        Status = JobOpeningStatus.Open;
        OpenedOn ??= openedOn;
        ClosedOn = null;
        ClosureReason = null;
    }

    public void Pause(string reason)
    {
        EnsureStatus(JobOpeningStatus.Open);
        var normalizedReason = Required(reason, nameof(reason));

        Status = JobOpeningStatus.Paused;
        ClosureReason = normalizedReason;
    }

    public void Close(string reason, DateTimeOffset closedOn)
    {
        if (Status is not (JobOpeningStatus.Open or JobOpeningStatus.Paused))
            ThrowInvalidTransition(JobOpeningStatus.Closed);

        var normalizedReason = Required(reason, nameof(reason));
        Status = JobOpeningStatus.Closed;
        ClosedOn = closedOn;
        ClosureReason = normalizedReason;
    }

    public void Cancel(string reason, DateTimeOffset cancelledOn)
    {
        if (Status is not (JobOpeningStatus.Draft or JobOpeningStatus.Open or JobOpeningStatus.Paused))
            ThrowInvalidTransition(JobOpeningStatus.Cancelled);

        var normalizedReason = Required(reason, nameof(reason));
        Status = JobOpeningStatus.Cancelled;
        ClosedOn = cancelledOn;
        ClosureReason = normalizedReason;
    }

    public void RegisterHire(DateTimeOffset hiredOn)
    {
        if (Status is not (JobOpeningStatus.Open or JobOpeningStatus.Paused))
        {
            throw new DomainRuleException(
                "Recruitment.JobOpening.NotAcceptingHires",
                "The job opening is not accepting hires.");
        }

        if (AvailablePositions <= 0)
        {
            throw new DomainRuleException(
                "Recruitment.JobOpening.NoAvailablePositions",
                "The job opening has no available positions.");
        }

        if (OpenedOn.HasValue && hiredOn < OpenedOn.Value)
        {
            throw new DomainRuleException(
                "Recruitment.JobOpening.InvalidHireTime",
                "A hire cannot be registered before the opening was opened.");
        }

        HiredCount++;
        if (AvailablePositions == 0)
        {
            Status = JobOpeningStatus.Filled;
            ClosedOn = hiredOn;
            ClosureReason = "All positions have been filled.";
        }
    }

    private void EnsureStatus(JobOpeningStatus expected)
    {
        if (Status != expected)
            ThrowInvalidTransition(expected);
    }

    private void ThrowInvalidTransition(JobOpeningStatus target) =>
        throw new DomainRuleException(
            "Recruitment.JobOpening.InvalidStatusTransition",
            $"The job opening cannot move from {Status} to {target}.");

}
