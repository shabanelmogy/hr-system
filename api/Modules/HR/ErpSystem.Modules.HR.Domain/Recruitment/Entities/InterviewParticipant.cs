namespace ErpSystem.Modules.HR.Domain.Recruitment.Entities;

using ErpSystem.Modules.HR.Domain.Employees.Entities;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

public sealed class InterviewParticipant : CompanyAuditableEntity
{
    private InterviewParticipant()
    {
    }

    internal InterviewParticipant(int employeeId, bool isLead)
    {
        EmployeeId = Positive(employeeId, nameof(employeeId));
        IsLead = isLead;
    }

    public long Id { get; private set; }
    public int InterviewId { get; private set; }
    public int EmployeeId { get; private set; }
    public Employee Employee { get; private set; } = null!;
    public bool IsLead { get; private set; }

    internal void SetLead(bool isLead) => IsLead = isLead;
}
