using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Employees.Entities;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Department : CompanyAuditableEntity
{
    private Department()
    {
    }

    public Department(
        int? branchId,
        string departmentCode,
        string nameEn,
        string nameAr,
        int? parentDepartmentId = null)
    {
        BranchId = PositiveOrNull(branchId, nameof(branchId));
        UpdateIdentity(departmentCode, nameEn, nameAr);
        ChangeParent(parentDepartmentId);
    }

    public int Id { get; private set; }
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string DepartmentCode { get; private set; } = string.Empty;
    public string? DescriptionEn { get; private set; }
    public string? DescriptionAr { get; private set; }
    public string? CostCenterCode { get; private set; }
    public int? ParentDepartmentId { get; private set; }
    public Department? ParentDepartment { get; private set; }
    public ICollection<Department> ChildDepartments { get; private set; } = [];
    public int? BranchId { get; private set; }
    public Branch? Branch { get; private set; }
    public bool IsCentralized => !BranchId.HasValue;
    public int? ManagerId { get; private set; }
    public Employee? Manager { get; private set; }

    public ICollection<Division> Divisions { get; private set; } = [];
    public ICollection<Employee> Employees { get; private set; } = [];

    public void UpdateIdentity(string departmentCode, string nameEn, string nameAr)
    {
        DepartmentCode = Required(departmentCode, nameof(departmentCode)).ToUpperInvariant();
        NameEn = Required(nameEn, nameof(nameEn));
        NameAr = Required(nameAr, nameof(nameAr));
    }

    public void UpdateDetails(
        string? descriptionEn,
        string? descriptionAr,
        string? costCenterCode,
        int? managerId)
    {
        DescriptionEn = Optional(descriptionEn);
        DescriptionAr = Optional(descriptionAr);
        CostCenterCode = Optional(costCenterCode)?.ToUpperInvariant();
        ManagerId = PositiveOrNull(managerId, nameof(managerId));
    }

    public void MoveToBranch(int? branchId) =>
        BranchId = PositiveOrNull(branchId, nameof(branchId));

    public void ChangeParent(int? parentDepartmentId)
    {
        var parentId = PositiveOrNull(parentDepartmentId, nameof(parentDepartmentId));
        if (Id > 0 && parentId == Id)
        {
            throw new DomainRuleException(
                "Organization.Department.RecursiveHierarchy",
                "A department cannot be its own parent.");
        }

        ParentDepartmentId = parentId;
    }
}
