using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.BuildingBlocks.Domain.Exceptions;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.Employees.Entities;

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
        int? divisionId = null,
        int? reportsToPositionId = null)
    {
        EmployeeId = Positive(employeeId, nameof(employeeId));
        PositionId = Positive(positionId, nameof(positionId));
        BranchId = Positive(branchId, nameof(branchId));
        DepartmentId = Positive(departmentId, nameof(departmentId));
        DivisionId = PositiveOrNull(divisionId, nameof(divisionId));
        ReportsToPositionId = PositiveOrNull(reportsToPositionId, nameof(reportsToPositionId));
        EffectiveFrom = effectiveFrom;
        IsPrimary = isPrimary;
    }

    /// <summary>
    /// Creates an assignment for a not-yet-persisted employee. EF fixes the
    /// temporary foreign key when the assignment is attached through the
    /// employee's Assignments collection in the same unit of work.
    /// </summary>
    public static EmployeeAssignment ForPendingEmployee(
        int positionId,
        int branchId,
        int departmentId,
        DateOnly effectiveFrom,
        bool isPrimary,
        int? divisionId = null)
    {
        var assignment = new EmployeeAssignment
        {
            EmployeeId = 0,
            PositionId = Positive(positionId, nameof(positionId)),
            BranchId = Positive(branchId, nameof(branchId)),
            DepartmentId = Positive(departmentId, nameof(departmentId)),
            DivisionId = PositiveOrNull(divisionId, nameof(divisionId)),
            EffectiveFrom = effectiveFrom,
            IsPrimary = isPrimary,
        };
        return assignment;
    }

    public int Id { get; private set; }
    public int EmployeeId { get; private set; }
    public int PositionId { get; private set; }
    public int BranchId { get; private set; }
    public int DepartmentId { get; private set; }
    public int? DivisionId { get; private set; }
    public int? ReportsToPositionId { get; private set; }
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public bool IsPrimary { get; private set; }

    public void SetReportsToPosition(int? reportsToPositionId) =>
        ReportsToPositionId = PositiveOrNull(reportsToPositionId, nameof(reportsToPositionId));

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
