using HrManagementSystem.Domain.Common.Abstractions;

namespace HrManagementSystem.Domain.Employees.Entities;

public class Employee : ICompanyScoped
{
    public string TenantId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public int Id { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
}
