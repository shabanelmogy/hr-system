using ErpSystem.Modules.HR.Domain.Common.Exceptions;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;

namespace ErpSystem.Tests;

public sealed class WorkforceBudgetDomainTests
{
    [Fact]
    public void StatusValues_AreFrozen()
    {
        Assert.Equal(1, (int)WorkforceBudgetStatus.Draft);
        Assert.Equal(2, (int)WorkforceBudgetStatus.Submitted);
        Assert.Equal(3, (int)WorkforceBudgetStatus.Approved);
        Assert.Equal(4, (int)WorkforceBudgetStatus.Rejected);
        Assert.Equal(5, (int)WorkforceBudgetStatus.Superseded);
        Assert.Equal(6, (int)WorkforceBudgetStatus.Closed);
    }

    [Fact]
    public void Constructor_NormalizesCodeCurrencyAndPolicy()
    {
        var budget = new WorkforceBudget("wb-2027-001", 9, 4, 2, "egp");

        Assert.Equal("WB-2027-001", budget.BudgetCode);
        Assert.Equal("EGP", budget.CurrencyCode);
        Assert.Equal("2026-09-V1", budget.CalculationPolicyVersion);
        Assert.Equal(WorkforceBudgetStatus.Draft, budget.Status);
    }

    [Fact]
    public void Submit_RequiresEveryCategoryToReconcileIndependently()
    {
        var budget = CreateBudget();
        var line = budget.AddLine(11, 10, 2, 3, 4, 2, 120000m, 8000m);
        line.AddPeriodAllocation(100, 2, 60000m, 8000m);

        var exception = Assert.Throws<DomainRuleException>(() => budget.Submit(DateTimeOffset.UtcNow, "planner"));

        Assert.Equal("WorkforceBudget.SalaryMismatch", exception.Code);
        Assert.Equal(WorkforceBudgetStatus.Draft, budget.Status);
    }

    [Fact]
    public void Line_DerivesTotalsFromAllocations()
    {
        var budget = CreateBudget();
        var line = budget.AddLine(11, 10, 2, 3, 4, 2, 120000m, 8000m);
        line.AddPeriodAllocation(100, 1, 60000m, 4000m);
        line.AddPeriodAllocation(101, 1, 60000m, 4000m);

        Assert.Equal(128000m, line.TotalAllocatedBudget);
        Assert.Equal(4, budget.TotalAuthorizedHeadcount + 2);
        budget.Submit(DateTimeOffset.UtcNow, "planner");
        Assert.Equal(WorkforceBudgetStatus.Submitted, budget.Status);
        Assert.Equal(2, budget.TotalAuthorizedHeadcount);
        Assert.Equal(128000m, budget.GrandTotalBudget);
    }

    [Fact]
    public void Line_CannotContainTheSameFiscalPeriodTwice()
    {
        var budget = CreateBudget();
        var line = budget.AddLine(11, 10, 2, 3, 4, 1, 60000m, 4000m);
        line.AddPeriodAllocation(100, 1, 60000m, 4000m);

        var exception = Assert.Throws<DomainRuleException>(() => line.AddPeriodAllocation(100, 0, 0m, 0m));

        Assert.Equal("WorkforceBudget.DuplicatePeriodAllocation", exception.Code);
    }

    [Fact]
    public void Approve_RequiresOpenFiscalYearAndSubmittedStatus()
    {
        var budget = CreateSubmittableBudget();
        budget.Submit(DateTimeOffset.UtcNow, "planner");

        var closed = Assert.Throws<DomainRuleException>(() => budget.Approve(DateTimeOffset.UtcNow, "approver", false));
        Assert.Equal("WorkforceBudget.FiscalYearMustBeOpen", closed.Code);
        Assert.Equal(WorkforceBudgetStatus.Submitted, budget.Status);

        budget.Approve(DateTimeOffset.UtcNow, "approver", true);
        Assert.Equal(WorkforceBudgetStatus.Approved, budget.Status);
    }

    [Fact]
    public void ApprovedBudget_IsImmutableAndSupportsActivationSupersession()
    {
        var budget = CreateSubmittableBudget();
        budget.Submit(DateTimeOffset.UtcNow, "planner");
        budget.Approve(DateTimeOffset.UtcNow, "approver", true);

        Assert.Throws<DomainRuleException>(() => budget.AddLine(12, 10, 2, 3, 4, 1, 1000m, 100m));
        Assert.Throws<DomainRuleException>(() => budget.UpdateDraft("USD"));
        budget.Activate(DateTimeOffset.UtcNow);
        Assert.NotNull(budget.ActivatedOn);
        budget.Supersede(DateTimeOffset.UtcNow);
        Assert.Equal(WorkforceBudgetStatus.Superseded, budget.Status);
        budget.Supersede(DateTimeOffset.UtcNow);
        Assert.Equal(WorkforceBudgetStatus.Superseded, budget.Status);
    }

    [Fact]
    public void Reject_ThenResubmit_CompletesTheControlledLifecycle()
    {
        var budget = CreateSubmittableBudget();
        budget.Submit(DateTimeOffset.UtcNow, "planner");
        budget.Reject(DateTimeOffset.UtcNow, "reviewer", "Revise money");

        Assert.Equal(WorkforceBudgetStatus.Rejected, budget.Status);
        budget.UpdateDraft("USD");
        Assert.Equal("USD", budget.CurrencyCode);
    }

    [Fact]
    public void Envelope_DerivesDeterministicCodeAndZeroUsage()
    {
        var seeded = SeedBudgetWithIds(budgetId: 3, lineId: 5, planLineId: 11);
        var first = PositionEnvelope.FromBudgetLine(seeded.Budget, seeded.Line);
        var second = PositionEnvelope.FromBudgetLine(seeded.Budget, seeded.Line);

        Assert.Equal("WB-2027-001-P11", first.EnvelopeCode);
        Assert.Equal(first.EnvelopeCode, second.EnvelopeCode);
        Assert.Equal(0, first.ReservedHeadcount);
        Assert.Equal(0, first.HiredHeadcount);
        Assert.Equal(2, first.AvailableHeadcount);
        Assert.Equal(120000m, first.AvailableSalaryBudget);
        Assert.Equal("2026-09-V1", first.CalculationPolicyVersion);
        Assert.Equal(9, first.WorkforcePlanId);
    }

    private static WorkforceBudget CreateBudget() => new("WB-2027-001", 9, 4, 1, "EGP");

    private static WorkforceBudget CreateSubmittableBudget()
    {
        var budget = CreateBudget();
        var line = budget.AddLine(11, 10, 2, 3, 4, 2, 120000m, 8000m);
        line.AddPeriodAllocation(100, 2, 120000m, 8000m);
        return budget;
    }

    private static (WorkforceBudget Budget, WorkforceBudgetLine Line) SeedBudgetWithIds(int budgetId, int lineId, int planLineId)
    {
        var budget = CreateBudget();
        var line = budget.AddLine(planLineId, 10, 2, 3, 4, 2, 120000m, 8000m);
        line.AddPeriodAllocation(100, 2, 120000m, 8000m);
        typeof(WorkforceBudget).GetProperty(nameof(WorkforceBudget.Id))!.SetValue(budget, budgetId);
        typeof(WorkforceBudgetLine).GetProperty(nameof(WorkforceBudgetLine.Id))!.SetValue(line, lineId);
        return (budget, line);
    }
}
