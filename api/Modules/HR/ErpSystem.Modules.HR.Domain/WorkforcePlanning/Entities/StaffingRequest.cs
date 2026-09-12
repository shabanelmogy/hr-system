using ErpSystem.Modules.HR.Domain.Common.Entities;
using ErpSystem.Modules.HR.Domain.Common.Exceptions;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using static ErpSystem.Modules.HR.Domain.Common.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

/// <summary>
/// Staffing request against a position envelope with dual atomic reservation
/// (headcount + fiscal money). Draft -> Submitted -> Approved | Rejected -> Closed.
/// Closing releases only the unallocated and unconsumed remainder; hires are
/// never reversed. No requisition integration in Phase 3.
/// </summary>
public sealed class StaffingRequest : CompanyAuditableEntity
{
    private StaffingRequest()
    {
    }

    public StaffingRequest(
        int envelopeId,
        int requestedHeadcount,
        decimal estimatedAnnualSalaryPerSlot,
        decimal estimatedFiscalYearCostPerSlot,
        decimal totalReservedCost,
        DateOnly targetStartDate,
        StaffingRequestType requestType,
        StaffingRequestPriority priority,
        string justification,
        string currencyCode,
        string calculationPolicyVersion)
    {
        EnvelopeId = Positive(envelopeId, nameof(envelopeId));
        if (requestedHeadcount <= 0)
            throw new ArgumentOutOfRangeException(nameof(requestedHeadcount), "Requested headcount must be positive.");
        RequestedHeadcount = requestedHeadcount;
        EstimatedAnnualSalaryPerSlot = WorkforceBudget.NormalizeMoney(NonNegative(estimatedAnnualSalaryPerSlot, nameof(estimatedAnnualSalaryPerSlot)));
        EstimatedFiscalYearCostPerSlot = WorkforceBudget.NormalizeMoney(NonNegative(estimatedFiscalYearCostPerSlot, nameof(estimatedFiscalYearCostPerSlot)));
        TotalReservedCost = WorkforceBudget.NormalizeMoney(NonNegative(totalReservedCost, nameof(totalReservedCost)));
        if (EstimatedAnnualSalaryPerSlot <= 0 || EstimatedFiscalYearCostPerSlot <= 0 || TotalReservedCost <= 0)
            throw new ArgumentOutOfRangeException(nameof(estimatedAnnualSalaryPerSlot), "Staffing requests must reserve a positive salary cost.");
        var expectedReservedCost = WorkforceBudget.NormalizeMoney(EstimatedFiscalYearCostPerSlot * RequestedHeadcount);
        if (TotalReservedCost != expectedReservedCost)
            throw new ArgumentException("Total reserved cost must equal fiscal-year cost per slot multiplied by requested headcount.", nameof(totalReservedCost));
        TargetStartDate = targetStartDate;
        RequestType = Defined(requestType, nameof(requestType));
        Priority = Defined(priority, nameof(priority));
        Justification = Required(justification, nameof(justification));
        CurrencyCode = NormalizeCurrencyCode(currencyCode, nameof(currencyCode));
        CalculationPolicyVersion = Required(calculationPolicyVersion, nameof(calculationPolicyVersion));
    }

    public int Id { get; private set; }
    public int EnvelopeId { get; private set; }
    public int RequestedHeadcount { get; private set; }
    public decimal EstimatedAnnualSalaryPerSlot { get; private set; }
    public decimal EstimatedFiscalYearCostPerSlot { get; private set; }
    public decimal TotalReservedCost { get; private set; }
    public DateOnly TargetStartDate { get; private set; }
    public StaffingRequestType RequestType { get; private set; }
    public StaffingRequestPriority Priority { get; private set; }
    public string Justification { get; private set; } = string.Empty;
    public string CurrencyCode { get; private set; } = string.Empty;
    public string CalculationPolicyVersion { get; private set; } = string.Empty;
    public int AllocatedRequisitionPositions { get; private set; }
    public int HiredPositions { get; private set; }
    public StaffingRequestStatus Status { get; private set; } = StaffingRequestStatus.Draft;
    public StaffingRequestCloseReason? CloseReason { get; private set; }
    public DateTimeOffset? SubmittedOn { get; private set; }
    public string? SubmittedById { get; private set; }
    public DateTimeOffset? ApprovedOn { get; private set; }
    public string? ApprovedById { get; private set; }
    public DateTimeOffset? RejectedOn { get; private set; }
    public string? RejectedById { get; private set; }
    public string? DecisionReason { get; private set; }
    public DateTimeOffset? ClosedOn { get; private set; }

    public int RemainingAllocatable => RequestedHeadcount - AllocatedRequisitionPositions;

    public int RemainingToHire => RequestedHeadcount - HiredPositions;

    /// <summary>Unallocated and unconsumed headcount still reserved on the envelope.</summary>
    public int ReleasableHeadcount
    {
        get
        {
            var releasable = RequestedHeadcount - HiredPositions;
            if (releasable < 0)
                throw new DomainRuleException("StaffingRequest.NegativeCapacity", "The staffing request cannot have more hires than requested headcount.");
            return releasable;
        }
    }

