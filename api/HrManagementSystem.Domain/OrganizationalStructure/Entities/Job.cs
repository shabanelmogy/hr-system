using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Job : CompanyAuditableEntity
{
    public int Id { get; set; }
    public string TitleEn { get; set; } = null!;
    public string TitleAr { get; set; } = null!;
    public string JobCode { get; set; } = string.Empty;
    public int DivisionId { get; set; }
    public Division Division { get; set; } = null!;
    public int JobLevelId { get; set; }
    public JobLevel JobLevel { get; set; } = null!;
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public string? CurrencyCode { get; set; }
    public string EmploymentType { get; set; } = "Full-time";
    public bool IsRemoteEligible { get; set; }
    public decimal? StandardWeeklyHours { get; set; }
    public int EmployeeCountTarget { get; set; }
    public int EmployeeCountExists { get; set; }
    public int EmployeeCountNeeded { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Employee> Employees { get; set; } = [];
    public ICollection<JobDescription> JobDescriptions { get; set; } = [];
}
