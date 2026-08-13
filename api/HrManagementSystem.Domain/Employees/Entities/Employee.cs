using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Employees.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Employees.Entities;

public class Employee : CompanyAuditableEntity
{
    private Employee()
    {
    }

    public Employee(
        string employeeNumber,
        string firstName,
        string lastName,
        DateOnly hireDate,
        int? candidateId = null)
    {
        PublicId = Guid.NewGuid();
        EmployeeNumber = Required(employeeNumber, nameof(employeeNumber)).ToUpperInvariant();
        UpdateIdentity(firstName, null, lastName);
        HireDate = hireDate;
        CandidateId = PositiveOrNull(candidateId, nameof(candidateId));
    }

    public int Id { get; private set; }
    public Guid PublicId { get; private set; }
    public string EmployeeNumber { get; private set; } = string.Empty;
    public int? CandidateId { get; private set; }
    public string? UserId { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string? MiddleName { get; private set; }
    public string LastName { get; private set; } = string.Empty;
    public DateOnly HireDate { get; private set; }
    public EmployeeStatus Status { get; private set; } = EmployeeStatus.Draft;
    public DateOnly? StatusEffectiveOn { get; private set; }
    public string? StatusReason { get; private set; }
    public DateOnly? TerminationDate { get; private set; }

    public ICollection<EmployeeAssignment> Assignments { get; private set; } = [];
    public ICollection<EmployeeContract> Contracts { get; private set; } = [];

    public void UpdateIdentity(string firstName, string? middleName, string lastName)
    {
        FirstName = Required(firstName, nameof(firstName));
        MiddleName = Optional(middleName);
        LastName = Required(lastName, nameof(lastName));
    }

    public void LinkUserAccount(string userId)
    {
        var normalizedUserId = Required(userId, nameof(userId));
        if (UserId is not null && !string.Equals(UserId, normalizedUserId, StringComparison.Ordinal))
        {
            throw new DomainRuleException(
                "Employees.Employee.UserAlreadyLinked",
                "The employee is already linked to another user account.");
        }

        UserId = normalizedUserId;
    }

    public void Activate(DateOnly effectiveOn)
    {
        if (Status is not (EmployeeStatus.Draft or EmployeeStatus.Suspended))
            ThrowInvalidTransition(EmployeeStatus.Active);

        EnsureEffectiveDate(effectiveOn);

        Status = EmployeeStatus.Active;
        StatusEffectiveOn = effectiveOn;
        StatusReason = null;
    }

    public void Suspend(string reason, DateOnly effectiveOn)
    {
        EnsureStatus(EmployeeStatus.Active);
        EnsureEffectiveDate(effectiveOn);
        Status = EmployeeStatus.Suspended;
        StatusEffectiveOn = effectiveOn;
        StatusReason = Required(reason, nameof(reason));
    }

    public void Terminate(string reason, DateOnly terminationDate)
    {
        if (Status is not (EmployeeStatus.Active or EmployeeStatus.Suspended))
            ThrowInvalidTransition(EmployeeStatus.Terminated);

        EnsureEffectiveDate(terminationDate);

        Status = EmployeeStatus.Terminated;
        StatusEffectiveOn = terminationDate;
        TerminationDate = terminationDate;
        StatusReason = Required(reason, nameof(reason));
    }

    private void EnsureStatus(EmployeeStatus expected)
    {
        if (Status != expected)
            ThrowInvalidTransition(expected);
    }

    private void EnsureEffectiveDate(DateOnly effectiveOn)
    {
        if (effectiveOn < HireDate ||
            StatusEffectiveOn.HasValue && effectiveOn < StatusEffectiveOn.Value)
        {
            throw new DomainRuleException(
                "Employees.Employee.InvalidEffectiveDate",
                "A status change cannot precede the hire date or the previous status change.");
        }
    }

    private void ThrowInvalidTransition(EmployeeStatus target) =>
        throw new DomainRuleException(
            "Employees.Employee.InvalidStatusTransition",
            $"The employee cannot move from {Status} to {target}.");
}