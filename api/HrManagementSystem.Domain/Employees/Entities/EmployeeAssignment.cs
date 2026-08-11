using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Employees.Entities;

public class EmployeeAssignment : CompanyAuditableEntity
{
    private EmployeeAssignment()
    {
    }

    public EmployeeAssignment(
        int employeeId,
        int positionId,
        int branchId,
        int departmentId,
        DateOnly effectiveFrom,
        bool isPrimary,
        int? divisionId = null)
    {
        EmployeeId = Positive(employeeId, nameof(employeeId));
        PositionId = Positive(positionId, nameof(positionId));
        BranchId = Positive(branchId, nameof(branchId));
        DepartmentId = Positive(departmentId, nameof(departmentId));
        DivisionId = PositiveOrNull(divisionId, nameof(divisionId));
        EffectiveFrom = effectiveFrom;
        IsPrimary = isPrimary;
    }

    public int Id { get; private set; }
    public int EmployeeId { get; private set; }
    public int PositionId { get; private set; }
    public int BranchId { get; private set; }
    public int DepartmentId { get; private set; }
    public int? DivisionId { get; private set; }
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public bool IsPrimary { get; private set; }

    public void End(DateOnly effectiveTo)
    {
        if (EffectiveTo.HasValue)
            return;

        if (effectiveTo < EffectiveFrom)
        {
            throw new DomainRuleException(
                "Employees.Assignment.InvalidEffectivePeriod",
                "An assignment cannot end before it starts.");
        }

        EffectiveTo = effectiveTo;
        IsPrimary = false;
    }
}
