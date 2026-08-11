using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Branch : CompanyAuditableEntity
{
    public int Id { get; set; }
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string BranchCode { get; set; } = string.Empty;
    public string TimeZoneId { get; set; } = "UTC";
    public DateOnly? OpenedOn { get; set; }
    public DateOnly? ClosedOn { get; set; }
    public Company Company { get; set; } = null!;
    public int? AddressId { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }
    public bool IsHeadquarters { get; set; }
    public bool IsActive { get; set; } = true;
    public int EmployeeCountTarget { get; set; }
    public int EmployeeCountExists { get; set; }
    public int EmployeeCountNeeded { get; set; }

    public ICollection<Department> Departments { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];
}
