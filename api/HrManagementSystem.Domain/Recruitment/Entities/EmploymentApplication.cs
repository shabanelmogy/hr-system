using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Recruitment.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class EmploymentApplication : CompanyAuditableEntity
{
    private static readonly IReadOnlyDictionary<ApplicationStatus, ApplicationStatus[]> AllowedTransitions =
        new Dictionary<ApplicationStatus, ApplicationStatus[]>
        {
            [ApplicationStatus.Draft] = [ApplicationStatus.Submitted, ApplicationStatus.Withdrawn],
            [ApplicationStatus.Submitted] =
                [ApplicationStatus.UnderReview, ApplicationStatus.Rejected, ApplicationStatus.Withdrawn],
            [ApplicationStatus.UnderReview] =
                [ApplicationStatus.Shortlisted, ApplicationStatus.Rejected, ApplicationStatus.Withdrawn],
            [ApplicationStatus.Shortlisted] =
                [ApplicationStatus.InterviewScheduled, ApplicationStatus.Rejected, ApplicationStatus.Withdrawn],
            [ApplicationStatus.InterviewScheduled] =
                [ApplicationStatus.Interviewed, ApplicationStatus.Shortlisted, ApplicationStatus.Rejected,
                    ApplicationStatus.Withdrawn],
            [ApplicationStatus.Interviewed] =
                [ApplicationStatus.Shortlisted, ApplicationStatus.OfferIssued, ApplicationStatus.Rejected,
                    ApplicationStatus.Withdrawn],
            [ApplicationStatus.OfferIssued] =
                [ApplicationStatus.OfferAccepted, ApplicationStatus.OfferDeclined, ApplicationStatus.Rejected,
                    ApplicationStatus.Withdrawn],
            [ApplicationStatus.OfferAccepted] =
                [ApplicationStatus.Hired, ApplicationStatus.OfferDeclined, ApplicationStatus.Withdrawn]
        };

    private readonly List<ApplicationStatusHistory> _statusHistory = [];

    private EmploymentApplication()
    {
    }

    public EmploymentApplication(
        int candidateId,
        int jobOpeningId,
        ApplicationSource source,
        DateTimeOffset createdOn,
        int? jobPostingId = null)
    {
        PublicId = Guid.NewGuid();
        CandidateId = Positive(candidateId, nameof(candidateId));
        JobOpeningId = Positive(jobOpeningId, nameof(jobOpeningId));
        JobPostingId = PositiveOrNull(jobPostingId, nameof(jobPostingId));
        Source = Defined(source, nameof(source));
        LastStatusChangedOn = createdOn;
        AddHistory(null, ApplicationStatus.Draft, createdOn, null, null);
    }

    public int Id { get; private set; }
    public Guid PublicId { get; private set; }
    public int CandidateId { get; private set; }
    public int JobOpeningId { get; private set; }
    public int? JobPostingId { get; private set; }
    public int? EmployeeId { get; private set; }
    public ApplicationSource Source { get; private set; }
    public ApplicationStatus Status { get; private set; } = ApplicationStatus.Draft;
    public string? CoverLetter { get; private set; }
    public int? ResumeFileId { get; private set; }
    public decimal? ExpectedSalary { get; private set; }
    public string? ExpectedSalaryCurrencyCode { get; private set; }
    public DateOnly? AvailableFrom { get; private set; }
    public DateTimeOffset? SubmittedOn { get; private set; }
    public DateTimeOffset LastStatusChangedOn { get; private set; }
    public IReadOnlyCollection<ApplicationStatusHistory> StatusHistory => _statusHistory.AsReadOnly();

    public void UpdateDraft(
        string? coverLetter,
        int? resumeFileId,
        decimal? expectedSalary,
        string? expectedSalaryCurrencyCode,
        DateOnly? availableFrom)
    {
        EnsureStatus(ApplicationStatus.Draft);

        var normalizedSalary = NonNegativeOrNull(expectedSalary, nameof(expectedSalary));

        if (expectedSalary.HasValue && string.IsNullOrWhiteSpace(expectedSalaryCurrencyCode))
        {
            throw new DomainRuleException(
                "Recruitment.Application.ExpectedSalaryCurrencyRequired",
                "A currency is required when an expected salary is supplied.");
        }

        var normalizedCurrency = NormalizeCurrencyCodeOrNull(
            expectedSalaryCurrencyCode,
            nameof(expectedSalaryCurrencyCode));
        var normalizedResumeFileId = PositiveOrNull(resumeFileId, nameof(resumeFileId));
        CoverLetter = Optional(coverLetter);
        ResumeFileId = normalizedResumeFileId;
        ExpectedSalary = normalizedSalary;
        ExpectedSalaryCurrencyCode = normalizedCurrency;
        AvailableFrom = availableFrom;
    }

    public void Submit(DateTimeOffset changedOn) =>
        TransitionTo(ApplicationStatus.Submitted, changedOn);

    public void BeginReview(DateTimeOffset changedOn, int changedByEmployeeId) =>
        TransitionTo(ApplicationStatus.UnderReview, changedOn, changedByEmployeeId: changedByEmployeeId);

    public void Shortlist(DateTimeOffset changedOn, int changedByEmployeeId, string? reason = null) =>
        TransitionTo(ApplicationStatus.Shortlisted, changedOn, reason, changedByEmployeeId);

    public void ScheduleInterview(DateTimeOffset changedOn, int changedByEmployeeId) =>
        TransitionTo(ApplicationStatus.InterviewScheduled, changedOn, changedByEmployeeId: changedByEmployeeId);

    public void RecordInterviewCompleted(DateTimeOffset changedOn, int changedByEmployeeId) =>
        TransitionTo(ApplicationStatus.Interviewed, changedOn, changedByEmployeeId: changedByEmployeeId);

    public void RecordOfferIssued(DateTimeOffset changedOn, int changedByEmployeeId) =>
        TransitionTo(ApplicationStatus.OfferIssued, changedOn, changedByEmployeeId: changedByEmployeeId);

    public void RecordOfferAccepted(DateTimeOffset changedOn) =>
        TransitionTo(ApplicationStatus.OfferAccepted, changedOn);

    public void RecordOfferDeclined(string reason, DateTimeOffset changedOn) =>
        TransitionTo(ApplicationStatus.OfferDeclined, changedOn, Required(reason, nameof(reason)));

    public void Reject(string reason, DateTimeOffset changedOn, int changedByEmployeeId) =>
        TransitionTo(
            ApplicationStatus.Rejected,
            changedOn,
            Required(reason, nameof(reason)),
            changedByEmployeeId);

    public void Withdraw(string reason, DateTimeOffset changedOn) =>
        TransitionTo(ApplicationStatus.Withdrawn, changedOn, Required(reason, nameof(reason)));

    public void MarkHired(int employeeId, DateTimeOffset changedOn, int changedByEmployeeId)
    {
        var normalizedEmployeeId = Positive(employeeId, nameof(employeeId));
        TransitionTo(ApplicationStatus.Hired, changedOn, changedByEmployeeId: changedByEmployeeId);
        EmployeeId = normalizedEmployeeId;
    }

    private void TransitionTo(
        ApplicationStatus target,
        DateTimeOffset changedOn,
        string? reason = null,
        int? changedByEmployeeId = null)
    {
        if (changedByEmployeeId <= 0)
            throw new ArgumentOutOfRangeException(nameof(changedByEmployeeId), "The identifier must be positive.");

        if (changedOn < LastStatusChangedOn)
        {
            throw new DomainRuleException(
                "Recruitment.Application.InvalidStatusTime",
                "A status change cannot be older than the previous status change.");
        }

        if (!AllowedTransitions.TryGetValue(Status, out var allowed) || !allowed.Contains(target))
        {
            throw new DomainRuleException(
                "Recruitment.Application.InvalidStatusTransition",
                $"The application cannot move from {Status} to {target}.");
        }

        var previous = Status;
        Status = target;
        LastStatusChangedOn = changedOn;
        SubmittedOn ??= target == ApplicationStatus.Submitted ? changedOn : null;
        AddHistory(previous, target, changedOn, reason, changedByEmployeeId);
    }

    private void AddHistory(
        ApplicationStatus? previous,
        ApplicationStatus target,
        DateTimeOffset changedOn,
        string? reason,
        int? changedByEmployeeId) =>
        _statusHistory.Add(new ApplicationStatusHistory(previous, target, changedOn, reason, changedByEmployeeId));

    private void EnsureStatus(ApplicationStatus expected)
    {
        if (Status != expected)
        {
            throw new DomainRuleException(
                "Recruitment.Application.NotEditable",
                $"The application cannot be edited while its status is {Status}.");
        }
    }

}
