namespace HrManagementSystem.Features.OrganizationalStructure.Entities;

public class Job : AuditableEntity
{
    public int Id { get; set; }

    // Basic Information
    public string TitleEn { get; set; } = null!;
    public string TitleAr { get; set; } = null!;
    public string JobCode { get; set; } = string.Empty;

    // Division Relationship
    public int DivisionId { get; set; }
    public Divsion Division { get; set; } = null!;

    // Job Level Relationship
    public int JobLevelId { get; set; }
    public JobLevel JobLevel { get; set; } = null!;

    // Compensation
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public string? CurrencyCode { get; set; }

    // Work Details
    public string EmploymentType { get; set; } = "Full-time"; // Full-time, Part-time, Contract
    public bool IsRemoteEligible { get; set; } = false;

    //Employee Count Target and exists and needed to be added
    public int EmployeeCountTarget { get; set; }
    public int EmployeeCountExists { get; set; }
    public int EmployeeCountNeeded { get; set; }

    // Status
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual ICollection<Employee> Employees { get; set; } = [];
    public virtual ICollection<JobDescription> JobDescriptions { get; set; } = [];
}
