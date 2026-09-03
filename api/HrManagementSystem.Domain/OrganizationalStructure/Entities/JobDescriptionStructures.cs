namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

/// <summary>
/// Represents a structured responsibility / Key Result Area (KRA) section with weight percentage and individual items.
/// </summary>
public sealed class JobDutySection
{
    public string SectionTitleEn { get; set; } = string.Empty;
    public string SectionTitleAr { get; set; } = string.Empty;
    public int? WeightPercentage { get; set; }
    public List<JobDutyItem> Items { get; set; } = [];
}

/// <summary>
/// Represents an individual actionable duty or responsibility within a section.
/// </summary>
public sealed class JobDutyItem
{
    public string TextEn { get; set; } = string.Empty;
    public string TextAr { get; set; } = string.Empty;
    public int Order { get; set; }
}

/// <summary>
/// Represents a required or preferred skill with a target proficiency level for recruitment and appraisals.
/// </summary>
public sealed class JobSkillItem
{
    public string SkillName { get; set; } = string.Empty;
    public string ProficiencyLevel { get; set; } = "Intermediate";
    public bool IsMandatory { get; set; } = true;
}

/// <summary>
/// Represents structured educational qualifications or certifications required for the position.
/// </summary>
public sealed class JobEducationRequirement
{
    public string DegreeLevel { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public bool IsRequired { get; set; } = true;
}
