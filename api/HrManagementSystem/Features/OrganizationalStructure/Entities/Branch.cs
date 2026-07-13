using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;

namespace HrManagementSystem.Features.OrganizationalStructure.Entities;
public class Branch : AuditableEntity
{
    public int Id { get; set; }

    // Basic Information
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string BranchCode { get; set; } = string.Empty;

    // Company Relationship
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    // Address (using your existing Address entity)
    public int? AddressId { get; set; }
    public Address? Address { get; set; }

    // Contact Information
    public string? Email { get; set; }
    public string? Phone { get; set; }

    // Management
    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }

    // Branch Details
    public bool IsHeadquarters { get; set; } = false;
    public bool IsActive { get; set; } = true;

    //Employee Count Target and exists and needed to be added
    public int EmployeeCountTarget { get; set; }
    public int EmployeeCountExists { get; set; }
    public int EmployeeCountNeeded { get; set; }

    // Navigation Properties
    public virtual ICollection<Department> Departments { get; set; } = [];
    public virtual ICollection<Employee> Employees { get; set; } = [];
}
