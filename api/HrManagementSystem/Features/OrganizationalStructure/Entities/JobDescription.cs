namespace HrManagementSystem.Features.OrganizationalStructure.Entities;

public class JobDescription : AuditableEntity
{
    public int Id { get; set; }

    // Job Relationship
    public int JobId { get; set; }
    public Job Job { get; set; } = null!;

    // Basic Information
    public string Title { get; set; } = null!;
    public string Version { get; set; } = "1.0";

    // Job Content (Multi-language)
    public string? PurposeEn { get; set; }
    public string? PurposeAr { get; set; }

    public string? ResponsibilitiesEn { get; set; }
    public string? ResponsibilitiesAr { get; set; }

    public string? RequirementsEn { get; set; }
    public string? RequirementsAr { get; set; }

    // Skills and Qualifications
    public string? RequiredSkills { get; set; } // JSON array
    public string? RequiredEducation { get; set; }
    public int? MinExperienceYears { get; set; }

    // Status
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; } = false;

    // Dates
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpiryDate { get; set; }

    // Approval
    public int? ApprovedById { get; set; }
    public Employee? ApprovedBy { get; set; }
    public DateTime? ApprovalDate { get; set; }
}
