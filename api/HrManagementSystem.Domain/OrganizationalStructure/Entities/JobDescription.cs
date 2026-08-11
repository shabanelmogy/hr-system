using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class JobDescription : CompanyAuditableEntity
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public Job Job { get; set; } = null!;
    public string TitleEn { get; set; } = null!;
    public string TitleAr { get; set; } = null!;
    public string Version { get; set; } = "1.0";
    public string? PurposeEn { get; set; }
    public string? PurposeAr { get; set; }
    public string? ResponsibilitiesEn { get; set; }
    public string? ResponsibilitiesAr { get; set; }
    public string? RequirementsEn { get; set; }
    public string? RequirementsAr { get; set; }
    public string? PreferredQualificationsEn { get; set; }
    public string? PreferredQualificationsAr { get; set; }
    public string? RevisionNotes { get; set; }
    public string? RequiredSkills { get; set; }
    public string? RequiredEducation { get; set; }
    public int? MinExperienceYears { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; }
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public int? ApprovedById { get; set; }
    public Employee? ApprovedBy { get; set; }
    public DateTime? ApprovalDate { get; set; }
}
