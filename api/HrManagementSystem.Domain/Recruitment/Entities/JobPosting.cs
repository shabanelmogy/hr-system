using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Recruitment.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class JobPosting : CompanyAuditableEntity
{
    private JobPosting()
    {
    }

    public JobPosting(
        int jobOpeningId,
        string slug,
        JobPostingAudience audience,
        string titleEn,
        string titleAr)
    {
        PublicId = Guid.NewGuid();
        JobOpeningId = Positive(jobOpeningId, nameof(jobOpeningId));
        Slug = Required(slug, nameof(slug));
        Audience = Defined(audience, nameof(audience));
        TitleEn = Required(titleEn, nameof(titleEn));
        TitleAr = Required(titleAr, nameof(titleAr));
    }

    public int Id { get; private set; }
    public Guid PublicId { get; private set; }
    public int JobOpeningId { get; private set; }
    public string Slug { get; private set; } = string.Empty;
    public JobPostingAudience Audience { get; private set; }
    public string TitleEn { get; private set; } = string.Empty;
    public string TitleAr { get; private set; } = string.Empty;
    public string? DescriptionEn { get; private set; }
    public string? DescriptionAr { get; private set; }
    public string? ResponsibilitiesEn { get; private set; }
    public string? ResponsibilitiesAr { get; private set; }
    public string? RequirementsEn { get; private set; }
    public string? RequirementsAr { get; private set; }
    public string? LocationTextEn { get; private set; }
    public string? LocationTextAr { get; private set; }
    public JobPostingStatus Status { get; private set; } = JobPostingStatus.Draft;
    public DateTimeOffset? ScheduledPublishOn { get; private set; }
    public DateTimeOffset? PublishedOn { get; private set; }
    public DateTimeOffset? ClosesOn { get; private set; }
    public DateTimeOffset? ClosedOn { get; private set; }

    public void UpdateContent(
        string titleEn,
        string titleAr,
        string? descriptionEn,
        string? descriptionAr,
        string? responsibilitiesEn,
        string? responsibilitiesAr,
        string? requirementsEn,
        string? requirementsAr,
        string? locationTextEn,
        string? locationTextAr,
        JobPostingAudience audience)
    {
        if (Status == JobPostingStatus.Archived)
            ThrowInvalidTransition(JobPostingStatus.Draft);

        var normalizedTitleEn = Required(titleEn, nameof(titleEn));
        var normalizedTitleAr = Required(titleAr, nameof(titleAr));
        var normalizedAudience = Defined(audience, nameof(audience));

        TitleEn = normalizedTitleEn;
        TitleAr = normalizedTitleAr;
        DescriptionEn = Optional(descriptionEn);
        DescriptionAr = Optional(descriptionAr);
        ResponsibilitiesEn = Optional(responsibilitiesEn);
        ResponsibilitiesAr = Optional(responsibilitiesAr);
        RequirementsEn = Optional(requirementsEn);
        RequirementsAr = Optional(requirementsAr);
        LocationTextEn = Optional(locationTextEn);
        LocationTextAr = Optional(locationTextAr);
        Audience = normalizedAudience;
    }

    public void Schedule(DateTimeOffset publishOn, DateTimeOffset? closesOn = null)
    {
        EnsureDraftOrScheduled();
        ValidateClosingDate(publishOn, closesOn);
        ScheduledPublishOn = publishOn;
        ClosesOn = closesOn;
        Status = JobPostingStatus.Scheduled;
    }

    public void Publish(DateTimeOffset publishedOn, DateTimeOffset? closesOn = null)
    {
        if (Status is not (JobPostingStatus.Draft or JobPostingStatus.Scheduled))
            ThrowInvalidTransition(JobPostingStatus.Published);

        if (ScheduledPublishOn.HasValue && publishedOn < ScheduledPublishOn.Value)
        {
            throw new DomainRuleException(
                "Recruitment.JobPosting.ScheduledTimeNotReached",
                "A scheduled posting cannot be published before its scheduled time.");
        }

        ValidateClosingDate(publishedOn, closesOn ?? ClosesOn);
        PublishedOn = publishedOn;
        ScheduledPublishOn = null;
        ClosesOn = closesOn ?? ClosesOn;
        ClosedOn = null;
        Status = JobPostingStatus.Published;
    }

    public void Close(DateTimeOffset closedOn)
    {
        if (Status is not (JobPostingStatus.Published or JobPostingStatus.Scheduled))
            ThrowInvalidTransition(JobPostingStatus.Closed);

        var startsOn = PublishedOn ?? ScheduledPublishOn;
        if (startsOn.HasValue && closedOn < startsOn.Value)
        {
            throw new DomainRuleException(
                "Recruitment.JobPosting.InvalidCloseTime",
                "The close time cannot be earlier than the publish time.");
        }

        ClosedOn = closedOn;
        Status = JobPostingStatus.Closed;
    }

    public void Archive()
    {
        if (Status != JobPostingStatus.Closed)
            ThrowInvalidTransition(JobPostingStatus.Archived);

        Status = JobPostingStatus.Archived;
    }

    public bool IsVisibleAt(DateTimeOffset instant) =>
        Status == JobPostingStatus.Published &&
        PublishedOn <= instant &&
        (!ClosesOn.HasValue || ClosesOn > instant);

    private void EnsureDraftOrScheduled()
    {
        if (Status is not (JobPostingStatus.Draft or JobPostingStatus.Scheduled))
            ThrowInvalidTransition(JobPostingStatus.Scheduled);
    }

    private static void ValidateClosingDate(DateTimeOffset startsOn, DateTimeOffset? closesOn)
    {
        if (closesOn <= startsOn)
        {
            throw new DomainRuleException(
                "Recruitment.JobPosting.InvalidClosingDate",
                "The closing date must be later than the publishing date.");
        }
    }

    private void ThrowInvalidTransition(JobPostingStatus target) =>
        throw new DomainRuleException(
            "Recruitment.JobPosting.InvalidStatusTransition",
            $"The job posting cannot move from {Status} to {target}.");

}
