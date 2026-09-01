using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.OrganizationalStructure.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class JobDescription : CompanyAuditableEntity
{
    private JobDescription()
    {
    }

    public JobDescription(int positionId, string titleEn, string titleAr, string version)
    {
        PositionId = Positive(positionId, nameof(positionId));
        TitleEn = Required(titleEn, nameof(titleEn));
        TitleAr = Required(titleAr, nameof(titleAr));
        Version = Required(version, nameof(version)).ToUpperInvariant();
    }

    public int Id { get; private set; }
    public int PositionId { get; private set; }
    public Position Position { get; private set; } = null!;
    public string TitleEn { get; private set; } = string.Empty;
    public string TitleAr { get; private set; } = string.Empty;
    public string Version { get; private set; } = string.Empty;
    public string? PurposeEn { get; private set; }
    public string? PurposeAr { get; private set; }
    public string? ResponsibilitiesEn { get; private set; }
    public string? ResponsibilitiesAr { get; private set; }
    public string? RequirementsEn { get; private set; }
    public string? RequirementsAr { get; private set; }
    public string? PreferredQualificationsEn { get; private set; }
    public string? PreferredQualificationsAr { get; private set; }
    public string? RevisionNotes { get; private set; }
    public string? RequiredSkills { get; private set; }
    public string? RequiredEducation { get; private set; }
    public int? MinExperienceYears { get; private set; }
    public JobDescriptionStatus Status { get; private set; } = JobDescriptionStatus.Draft;
    public DateOnly? EffectiveDate { get; private set; }
    public DateOnly? ExpiryDate { get; private set; }
    public string? ApprovedByUserId { get; private set; }
    public DateTimeOffset? DecisionOn { get; private set; }
    public string? DecisionReason { get; private set; }

    public void UpdateIdentity(int positionId, string titleEn, string titleAr, string version)
    {
        EnsureEditable();
        PositionId = Positive(positionId, nameof(positionId));
        TitleEn = Required(titleEn, nameof(titleEn));
        TitleAr = Required(titleAr, nameof(titleAr));
        Version = Required(version, nameof(version)).ToUpperInvariant();
        MarkEdited();
    }

    public void UpdateContent(
        string? purposeEn,
        string? purposeAr,
        string? responsibilitiesEn,
        string? responsibilitiesAr,
        string? requirementsEn,
        string? requirementsAr,
        string? requiredSkills,
        string? requiredEducation,
        int? minExperienceYears)
    {
        EnsureEditable();
        if (minExperienceYears < 0)
            throw new ArgumentOutOfRangeException(nameof(minExperienceYears));

        PurposeEn = Optional(purposeEn);
        PurposeAr = Optional(purposeAr);
        ResponsibilitiesEn = Optional(responsibilitiesEn);
        ResponsibilitiesAr = Optional(responsibilitiesAr);
        RequirementsEn = Optional(requirementsEn);
        RequirementsAr = Optional(requirementsAr);
        RequiredSkills = Optional(requiredSkills);
        RequiredEducation = Optional(requiredEducation);
        MinExperienceYears = minExperienceYears;
        MarkEdited();
    }

    public void UpdatePreferredQualifications(
        string? preferredQualificationsEn,
        string? preferredQualificationsAr,
        string? revisionNotes)
    {
        EnsureEditable();
        PreferredQualificationsEn = Optional(preferredQualificationsEn);
        PreferredQualificationsAr = Optional(preferredQualificationsAr);
        RevisionNotes = Optional(revisionNotes);
        MarkEdited();
    }

    public void Approve(
        string approvedByUserId,
        DateOnly effectiveDate,
        DateOnly? expiryDate,
        DateTimeOffset approvedOn)
    {
        EnsureDraft();
        EnsureComplete();
        if (expiryDate.HasValue && expiryDate.Value < effectiveDate)
        {
            throw new DomainRuleException(
                "Organization.JobDescription.InvalidEffectivePeriod",
                "The expiry date cannot be earlier than the effective date.");
        }

        ApprovedByUserId = Required(approvedByUserId, nameof(approvedByUserId));
        EffectiveDate = effectiveDate;
        ExpiryDate = expiryDate;
        DecisionOn = approvedOn;
        DecisionReason = null;
        Status = JobDescriptionStatus.Approved;
    }

    public void Reject(string reason, DateTimeOffset rejectedOn)
    {
        EnsureDraft();
        DecisionReason = Required(reason, nameof(reason));
        DecisionOn = rejectedOn;
        Status = JobDescriptionStatus.Rejected;
    }

    public void Expire(DateOnly expiredOn)
    {
        if (Status != JobDescriptionStatus.Approved ||
            !ExpiryDate.HasValue ||
            expiredOn < ExpiryDate.Value)
        {
            throw new DomainRuleException(
                "Organization.JobDescription.CannotExpire",
                "Only an approved job description may expire on or after its expiry date.");
        }

        Status = JobDescriptionStatus.Expired;
    }

    private void EnsureDraft()
    {
        if (Status != JobDescriptionStatus.Draft)
        {
            throw new DomainRuleException(
                "Organization.JobDescription.NotDraft",
                "Only a draft job description can be changed.");
        }
    }

    private void EnsureEditable()
    {
        if (Status is not (JobDescriptionStatus.Draft or JobDescriptionStatus.Rejected))
        {
            throw new DomainRuleException(
                "Organization.JobDescription.NotEditable",
                "Only a draft or rejected job description can be changed.");
        }
    }

    private void MarkEdited()
    {
        if (Status == JobDescriptionStatus.Rejected)
        {
            Status = JobDescriptionStatus.Draft;
            DecisionOn = null;
            DecisionReason = null;
        }
    }

    private void EnsureComplete()
    {
        if (PurposeEn is null || PurposeAr is null ||
            ResponsibilitiesEn is null || ResponsibilitiesAr is null ||
            RequirementsEn is null || RequirementsAr is null)
        {
            throw new DomainRuleException(
                "Organization.JobDescription.Incomplete",
                "Purpose, responsibilities, and requirements are required in both languages before approval.");
        }
    }
}
