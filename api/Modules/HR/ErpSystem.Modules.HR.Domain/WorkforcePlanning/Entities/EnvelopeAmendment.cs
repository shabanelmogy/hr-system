using ErpSystem.Modules.HR.Domain.Common.Entities;
using ErpSystem.Modules.HR.Domain.Common.Exceptions;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using static ErpSystem.Modules.HR.Domain.Common.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

/// <summary>
/// Positive-only capacity expansion request against a position envelope.
/// Draft -> Submitted -> Approved | Rejected. Approving expands the envelope
/// inside the same transaction (handled at the application layer).
/// The creator cannot approve their own amendment.
/// </summary>
public sealed class EnvelopeAmendment : CompanyAuditableEntity
{
    private EnvelopeAmendment()
    {
    }

    public EnvelopeAmendment(
        int envelopeId,
        int additionalHeadcount,
        decimal additionalSalaryCost,
        string justification,
        string requestedById)
    {
        EnvelopeId = Positive(envelopeId, nameof(envelopeId));
        if (additionalHeadcount <= 0)
            throw new ArgumentOutOfRangeException(nameof(additionalHeadcount), "Additional headcount must be positive.");
        AdditionalHeadcount = additionalHeadcount;
        AdditionalSalaryCost = WorkforceBudget.NormalizeMoney(NonNegative(additionalSalaryCost, nameof(additionalSalaryCost)));
        if (AdditionalSalaryCost <= 0)
            throw new ArgumentOutOfRangeException(nameof(additionalSalaryCost), "Additional salary cost must be positive.");
        Justification = Required(justification, nameof(justification));
        RequestedById = Required(requestedById, nameof(requestedById));
    }

    public int Id { get; private set; }
    public int EnvelopeId { get; private set; }
    public int AdditionalHeadcount { get; private set; }
    public decimal AdditionalSalaryCost { get; private set; }
    public string Justification { get; private set; } = string.Empty;
    public EnvelopeAmendmentStatus Status { get; private set; } = EnvelopeAmendmentStatus.Draft;
    public string? RequestedById { get; private set; }
    public DateTimeOffset? SubmittedOn { get; private set; }
    public string? SubmittedById { get; private set; }
    public DateTimeOffset? ApprovedOn { get; private set; }
    public string? ApprovedById { get; private set; }
    public DateTimeOffset? RejectedOn { get; private set; }
    public string? RejectedById { get; private set; }
    public string? DecisionReason { get; private set; }

    public void Submit(DateTimeOffset submittedOn, string submittedById)
    {
        EnsureStatus(EnvelopeAmendmentStatus.Draft, EnvelopeAmendmentStatus.Rejected);
        SubmittedOn = submittedOn;
        SubmittedById = Required(submittedById, nameof(submittedById));
        RequestedById ??= SubmittedById;
        DecisionReason = null;
        Status = EnvelopeAmendmentStatus.Submitted;
    }

    public void Approve(DateTimeOffset approvedOn, string approvedById)
    {
        EnsureStatus(EnvelopeAmendmentStatus.Submitted);
        var approver = Required(approvedById, nameof(approvedById));
        var isRequester = string.Equals(approver, RequestedById, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(approver, SubmittedById, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(approver, CreatedById, StringComparison.OrdinalIgnoreCase);
        if (isRequester)
            throw new DomainRuleException("EnvelopeAmendment.SelfApproval", "The amendment creator cannot approve the same amendment.");
        ApprovedOn = approvedOn;
        ApprovedById = approver;
        RejectedOn = null;
        RejectedById = null;
        DecisionReason = null;
        Status = EnvelopeAmendmentStatus.Approved;
    }

    public void Reject(DateTimeOffset rejectedOn, string rejectedById, string reason)
    {
        EnsureStatus(EnvelopeAmendmentStatus.Submitted);
        RejectedOn = rejectedOn;
        RejectedById = Required(rejectedById, nameof(rejectedById));
        DecisionReason = Required(reason, nameof(reason));
        Status = EnvelopeAmendmentStatus.Rejected;
    }

    private void EnsureStatus(params EnvelopeAmendmentStatus[] expected)
    {
        if (!expected.Contains(Status))
            throw new DomainRuleException("EnvelopeAmendment.InvalidStatusTransition", $"The amendment cannot be changed from {Status}.");
    }
}
