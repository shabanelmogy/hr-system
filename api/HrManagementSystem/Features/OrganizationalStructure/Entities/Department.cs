namespace HrManagementSystem.Features.OrganizationalStructure.Entities;
public class Department : AuditableEntity
{
    public int Id { get; set; }

    // Basic Information
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string DepartmentCode { get; set; } = string.Empty;

    // Branch Relationship
    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

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
    public virtual ICollection<Divsion> Divisions { get; set; } = [];
    public virtual ICollection<Employee> Employees { get; set; } = [];
}
