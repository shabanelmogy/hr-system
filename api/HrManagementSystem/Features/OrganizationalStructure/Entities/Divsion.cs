using HrManagementSystem.Features.Employees.Entities;

namespace HrManagementSystem.Features.OrganizationalStructure.Entities;

public class Divsion : AuditableEntity
{
    public int Id { get; set; }

    // Basic Information
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string DivisionCode { get; set; } = string.Empty;

    // Department Relationship
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    // Management
    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }

    //Employee Count Target and exists and needed to be added
    public int EmployeeCountTarget { get; set; }
    public int EmployeeCountExists { get; set; }
    public int EmployeeCountNeeded { get; set; }

    // Status
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual ICollection<Job> Jobs { get; set; } = [];
    public virtual ICollection<Employee> Employees { get; set; } = [];
}
