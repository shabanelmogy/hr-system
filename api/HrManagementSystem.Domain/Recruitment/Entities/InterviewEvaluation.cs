using HrManagementSystem.Domain.Recruitment.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class InterviewEvaluation : CompanyAuditableEntity
{
    private InterviewEvaluation()
    {
    }

    internal InterviewEvaluation(
        int interviewerEmployeeId,
        decimal score,
        InterviewRecommendation recommendation,
        string? comments,
        DateTimeOffset submittedOn,
        string? skillEvaluationsJson = null)
    {
        if (score is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(score), "The score must be between 0 and 100.");

        InterviewerEmployeeId = Positive(interviewerEmployeeId, nameof(interviewerEmployeeId));
        Score = score;
        Recommendation = Defined(recommendation, nameof(recommendation));
        Comments = Optional(comments);
        SubmittedOn = submittedOn;
        SkillEvaluationsJson = skillEvaluationsJson;
    }

    public long Id { get; private set; }
    public int InterviewId { get; private set; }
    public int InterviewerEmployeeId { get; private set; }
    public decimal Score { get; private set; }
    public InterviewRecommendation Recommendation { get; private set; }
    public string? Comments { get; private set; }
    public DateTimeOffset SubmittedOn { get; private set; }
    public string? SkillEvaluationsJson { get; private set; }
}
