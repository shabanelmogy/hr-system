using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.WorkforcePlanning.Entities;
using HrManagementSystem.Domain.WorkforcePlanning.Enums;

namespace HrManagementSystem.Tests;

public sealed class WorkforcePlanDomainTests
{
    [Fact]
    public void Submit_RequiresEachVacancyTypePeriodTotalToMatchTheLine()
    {
        var plan = CreatePlan();
        var line = plan.AddLine(10, null, 20, 30, 2, new DateOnly(2027, 1, 1), 2, 1, "Growth and replacement");
        line.AddPeriodTarget(100, 1, 2);

        var exception = Assert.Throws<DomainRuleException>(() => plan.Submit(DateTimeOffset.UtcNow, "planner"));

        Assert.Equal("WorkforcePlan.PeriodTotalsMismatch", exception.Code);
        Assert.Equal(WorkforcePlanStatus.Draft, plan.Status);
    }

    [Fact]
    public void Line_DerivesTotalsFromCurrentEmployeesAndVacancyTypes()
    {
        var plan = CreatePlan();

        var line = plan.AddLine(10, null, 20, 30, 5, new DateOnly(2027, 1, 1), 2, 1, null);

        Assert.Equal(7, line.TargetHeadcount);
        Assert.Equal(3, line.PlannedHiringSlots);
        Assert.Equal(2, line.NewHireSlots);
        Assert.Equal(1, line.ReplacementSlots);
    }

    [Fact]
    public void ApprovedPlan_RejectsSelfApproval()
    {
        var plan = CreatePlan();
        plan.CreatedById = "planner";
        var line = plan.AddLine(10, null, 20, 30, 2, new DateOnly(2027, 1, 1), 2, 0, null);
        line.AddPeriodTarget(100, 2, 0);
        plan.Submit(DateTimeOffset.UtcNow, "planner");
        plan.BeginReview();

        var exception = Assert.Throws<DomainRuleException>(() => plan.Approve(DateTimeOffset.UtcNow, "planner", true));

        Assert.Equal("WorkforcePlan.SelfApproval", exception.Code);
        Assert.Equal(WorkforcePlanStatus.UnderReview, plan.Status);
    }

    [Fact]
    public void Approve_AllowsSelfApprovalWhenExplicitlyPermitted()
    {
        var plan = CreatePlan();
        plan.CreatedById = "planner";
        var line = plan.AddLine(10, null, 20, 30, 2, new DateOnly(2027, 1, 1), 2, 0, null);
        line.AddPeriodTarget(100, 2, 0);
        plan.Submit(DateTimeOffset.UtcNow, "planner");
        plan.BeginReview();

        plan.Approve(DateTimeOffset.UtcNow, "planner", true, allowSelfApproval: true);

        Assert.Equal(WorkforcePlanStatus.Approved, plan.Status);
        Assert.Equal("planner", plan.ApprovedById);
    }

    [Fact]
    public void Approve_RequiresThePlanToEnterReviewFirst()
    {
        var plan = CreateSubmittablePlan();
        plan.Submit(DateTimeOffset.UtcNow, "planner");

        var exception = Assert.Throws<DomainRuleException>(() =>
            plan.Approve(DateTimeOffset.UtcNow, "approver", true));

        Assert.Equal("WorkforcePlan.InvalidStatusTransition", exception.Code);
        Assert.Equal(WorkforcePlanStatus.Submitted, plan.Status);
    }

    [Fact]
    public void BeginReview_ThenApprove_CompletesTheControlledLifecycle()
    {
        var plan = CreateSubmittablePlan();
        plan.CreatedById = "planner";
        plan.Submit(DateTimeOffset.UtcNow, "planner");

        plan.BeginReview();
        plan.Approve(DateTimeOffset.UtcNow, "approver", true);

        Assert.Equal(WorkforcePlanStatus.Approved, plan.Status);
        Assert.Equal("approver", plan.ApprovedById);
    }

    [Fact]
    public void Reject_RequiresThePlanToBeUnderReview()
    {
        var plan = CreateSubmittablePlan();
        plan.Submit(DateTimeOffset.UtcNow, "planner");

        var exception = Assert.Throws<DomainRuleException>(() =>
            plan.Reject(DateTimeOffset.UtcNow, "reviewer", "Needs correction"));

        Assert.Equal("WorkforcePlan.InvalidStatusTransition", exception.Code);
        Assert.Equal(WorkforcePlanStatus.Submitted, plan.Status);
    }

    [Fact]
    public void Line_CannotContainTheSameFiscalPeriodTwice()
    {
        var plan = CreatePlan();
        var line = plan.AddLine(10, null, 20, 30, 0, new DateOnly(2027, 1, 1), 1, 0, null);
        line.AddPeriodTarget(100, 1, 0);

        var exception = Assert.Throws<DomainRuleException>(() => line.AddPeriodTarget(100, 0, 0));

        Assert.Equal("WorkforcePlan.DuplicatePeriodTarget", exception.Code);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public void ArchiveAndRestore_AreAllowedOnlyForEditableLifecycleStates(bool rejected)
    {
        var plan = CreateSubmittablePlan();
        if (rejected)
        {
            plan.Submit(DateTimeOffset.UtcNow, "planner");
            plan.BeginReview();
            plan.Reject(DateTimeOffset.UtcNow, "reviewer", "Needs changes");
        }

        plan.EnsureCanArchive();
        plan.IsDeleted = true;
        plan.EnsureCanRestore();
    }

    [Fact]
    public void ApprovedPlan_CannotBeArchivedOrRestored()
    {
        var plan = CreateSubmittablePlan();
        plan.CreatedById = "planner";
        plan.Submit(DateTimeOffset.UtcNow, "planner");
        plan.BeginReview();
        plan.Approve(DateTimeOffset.UtcNow, "approver", true);

        var archive = Assert.Throws<DomainRuleException>(plan.EnsureCanArchive);
        plan.IsDeleted = true;
        var restore = Assert.Throws<DomainRuleException>(plan.EnsureCanRestore);

        Assert.Equal("WorkforcePlan.NotArchivable", archive.Code);
        Assert.Equal("WorkforcePlan.NotRestorable", restore.Code);
    }

    private static WorkforcePlan CreatePlan() => new(
        "WP-2027",
        1,
        "Workforce plan",
        "خطة القوى العاملة",
        null);

    private static WorkforcePlan CreateSubmittablePlan()
    {
        var plan = CreatePlan();
        var line = plan.AddLine(10, null, 20, 30, 2, new DateOnly(2027, 1, 1), 2, 0, null);
        line.AddPeriodTarget(100, 2, 0);
        return plan;
    }
}
