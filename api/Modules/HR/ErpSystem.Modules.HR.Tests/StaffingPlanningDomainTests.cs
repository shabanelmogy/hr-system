using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;

namespace ErpSystem.Modules.HR.Tests;

public sealed class StaffingRequestDomainTests
{
    [Fact]
    public void StatusAndClassificationValues_AreFrozen()
    {
        Assert.Equal(1, (int)StaffingRequestStatus.Draft);
        Assert.Equal(2, (int)StaffingRequestStatus.Submitted);
        Assert.Equal(3, (int)StaffingRequestStatus.Approved);
        Assert.Equal(4, (int)StaffingRequestStatus.Rejected);
        Assert.Equal(5, (int)StaffingRequestStatus.Closed);
        Assert.Equal(1, (int)StaffingRequestType.NewHire);
        Assert.Equal(2, (int)StaffingRequestType.Replacement);
        Assert.Equal(1, (int)StaffingRequestCloseReason.Fulfilled);
        Assert.Equal(2, (int)StaffingRequestCloseReason.Cancelled);
        Assert.Equal(3, (int)StaffingRequestCloseReason.PartiallyFulfilledCancelled);
    }

    [Fact]
    public void Constructor_RequiresAConsistentPositiveReservation()
    {
        Assert.Throws<ArgumentException>(() => CreateRequest(totalReservedCost: 200m));
        Assert.Throws<ArgumentOutOfRangeException>(() => CreateRequest(annualSalary: 0m, fiscalCost: 0m, totalReservedCost: 0m));
    }

    [Fact]
    public void SubmitAndApprove_RejectSelfApproval()
    {
        var request = CreateRequest();
        request.CreatedById = "planner";
        request.Submit(DateTimeOffset.UtcNow, "planner");

        var exception = Assert.Throws<DomainRuleException>(() => request.Approve(DateTimeOffset.UtcNow, "planner"));

        Assert.Equal("StaffingRequest.SelfApproval", exception.Code);
        Assert.Equal(StaffingRequestStatus.Submitted, request.Status);
    }

    [Fact]
    public void AllocationAndHireCounters_NeverClampOrExceedTheRequest()
    {
        var request = ApprovedRequest();
        request.RegisterAllocation(2);
        request.RegisterHire(1);

        Assert.Equal(1, request.RemainingAllocatable);
        Assert.Equal(2, request.RemainingToHire);
        Assert.Throws<DomainRuleException>(() => request.RegisterAllocation(2));
        Assert.Throws<DomainRuleException>(() => request.ReleaseAllocation(2));
        Assert.Throws<DomainRuleException>(() => request.RegisterHire(3));
    }

    [Fact]
    public void Close_BlocksActiveAllocationsAndReleasesOnlyUnhiredCapacity()
    {
        var request = ApprovedRequest();
        request.RegisterAllocation(2);
        request.RegisterHire(1);

        var active = Assert.Throws<DomainRuleException>(() =>
            request.Close(DateTimeOffset.UtcNow, StaffingRequestCloseReason.PartiallyFulfilledCancelled));
        Assert.Equal("StaffingRequest.ActiveAllocations", active.Code);

        request.ReleaseAllocation(1);
        request.Close(DateTimeOffset.UtcNow, StaffingRequestCloseReason.PartiallyFulfilledCancelled);

        Assert.Equal(StaffingRequestStatus.Closed, request.Status);
        Assert.Equal(2, request.ReleasableHeadcount);
        Assert.Equal(200m, request.ReleasableCost);
        Assert.Equal(1, request.HiredPositions);
    }

    [Fact]
    public void CloseReason_MustMatchTheFulfilmentState()
    {
        var empty = ApprovedRequest();
        Assert.Throws<DomainRuleException>(() => empty.Close(DateTimeOffset.UtcNow, StaffingRequestCloseReason.Fulfilled));

        var partial = ApprovedRequest();
        partial.RegisterAllocation(1);
        partial.RegisterHire(1);
        Assert.Throws<DomainRuleException>(() => partial.Close(DateTimeOffset.UtcNow, StaffingRequestCloseReason.Cancelled));
    }

    [Fact]
    public void ClosedRequest_CannotRecordAdditionalHire()
    {
        var request = ApprovedRequest();
        request.Close(DateTimeOffset.UtcNow, StaffingRequestCloseReason.Cancelled);

        var exception = Assert.Throws<DomainRuleException>(() => request.RegisterHire(1));

        Assert.Equal("StaffingRequest.NotHirable", exception.Code);
    }

    [Fact]
    public void FiscalCostPolicy_UsesInclusiveFiscalDaysAndFinalMoneyRounding()
    {
        var fullYear = WorkforceCostPolicy.ComputeFiscalCostPerSlot(
            120000m,
            new DateOnly(2027, 1, 1),
            new DateOnly(2027, 1, 1),
            new DateOnly(2027, 12, 31));
        var secondHalf = WorkforceCostPolicy.ComputeFiscalCostPerSlot(
            120000m,
            new DateOnly(2027, 7, 1),
            new DateOnly(2027, 1, 1),
            new DateOnly(2027, 12, 31));

        Assert.Equal(120000m, fullYear);
        Assert.Equal(60493.15m, secondHalf);
        Assert.Equal(181479.45m, WorkforceCostPolicy.ComputeTotalReservedCost(secondHalf, 3));
    }

