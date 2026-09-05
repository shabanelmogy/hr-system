using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Recruitment.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class Interview : CompanyAuditableEntity
{
    private readonly List<InterviewParticipant> _participants = [];
    private readonly List<InterviewEvaluation> _evaluations = [];

    private Interview()
    {
    }

    public Interview(
        int employmentApplicationId,
        InterviewType type,
        DateTimeOffset startsOn,
        DateTimeOffset endsOn,
        string? locationOrMeetingUrl = null)
    {
        EmploymentApplicationId = Positive(employmentApplicationId, nameof(employmentApplicationId));
        ValidateSchedule(startsOn, endsOn);
        Type = Defined(type, nameof(type));
        StartsOn = startsOn;
        EndsOn = endsOn;
        LocationOrMeetingUrl = Optional(locationOrMeetingUrl);
    }

    public int Id { get; private set; }
    public int EmploymentApplicationId { get; private set; }
    public InterviewType Type { get; private set; }
    public InterviewStatus Status { get; private set; } = InterviewStatus.Scheduled;
    public DateTimeOffset StartsOn { get; private set; }
    public DateTimeOffset EndsOn { get; private set; }
    public DateTimeOffset? CompletedOn { get; private set; }
    public string? LocationOrMeetingUrl { get; private set; }
    public string? CancellationReason { get; private set; }
    public IReadOnlyCollection<InterviewParticipant> Participants => _participants.AsReadOnly();
    public IReadOnlyCollection<InterviewEvaluation> Evaluations => _evaluations.AsReadOnly();

    public void AddInterviewer(int employeeId, bool isLead = false)
    {
        EnsureScheduled();
        Positive(employeeId, nameof(employeeId));

        if (_participants.Any(participant => participant.EmployeeId == employeeId))
        {
            throw new DomainRuleException(
                "Recruitment.Interview.InterviewerAlreadyAssigned",
                "The interviewer is already assigned to this interview.");
        }

        var makeLead = isLead || _participants.Count == 0;
        if (makeLead)
        {
            foreach (var participant in _participants)
                participant.SetLead(false);
        }

        _participants.Add(new InterviewParticipant(employeeId, makeLead));
    }

    public void Reschedule(DateTimeOffset startsOn, DateTimeOffset endsOn, string? locationOrMeetingUrl)
    {
        EnsureScheduled();
        ValidateSchedule(startsOn, endsOn);
        StartsOn = startsOn;
        EndsOn = endsOn;
        LocationOrMeetingUrl = Optional(locationOrMeetingUrl);
    }

    public void Complete(DateTimeOffset completedOn)
    {
        EnsureScheduled();

        if (_participants.Count == 0)
        {
            throw new DomainRuleException(
                "Recruitment.Interview.InterviewerRequired",
                "At least one interviewer is required before completing an interview.");
        }

        if (completedOn < StartsOn)
        {
            throw new DomainRuleException(
                "Recruitment.Interview.InvalidCompletionTime",
                "The interview cannot be completed before it starts.");
        }

        Status = InterviewStatus.Completed;
        CompletedOn = completedOn;
    }

    public void Cancel(string reason)
    {
        EnsureScheduled();
        var normalizedReason = Required(reason, nameof(reason));
        CancellationReason = normalizedReason;
        Status = InterviewStatus.Cancelled;
    }

    public void MarkNoShow()
    {
        EnsureScheduled();
        Status = InterviewStatus.NoShow;
    }

    public void SubmitEvaluation(
        int interviewerEmployeeId,
        decimal score,
        InterviewRecommendation recommendation,
        string? comments,
        DateTimeOffset submittedOn,
        string? skillEvaluationsJson = null)
    {
        if (Status != InterviewStatus.Completed)
        {
            throw new DomainRuleException(
                "Recruitment.Interview.NotCompleted",
                "Evaluations can only be submitted for completed interviews.");
        }

        if (_participants.All(participant => participant.EmployeeId != interviewerEmployeeId))
        {
            throw new DomainRuleException(
                "Recruitment.Interview.EvaluatorNotAssigned",
                "Only an assigned interviewer can submit an evaluation.");
        }

        if (_evaluations.Any(evaluation => evaluation.InterviewerEmployeeId == interviewerEmployeeId))
        {
            throw new DomainRuleException(
                "Recruitment.Interview.EvaluationAlreadySubmitted",
                "The interviewer has already submitted an evaluation.");
        }

        if (CompletedOn.HasValue && submittedOn < CompletedOn.Value)
        {
            throw new DomainRuleException(
                "Recruitment.Interview.InvalidEvaluationTime",
                "An evaluation cannot be submitted before the interview is completed.");
        }

        _evaluations.Add(new InterviewEvaluation(
            interviewerEmployeeId,
            score,
            Defined(recommendation, nameof(recommendation)),
            comments,
            submittedOn,
            skillEvaluationsJson));
    }

    private void EnsureScheduled()
    {
        if (Status != InterviewStatus.Scheduled)
        {
            throw new DomainRuleException(
                "Recruitment.Interview.NotScheduled",
                $"The operation is not allowed while the interview status is {Status}.");
        }
    }

    private static void ValidateSchedule(DateTimeOffset startsOn, DateTimeOffset endsOn)
    {
        if (endsOn <= startsOn)
        {
            throw new DomainRuleException(
                "Recruitment.Interview.InvalidSchedule",
                "The interview end must be later than its start.");
        }
    }

}
