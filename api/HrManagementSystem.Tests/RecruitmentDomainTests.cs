using HrManagementSystem.Domain.Common.Abstractions;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Recruitment.Entities;
using HrManagementSystem.Domain.Recruitment.Enums;

namespace HrManagementSystem.Tests;

public sealed class RecruitmentDomainTests
{
    private static readonly DateTimeOffset Now = new(2026, 8, 11, 8, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Candidate_IsTenantScopedAndCanLinkOnePortalAccount()
    {
        var candidate = new Candidate("  Ali ", " Hassan ", "ALI@EXAMPLE.COM ");

        candidate.LinkPortalAccount("portal-user-1");

        Assert.IsAssignableFrom<ITenantScoped>(candidate);
        Assert.DoesNotContain(typeof(ICompanyScoped), candidate.GetType().GetInterfaces());
        Assert.Equal("Ali Hassan", candidate.FullName);
        Assert.Equal("ali@example.com", candidate.Email);
        Assert.Equal("portal-user-1", candidate.PortalUserId);

        var exception = Assert.Throws<DomainRuleException>(() =>
            candidate.LinkPortalAccount("portal-user-2"));
        Assert.Equal("Recruitment.Candidate.PortalAccountAlreadyLinked", exception.Code);
    }

    [Fact]
    public void Requisition_RequiresBusinessReasonBeforeApprovalFlow()
    {
        var requisition = CreateRequisition();

        var exception = Assert.Throws<DomainRuleException>(() => requisition.Submit(Now));
        Assert.Equal("Recruitment.JobRequisition.BusinessReasonRequired", exception.Code);
        Assert.Equal(JobRequisitionStatus.Draft, requisition.Status);

        requisition.UpdateDetails(
            "Replace a critical vacant position",
            EmploymentType.FullTime,
            WorkArrangement.Hybrid,
            DateOnly.FromDateTime(Now.AddMonths(1).Date));
        requisition.Submit(Now);
        requisition.Approve(20, Now.AddHours(1));

        Assert.Equal(JobRequisitionStatus.Approved, requisition.Status);
        Assert.Equal(20, requisition.ReviewedByEmployeeId);
    }

    [Fact]
    public void Opening_AutomaticallyBecomesFilledAtCapacity()
    {
        var opening = CreateOpening(positionCount: 2);
        opening.Open(Now);

        opening.RegisterHire(Now.AddDays(1));
        Assert.Equal(JobOpeningStatus.Open, opening.Status);
        Assert.Equal(1, opening.AvailablePositions);

        opening.RegisterHire(Now.AddDays(2));
        Assert.Equal(JobOpeningStatus.Filled, opening.Status);
        Assert.Equal(0, opening.AvailablePositions);
        Assert.Equal(Now.AddDays(2), opening.ClosedOn);
    }

    [Fact]
    public void Posting_IsVisibleOnlyInsidePublishedWindow()
    {
        var posting = new JobPosting(
            1,
            "senior-accountant-cairo",
            JobPostingAudience.InternalAndExternal,
            "Senior Accountant",
            "Senior Accountant Arabic");

        posting.Publish(Now, Now.AddDays(10));

        Assert.False(posting.IsVisibleAt(Now.AddMinutes(-1)));
        Assert.True(posting.IsVisibleAt(Now.AddDays(5)));
        Assert.False(posting.IsVisibleAt(Now.AddDays(10)));
    }

    [Fact]
    public void Application_TracksTheCompleteHiringLifecycle()
    {
        var application = new EmploymentApplication(1, 10, ApplicationSource.CareersPortal, Now, 100);

        application.Submit(Now.AddMinutes(1));
        application.BeginReview(Now.AddMinutes(2), 20);
        application.Shortlist(Now.AddMinutes(3), 20);
        application.ScheduleInterview(Now.AddMinutes(4), 20);
        application.RecordInterviewCompleted(Now.AddMinutes(5), 20);
        application.RecordOfferIssued(Now.AddMinutes(6), 20);
        application.RecordOfferAccepted(Now.AddMinutes(7));
        application.MarkHired(50, Now.AddMinutes(8), 20);

        Assert.Equal(ApplicationStatus.Hired, application.Status);
        Assert.Equal(50, application.EmployeeId);
        Assert.Equal(9, application.StatusHistory.Count);
        Assert.Equal(ApplicationStatus.Draft, application.StatusHistory.First().ToStatus);
        Assert.Equal(ApplicationStatus.Hired, application.StatusHistory.Last().ToStatus);
    }

    [Fact]
    public void Application_RejectsSkippedWorkflowStepsWithoutPartialMutation()
    {
        var application = new EmploymentApplication(1, 10, ApplicationSource.Manual, Now);

        var transitionException = Assert.Throws<DomainRuleException>(() =>
            application.BeginReview(Now.AddMinutes(1), 20));
        Assert.Equal("Recruitment.Application.InvalidStatusTransition", transitionException.Code);
        Assert.Equal(ApplicationStatus.Draft, application.Status);

        var hireException = Assert.Throws<DomainRuleException>(() =>
            application.MarkHired(50, Now.AddMinutes(2), 20));
        Assert.Equal("Recruitment.Application.InvalidStatusTransition", hireException.Code);
        Assert.Null(application.EmployeeId);
        Assert.Single(application.StatusHistory);
    }

    [Fact]
    public void Application_RejectsBackdatedStatusChanges()
    {
        var application = new EmploymentApplication(1, 10, ApplicationSource.Manual, Now);
        application.Submit(Now.AddMinutes(2));

        var exception = Assert.Throws<DomainRuleException>(() =>
            application.BeginReview(Now.AddMinutes(1), 20));

        Assert.Equal("Recruitment.Application.InvalidStatusTime", exception.Code);
        Assert.Equal(ApplicationStatus.Submitted, application.Status);
        Assert.Equal(2, application.StatusHistory.Count);
    }

    [Fact]
    public void Interview_RequiresAssignedEvaluatorsAndOneEvaluationPerInterviewer()
    {
        var interview = new Interview(
            1,
            InterviewType.Panel,
            Now.AddDays(1),
            Now.AddDays(1).AddHours(1));
        interview.AddInterviewer(10);
        interview.AddInterviewer(11);
        interview.Complete(Now.AddDays(1).AddHours(1));

        interview.SubmitEvaluation(
            10,
            85,
            InterviewRecommendation.Hire,
            "Good technical fit",
            Now.AddDays(1).AddHours(2));

        var duplicate = Assert.Throws<DomainRuleException>(() =>
            interview.SubmitEvaluation(
                10,
                90,
                InterviewRecommendation.StrongHire,
                null,
                Now.AddDays(1).AddHours(3)));
        Assert.Equal("Recruitment.Interview.EvaluationAlreadySubmitted", duplicate.Code);
        Assert.Single(interview.Evaluations);
        Assert.Single(interview.Participants, participant => participant.IsLead);
    }

    [Fact]
    public void Offer_CannotBeAcceptedAfterExpiry()
    {
        var offer = CreateOffer();
        offer.Issue(Now, Now.AddDays(7));

        var exception = Assert.Throws<DomainRuleException>(() => offer.Accept(Now.AddDays(8)));

        Assert.Equal("Recruitment.JobOffer.Expired", exception.Code);
        Assert.Equal(JobOfferStatus.Issued, offer.Status);
        Assert.Null(offer.RespondedOn);
    }

    [Fact]
    public void Offer_AcceptsAValidCandidateResponse()
    {
        var offer = CreateOffer();
        offer.Issue(Now, Now.AddDays(7));

        offer.Accept(Now.AddDays(2));

        Assert.Equal(JobOfferStatus.Accepted, offer.Status);
        Assert.Equal(Now.AddDays(2), offer.RespondedOn);
    }

    [Fact]
    public void Offer_InvalidTermsDoNotPartiallyChangeTheDraft()
    {
        var offer = CreateOffer();

        Assert.Throws<ArgumentException>(() => offer.UpdateTerms(
            30_000,
            "INVALID",
            PayFrequency.Monthly,
            EmploymentType.FullTime,
            WorkArrangement.OnSite,
            DateOnly.FromDateTime(Now.AddDays(20).Date),
            null));

        Assert.Equal(25_000, offer.BaseSalary);
        Assert.Equal("EGP", offer.CurrencyCode);
        Assert.Equal(WorkArrangement.Hybrid, offer.WorkArrangement);
    }

    [Fact]
    public void Opening_RejectsUndefinedEnumValues()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new JobOpening(
            "OPEN-2026-0002",
            1,
            1,
            2,
            3,
            1,
            (EmploymentType)999,
            WorkArrangement.OnSite));
    }

    private static JobRequisition CreateRequisition() =>
        new("REQ-2026-0001", 1, 2, 3, 10, 2);

    private static JobOpening CreateOpening(int positionCount) =>
        new(
            "OPEN-2026-0001",
            1,
            1,
            2,
            3,
            positionCount,
            EmploymentType.FullTime,
            WorkArrangement.Hybrid);

    private static JobOffer CreateOffer() =>
        new(
            "OFFER-2026-0001",
            1,
            1,
            2,
            3,
            25_000,
            "EGP",
            PayFrequency.Monthly,
            EmploymentType.FullTime,
            WorkArrangement.Hybrid,
            DateOnly.FromDateTime(Now.AddDays(14).Date));
}
