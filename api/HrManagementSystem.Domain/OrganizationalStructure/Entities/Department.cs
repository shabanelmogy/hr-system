using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Department : CompanyAuditableEntity
{
    public int Id { get; set; }
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string DepartmentCode { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public string? DescriptionAr { get; set; }
    public string? CostCenterCode { get; set; }
    public int? ParentDepartmentId { get; set; }
    public Department? ParentDepartment { get; set; }
    public ICollection<Department> ChildDepartments { get; set; } = [];
    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Division> Divisions { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];
}
