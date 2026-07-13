namespace HrManagementSystem.Features.OrganizationalStructure.Entities;

public class JobLevel : AuditableEntity
{
    public int Id { get; set; }

    // Basic Information
    public string NameEn { get; set; } = null!; // Entry Level, Junior, Senior, Manager, Director, etc.
    public string NameAr { get; set; } = null!;
    public string LevelCode { get; set; } = string.Empty; // L1, L2, L3, M1, D1, etc.

    // Hierarchy
    public int LevelOrder { get; set; } // 1 = Entry, 2 = Junior, 3 = Senior, etc.

    // Compensation Range
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public string? CurrencyCode { get; set; }

    // Authority
    public bool CanManageOthers { get; set; } = false;
    public bool IsManagementLevel { get; set; } = false;

    // Status
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual ICollection<Job> Jobs { get; set; } = [];
}
