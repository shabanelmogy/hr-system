using HrManagementSystem.Domain.Recruitment.Enums;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class ApplicationStatusHistory : CompanyAuditableEntity
{
    private ApplicationStatusHistory()
    {
    }

    internal ApplicationStatusHistory(
        ApplicationStatus? fromStatus,
        ApplicationStatus toStatus,
        DateTimeOffset changedOn,
        string? reason,
        int? changedByEmployeeId)
    {
        FromStatus = fromStatus;
        ToStatus = toStatus;
        ChangedOn = changedOn;
        Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
        ChangedByEmployeeId = changedByEmployeeId;
    }

    public long Id { get; private set; }
    public int EmploymentApplicationId { get; private set; }
    public ApplicationStatus? FromStatus { get; private set; }
    public ApplicationStatus ToStatus { get; private set; }
    public DateTimeOffset ChangedOn { get; private set; }
    public string? Reason { get; private set; }
    public int? ChangedByEmployeeId { get; private set; }
}
