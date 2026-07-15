using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;

using HrManagementSystem.Features.Employees.Entities;

namespace HrManagementSystem.Features.OrganizationalStructure.Entities;

public class Company : AuditableEntity
{
    public int Id { get; set; }

    // Basic Information
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string? LegalName { get; set; }

    // Contact Information
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }

    //Logo And Backgorund
    public string? Logo { get; set; }
    public string? Background { get; set; }

    // Address (using your existing Address entity)
    public int? AddressId { get; set; }
    public Address? Address { get; set; }

    //Employee Count Target and exists and needed to be added
    public int EmployeeCountTarget { get; set; }
    public int EmployeeCountExists { get; set; }
    public int EmployeeCountNeeded { get; set; }

    // Status
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual ICollection<Branch> Branches { get; set; } = [];
    public virtual ICollection<Employee> Employees { get; set; } = [];
}
