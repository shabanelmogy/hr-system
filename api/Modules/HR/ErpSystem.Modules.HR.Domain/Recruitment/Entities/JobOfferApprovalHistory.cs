using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using static ErpSystem.Modules.HR.Domain.Common.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.Recruitment.Entities;

public sealed class JobOfferApprovalHistory : CompanyAuditableEntity
{
    private JobOfferApprovalHistory() { }

    public JobOfferApprovalHistory(
        int jobOfferId,
        string action,
        string actorUserId,
        DateTimeOffset occurredOn,
        JobOfferStatus fromStatus,
        JobOfferStatus toStatus,
        string? reason = null)
    {
        JobOfferId = Positive(jobOfferId, nameof(jobOfferId));
        Action = Required(action, nameof(action));
        ActorUserId = Required(actorUserId, nameof(actorUserId));
        OccurredOn = occurredOn;
        FromStatus = Defined(fromStatus, nameof(fromStatus));
        ToStatus = Defined(toStatus, nameof(toStatus));
        Reason = Optional(reason);
    }

    public int Id { get; private set; }
    public int JobOfferId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string ActorUserId { get; private set; } = string.Empty;
    public DateTimeOffset OccurredOn { get; private set; }
    public JobOfferStatus FromStatus { get; private set; }
    public JobOfferStatus ToStatus { get; private set; }
    public string? Reason { get; private set; }
}
