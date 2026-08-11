using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Employees.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Employees.Entities;

public class EmployeeContract : CompanyAuditableEntity
{
    private EmployeeContract()
    {
    }

    public EmployeeContract(
        int employeeId,
        string contractNumber,
        EmployeeContractType contractType,
        DateOnly startDate,
        DateOnly? endDate)
    {
        if (endDate.HasValue && endDate.Value < startDate)
            throw new ArgumentException("The contract end date cannot precede its start date.", nameof(endDate));

        EmployeeId = Positive(employeeId, nameof(employeeId));
        ContractNumber = Required(contractNumber, nameof(contractNumber)).ToUpperInvariant();
        ContractType = Defined(contractType, nameof(contractType));
        StartDate = startDate;
        EndDate = endDate;
    }

    public int Id { get; private set; }
    public int EmployeeId { get; private set; }
    public string ContractNumber { get; private set; } = string.Empty;
    public EmployeeContractType ContractType { get; private set; }
    public DateOnly StartDate { get; private set; }
    public DateOnly? EndDate { get; private set; }
    public EmployeeContractStatus Status { get; private set; } = EmployeeContractStatus.Draft;
    public DateOnly? StatusEffectiveOn { get; private set; }
    public string? StatusReason { get; private set; }

    public void Activate(DateOnly effectiveOn)
    {
        if (Status != EmployeeContractStatus.Draft ||
            effectiveOn < StartDate ||
            EndDate.HasValue && effectiveOn > EndDate.Value)
            ThrowInvalidTransition(EmployeeContractStatus.Active);

        Status = EmployeeContractStatus.Active;
        StatusEffectiveOn = effectiveOn;
    }

    public void Expire(DateOnly expiredOn)
    {
        if (Status != EmployeeContractStatus.Active ||
            !EndDate.HasValue ||
            expiredOn < EndDate.Value)
        {
            ThrowInvalidTransition(EmployeeContractStatus.Expired);
        }

        Status = EmployeeContractStatus.Expired;
        StatusEffectiveOn = expiredOn;
    }

    public void Terminate(string reason, DateOnly terminatedOn)
    {
        if (Status != EmployeeContractStatus.Active || terminatedOn < StartDate)
            ThrowInvalidTransition(EmployeeContractStatus.Terminated);

        Status = EmployeeContractStatus.Terminated;
        StatusEffectiveOn = terminatedOn;
        StatusReason = Required(reason, nameof(reason));
    }

    private void ThrowInvalidTransition(EmployeeContractStatus target) =>
        throw new DomainRuleException(
            "Employees.EmployeeContract.InvalidStatusTransition",
            $"The contract cannot move from {Status} to {target}.");
}
