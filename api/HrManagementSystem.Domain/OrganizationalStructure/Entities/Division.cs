using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Division : CompanyAuditableEntity
{
    public int Id { get; set; }
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string DivisionCode { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public string? DescriptionAr { get; set; }
    public string? CostCenterCode { get; set; }
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }
    public int EmployeeCountTarget { get; set; }
    public int EmployeeCountExists { get; set; }
    public int EmployeeCountNeeded { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Job> Jobs { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];
}
