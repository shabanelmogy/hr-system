using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Enums;

namespace HrManagementSystem.Application.Features.OrganizationalStructure.Management.Contracts;

public sealed record OrganizationalStructureMutation(
    string Code,
    string NameEn,
    string NameAr,
    string? DescriptionEn = null,
    string? DescriptionAr = null,
    int? BranchId = null,
    int? ParentDepartmentId = null,
    int? DepartmentId = null,
    int? DivisionId = null,
    int? JobTitleId = null,
    int? JobLevelId = null,
    int? PositionId = null,
    int? ManagerId = null,
    string? CostCenterCode = null,
    string? TimeZoneId = null,
    DateOnly? OpenedOn = null,
    string? Email = null,
    string? Phone = null,
    bool IsHeadquarters = false,
    int? LevelOrder = null,
    decimal? MinSalary = null,
    decimal? MaxSalary = null,
    string? CurrencyCode = null,
    bool CanManageOthers = false,
    bool IsManagementLevel = false,
    int? TargetHeadcount = null,
    string? Version = null,
    string? PurposeEn = null,
    string? PurposeAr = null,
    string? ResponsibilitiesEn = null,
    string? ResponsibilitiesAr = null,
    string? RequirementsEn = null,
    string? RequirementsAr = null,
    string? PreferredQualificationsEn = null,
    string? PreferredQualificationsAr = null,
    string? RequiredSkills = null,
    string? RequiredEducation = null,
    int? MinExperienceYears = null,
    string? RevisionNotes = null,
    IEnumerable<JobDutySection>? DutySections = null,
    IEnumerable<JobSkillItem>? Skills = null,
    IEnumerable<JobEducationRequirement>? EducationRequirements = null,
    int? ParentCostCenterId = null,
    string? Symbol = null,
    decimal? ExchangeRateToDefault = null,
    bool IsDefault = false);

public sealed record OrganizationalStructureItem
{
    public int Id { get; init; }
    public string Resource { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string NameEn { get; init; } = string.Empty;
    public string NameAr { get; init; } = string.Empty;
    public bool IsDeleted { get; init; }
    public DateTime CreatedOn { get; init; }
    public DateTime? UpdatedOn { get; init; }
    public string? DescriptionEn { get; init; }
    public string? DescriptionAr { get; init; }
    public int? BranchId { get; init; }
    public string? BranchNameEn { get; init; }
    public string? BranchNameAr { get; init; }
    public int? ParentDepartmentId { get; init; }
    public string? ParentNameEn { get; init; }
    public string? ParentNameAr { get; init; }
    public int? DepartmentId { get; init; }
    public string? DepartmentNameEn { get; init; }
    public string? DepartmentNameAr { get; init; }
    public int? DivisionId { get; init; }
    public string? DivisionNameEn { get; init; }
    public string? DivisionNameAr { get; init; }
    public int? JobTitleId { get; init; }
    public string? JobTitleNameEn { get; init; }
    public string? JobTitleNameAr { get; init; }
    public int? JobLevelId { get; init; }
    public string? JobLevelNameEn { get; init; }
    public string? JobLevelNameAr { get; init; }
    public int? PositionId { get; init; }
    public string? PositionCode { get; init; }
    public int? ManagerId { get; init; }
    public string? CostCenterCode { get; init; }
    public string? TimeZoneId { get; init; }
    public DateOnly? OpenedOn { get; init; }
    public DateOnly? ClosedOn { get; init; }
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public bool IsHeadquarters { get; init; }
    public bool IsOperationallyActive { get; init; } = true;
    public int? LevelOrder { get; init; }
    public decimal? MinSalary { get; init; }
    public decimal? MaxSalary { get; init; }
    public string? CurrencyCode { get; init; }
    public bool CanManageOthers { get; init; }
    public bool IsManagementLevel { get; init; }
    public int? TargetHeadcount { get; init; }
    public string? Version { get; init; }
    public string? PurposeEn { get; init; }
    public string? PurposeAr { get; init; }
    public string? ResponsibilitiesEn { get; init; }
    public string? ResponsibilitiesAr { get; init; }
    public string? RequirementsEn { get; init; }
    public string? RequirementsAr { get; init; }
    public string? PreferredQualificationsEn { get; init; }
    public string? PreferredQualificationsAr { get; init; }
    public string? RequiredSkills { get; init; }
    public string? RequiredEducation { get; init; }
    public int? MinExperienceYears { get; init; }
    public string? RevisionNotes { get; init; }
    public JobDescriptionStatus? JobDescriptionStatus { get; init; }
    public DateOnly? EffectiveDate { get; init; }
    public DateOnly? ExpiryDate { get; init; }
    public string? ApprovedByUserId { get; init; }
    public DateTimeOffset? DecisionOn { get; init; }
    public string? DecisionReason { get; init; }
    public bool IsCentralized { get; init; }
    public IReadOnlyList<JobDutySection> DutySections { get; init; } = [];
    public IReadOnlyList<JobSkillItem> Skills { get; init; } = [];
    public IReadOnlyList<JobEducationRequirement> EducationRequirements { get; init; } = [];
    public int? ParentCostCenterId { get; init; }
    public string? Symbol { get; init; }
    public decimal? ExchangeRateToDefault { get; init; }
    public bool IsDefault { get; init; }
}

public sealed record OrganizationalStructureLookup(int Id, string Code, string NameEn, string NameAr);

public sealed record OrganizationalStructureBulkCreateRequest(IReadOnlyList<OrganizationalStructureMutation> Items);
public sealed record OrganizationalStructureBulkCreateResponse(int CreatedCount);

public sealed record ApproveJobDescriptionRequest(DateOnly EffectiveDate, DateOnly? ExpiryDate);
public sealed record RejectJobDescriptionRequest(string Reason);
public sealed record OrganizationalStructureChange(
    string Resource,
    int? EntityId,
    string Action,
    string? NameEn,
    string? NameAr,
    string? ActorUserId,
    Guid OperationId);