    private static StaffingRequest ApprovedRequest()
    {
        var request = CreateRequest();
        request.CreatedById = "planner";
        request.Submit(DateTimeOffset.UtcNow, "planner");
        request.Approve(DateTimeOffset.UtcNow, "approver");
        return request;
    }

    private static StaffingRequest CreateRequest(
        decimal annualSalary = 1200m,
        decimal fiscalCost = 100m,
        decimal totalReservedCost = 300m) =>
        new(
            10,
            3,
            annualSalary,
            fiscalCost,
            totalReservedCost,
            new DateOnly(2027, 12, 1),
            StaffingRequestType.NewHire,
            StaffingRequestPriority.Normal,
            "Growth",
            "EGP",
            WorkforceCostPolicy.PolicyVersion);
}

public sealed class EnvelopeAmendmentDomainTests
{
    [Fact]
    public void StatusValues_AreFrozen()
    {
        Assert.Equal(1, (int)EnvelopeAmendmentStatus.Draft);
        Assert.Equal(2, (int)EnvelopeAmendmentStatus.Submitted);
        Assert.Equal(3, (int)EnvelopeAmendmentStatus.Approved);
        Assert.Equal(4, (int)EnvelopeAmendmentStatus.Rejected);
    }

    [Theory]
    [InlineData(0, 100)]
    [InlineData(1, 0)]
    [InlineData(-1, 100)]
    public void Constructor_AllowsPositiveDeltasOnly(int headcount, decimal salary)
    {
        Assert.ThrowsAny<ArgumentOutOfRangeException>(() => new EnvelopeAmendment(10, headcount, salary, "Growth", "planner"));
    }

    [Fact]
    public void SubmitAndApprove_RejectRequesterSelfApproval()
    {
        var amendment = new EnvelopeAmendment(10, 2, 500m, "Growth", "planner");
        amendment.Submit(DateTimeOffset.UtcNow, "planner");

        var exception = Assert.Throws<DomainRuleException>(() => amendment.Approve(DateTimeOffset.UtcNow, "planner"));

        Assert.Equal("EnvelopeAmendment.SelfApproval", exception.Code);
        Assert.Equal(EnvelopeAmendmentStatus.Submitted, amendment.Status);
    }

    [Fact]
    public void ApprovedAmendment_ExpandsBothEnvelopeDimensionsExactlyOnce()
    {
        var envelope = CreateEnvelope(3, 300m);
        var amendment = new EnvelopeAmendment(envelope.Id, 2, 500m, "Growth", "planner");
        amendment.Submit(DateTimeOffset.UtcNow, "planner");
        amendment.Approve(DateTimeOffset.UtcNow, "approver");
        envelope.Expand(amendment.AdditionalHeadcount, amendment.AdditionalSalaryCost);

        Assert.Equal(5, envelope.AuthorizedHeadcount);
        Assert.Equal(800m, envelope.AuthorizedSalaryBudget);
        Assert.Throws<DomainRuleException>(() => amendment.Approve(DateTimeOffset.UtcNow, "another-approver"));
    }

    [Fact]
    public void EnvelopeReservation_IsDualAndNeverBecomesNegative()
    {
        var envelope = CreateEnvelope(3, 300m);
        envelope.Reserve(2, 200m);

        Assert.Equal(1, envelope.AvailableHeadcount);
        Assert.Equal(100m, envelope.AvailableSalaryBudget);

        var moneyFailure = Assert.Throws<DomainRuleException>(() => envelope.Reserve(1, 101m));
        Assert.Equal("PositionEnvelope.InsufficientBudget", moneyFailure.Code);
        Assert.Equal(2, envelope.ReservedHeadcount);
        Assert.Equal(200m, envelope.ReservedSalaryBudget);

        envelope.ConsumeReserved(1, 100m);
        envelope.Release(1, 100m);
        Assert.Equal(1, envelope.HiredHeadcount);
        Assert.Equal(100m, envelope.ContractedSalaryBudget);
        Assert.Equal(2, envelope.AvailableHeadcount);
        Assert.Equal(200m, envelope.AvailableSalaryBudget);
        Assert.Throws<DomainRuleException>(() => envelope.Release(1, 1m));
    }

    [Fact]
    public void LowerOfferDelta_IsReleasedOnlyAfterReservedConsumption()
    {
        var envelope = CreateEnvelope(1, 100m);
        envelope.Reserve(1, 100m);

        envelope.ConsumeReserved(1, 80m);
        envelope.AdjustReservedSalary(-20m);

        Assert.Equal(0, envelope.ReservedHeadcount);
        Assert.Equal(0m, envelope.ReservedSalaryBudget);
        Assert.Equal(80m, envelope.ContractedSalaryBudget);
    }

    private static PositionEnvelope CreateEnvelope(int headcount, decimal salary)
    {
        var budget = new WorkforceBudget("WB-2027-001", 9, 4, 1, "EGP");
        var line = budget.AddLine(11, 10, 2, 3, 4, headcount, salary, 0m);
        line.AddPeriodAllocation(100, headcount, salary, 0m);
        typeof(WorkforceBudget).GetProperty(nameof(WorkforceBudget.Id))!.SetValue(budget, 3);
        typeof(WorkforceBudgetLine).GetProperty(nameof(WorkforceBudgetLine.Id))!.SetValue(line, 5);
        var envelope = PositionEnvelope.FromBudgetLine(budget, line);
        typeof(PositionEnvelope).GetProperty(nameof(PositionEnvelope.Id))!.SetValue(envelope, 10);
        return envelope;
    }
}