    public decimal ReleasableCost =>
        WorkforceBudget.NormalizeMoney(EstimatedFiscalYearCostPerSlot * ReleasableHeadcount);

    public void Submit(DateTimeOffset submittedOn, string submittedById)
    {
        EnsureStatus(StaffingRequestStatus.Draft, StaffingRequestStatus.Rejected);
        SubmittedOn = submittedOn;
        SubmittedById = Required(submittedById, nameof(submittedById));
        DecisionReason = null;
        Status = StaffingRequestStatus.Submitted;
    }

    public void Approve(DateTimeOffset approvedOn, string approvedById)
    {
        EnsureStatus(StaffingRequestStatus.Submitted);
        var approver = Required(approvedById, nameof(approvedById));
        var isRequester = string.Equals(approver, SubmittedById, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(approver, CreatedById, StringComparison.OrdinalIgnoreCase);
        if (isRequester)
            throw new DomainRuleException("StaffingRequest.SelfApproval", "The request creator cannot approve the same request.");
        ApprovedOn = approvedOn;
        ApprovedById = approver;
        RejectedOn = null;
        RejectedById = null;
        DecisionReason = null;
        Status = StaffingRequestStatus.Approved;
    }

    public void Reject(DateTimeOffset rejectedOn, string rejectedById, string reason)
    {
        EnsureStatus(StaffingRequestStatus.Submitted);
        RejectedOn = rejectedOn;
        RejectedById = Required(rejectedById, nameof(rejectedById));
        DecisionReason = Required(reason, nameof(reason));
        Status = StaffingRequestStatus.Rejected;
    }

    public void Close(DateTimeOffset closedOn, StaffingRequestCloseReason closeReason)
    {
        EnsureStatus(StaffingRequestStatus.Approved);
        var reason = Defined(closeReason, nameof(closeReason));
        if (AllocatedRequisitionPositions > HiredPositions)
            throw new DomainRuleException("StaffingRequest.ActiveAllocations", "Close active requisitions before closing the staffing request.");
        if (reason == StaffingRequestCloseReason.Fulfilled && HiredPositions != RequestedHeadcount)
            throw new DomainRuleException("StaffingRequest.NotFulfilled", "A fulfilled request must have all requested positions hired.");
        if (reason == StaffingRequestCloseReason.Cancelled && HiredPositions != 0)
            throw new DomainRuleException("StaffingRequest.InvalidCloseReason", "Use partially fulfilled cancellation when the request already has hires.");
        if (reason == StaffingRequestCloseReason.PartiallyFulfilledCancelled &&
            (HiredPositions <= 0 || HiredPositions >= RequestedHeadcount))
            throw new DomainRuleException("StaffingRequest.InvalidCloseReason", "Partially fulfilled cancellation requires some, but not all, requested positions to be hired.");
        CloseReason = reason;
        ClosedOn = closedOn;
        Status = StaffingRequestStatus.Closed;
    }

    /// <summary>Phase 4+ hook: tracks requisition allocation without touching the envelope.</summary>
    public void RegisterAllocation(int positions)
    {
        if (positions <= 0)
            throw new ArgumentOutOfRangeException(nameof(positions), "Allocated positions must be positive.");
        if (Status != StaffingRequestStatus.Approved)
            throw new DomainRuleException("StaffingRequest.NotApproved", "Positions can only be allocated on an approved request.");
        if (AllocatedRequisitionPositions + positions > RequestedHeadcount)
            throw new DomainRuleException("StaffingRequest.OverAllocation", "Allocation exceeds the requested headcount.");
        AllocatedRequisitionPositions += positions;
    }

    public void ReleaseAllocation(int positions)
    {
        if (positions <= 0)
            throw new ArgumentOutOfRangeException(nameof(positions), "Released positions must be positive.");
        if (Status != StaffingRequestStatus.Approved)
            throw new DomainRuleException("StaffingRequest.NotApproved", "Positions can only be released on an approved request.");
        if (positions > AllocatedRequisitionPositions - HiredPositions)
            throw new DomainRuleException("StaffingRequest.OverRelease", "Only allocated positions that have not been hired can be released.");
        AllocatedRequisitionPositions -= positions;
    }

    /// <summary>Phase 5 hook: tracks hires without touching the envelope.</summary>
    public void RegisterHire(int positions)
    {
        if (positions <= 0)
            throw new ArgumentOutOfRangeException(nameof(positions), "Hired positions must be positive.");
        if (Status != StaffingRequestStatus.Approved)
            throw new DomainRuleException("StaffingRequest.NotHirable", "Hires can only be recorded on an approved request.");
        if (HiredPositions + positions > RequestedHeadcount)
            throw new DomainRuleException("StaffingRequest.OverHire", "Hires exceed the requested headcount.");
        HiredPositions += positions;
    }

    private void EnsureStatus(params StaffingRequestStatus[] expected)
    {
        if (!expected.Contains(Status))
            throw new DomainRuleException("StaffingRequest.InvalidStatusTransition", $"The request cannot be changed from {Status}.");
    }
}
