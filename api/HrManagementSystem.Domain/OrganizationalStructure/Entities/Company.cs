using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Company : TenantAuditableEntity
{
    public int Id { get; set; }
    public string CompanyCode { get; set; } = string.Empty;
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string? LegalName { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? TaxNumber { get; set; }
    public string DefaultCurrencyCode { get; set; } = "USD";
    public string TimeZoneId { get; set; } = "UTC";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Logo { get; set; }
    public string? Background { get; set; }
    public int? AddressId { get; set; }
    public int EmployeeCountTarget { get; set; }
    public int EmployeeCountExists { get; set; }
    public int EmployeeCountNeeded { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Branch> Branches { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];
}
