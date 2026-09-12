using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Abstractions.Persistence;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging.Abstractions;

namespace ErpSystem.Tests;

public sealed class WorkforceBudgetHandlerTests
{
    [Fact]
    public async Task Create_RejectsBudgetsThatExceedPlanDemand()
    {
        var harness = CreateHarness();
        var request = ValidRequest() with
        {
            Lines = [ValidLine() with { AuthorizedHeadcount = 9 }]
        };

        var result = await harness.Create.Handle(new CreateWorkforceBudgetCommand(request), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("WorkforceBudget.HeadcountCeiling", result.Error.Code);
        Assert.Empty(harness.Write.Added);
        Assert.Empty(harness.Dispatched);
    }

    [Fact]
    public async Task Create_RejectsIncompleteDuplicateAndForeignLines()
    {
        var harness = CreateHarness(twoLinePlan: true);
        var missing = await harness.Create.Handle(
            new CreateWorkforceBudgetCommand(new CreateWorkforceBudgetRequest("WB-2027-001", 9, "EGP", [Line11()])), CancellationToken.None);
        Assert.Equal("WorkforceBudget.IncompleteLines", missing.Error.Code);

        var duplicate = await harness.Create.Handle(
            new CreateWorkforceBudgetCommand(new CreateWorkforceBudgetRequest("WB-2027-001", 9, "EGP", [Line11(), Line11()])), CancellationToken.None);
        Assert.Equal("WorkforceBudget.DuplicateLine", duplicate.Error.Code);

        var foreign = await harness.Create.Handle(
            new CreateWorkforceBudgetCommand(new CreateWorkforceBudgetRequest("WB-2027-001", 9, "EGP", [Line11(), Line11() with { WorkforcePlanLineId = 999 }])), CancellationToken.None);
        Assert.Equal("WorkforceBudget.ForeignLine", foreign.Error.Code);
        Assert.Empty(harness.Write.Added);
    }

    [Fact]
    public async Task Create_RejectsForeignPeriodsAndPeriodCeilingBreaches()
    {
        var harness = CreateHarness();
        var foreignPeriod = await harness.Create.Handle(
            new CreateWorkforceBudgetCommand(ValidRequest() with
            {
                Lines = [ValidLine() with
                {
                    PeriodAllocations = [new WorkforceBudgetPeriodAllocationRequest(777, 3, 180000m, 12000m)]
                }]
            }), CancellationToken.None);
        Assert.Equal("WorkforceBudget.PeriodNotFound", foreignPeriod.Error.Code);

        var ceiling = await harness.Create.Handle(
            new CreateWorkforceBudgetCommand(ValidRequest() with
            {
                Lines = [ValidLine() with
                {
                    PeriodAllocations = [new WorkforceBudgetPeriodAllocationRequest(100, 9, 180000m, 12000m)]
                }]
            }), CancellationToken.None);
        Assert.Equal("WorkforceBudget.PeriodHeadcountCeiling", ceiling.Error.Code);
    }

    [Fact]
    public async Task Approve_GeneratesOneEnvelopePerLineAtomicallyWithZeroUsage()
    {
        var harness = CreateHarness();
        var budget = SubmittedBudget();
        harness.Write.Budgets.Add(budget.Id, budget);

        var result = await harness.Approve.Handle(new ApproveWorkforceBudgetCommand(budget.Id, RowVersion()), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(WorkforceBudgetStatus.Approved, budget.Status);
        Assert.NotNull(budget.ActivatedOn);
        Assert.Single(harness.Write.Envelopes);
        var envelope = Assert.Single(harness.Write.Envelopes);
        Assert.Equal("WB-2027-001-P11", envelope.EnvelopeCode);
        Assert.Equal(3, envelope.AuthorizedHeadcount);
        Assert.Equal(0, envelope.ReservedHeadcount);
        Assert.Equal(0, envelope.HiredHeadcount);
        Assert.Equal(3, envelope.AvailableHeadcount);
        Assert.Equal(180000m, envelope.AvailableSalaryBudget);
        Assert.Equal(1, harness.Unit.Saves);
        Assert.Contains(harness.Dispatched, request => request.Resource == "workforce-budgets" && request.Action == "Approve");
        Assert.Contains(harness.Dispatched, request => request.Resource == "position-envelopes");
        Assert.Contains(harness.Dispatched, request => request.Resource == "workforce-plans");
    }

    [Fact]
    public async Task Approve_SupersedesThePreviousEffectivePairAtomically()
    {
        var harness = CreateHarness();
        var budget = SubmittedBudget();
        var previousBudget = ApprovedBudget(7, 70);
        var previousPlan = ApprovedPlanEntity(70, "WP-OLD", "Old", "قديمة");
        harness.Write.Budgets.Add(budget.Id, budget);
        harness.Write.Budgets.Add(previousBudget.Id, previousBudget);
        harness.Write.Effective = previousBudget;
        harness.Write.Plans.Add(9, ApprovedPlanEntity(9, "WP-2027", "Plan", "خطة"));
        harness.Write.Plans.Add(70, previousPlan);
        previousPlan.Activate(DateTimeOffset.UtcNow);

        var result = await harness.Approve.Handle(new ApproveWorkforceBudgetCommand(budget.Id, RowVersion()), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(WorkforceBudgetStatus.Superseded, previousBudget.Status);
        Assert.Equal(WorkforcePlanStatus.Superseded, previousPlan.Status);
        Assert.Equal(1, harness.Unit.Saves);
    }

    [Fact]
    public async Task Approve_FaultInjectionLeavesNoPartialEnvelopesOrActivation()
    {
        var harness = CreateHarness(failOnSave: true);
        var budget = SubmittedBudget();
        harness.Write.Budgets.Add(budget.Id, budget);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            harness.Approve.Handle(new ApproveWorkforceBudgetCommand(budget.Id, RowVersion()), CancellationToken.None));

        Assert.Empty(harness.Dispatched);
    }

    private static Harness CreateHarness(bool failOnSave = false, bool twoLinePlan = false)
    {
        var write = new RecordingBudgetWriteStore { TwoLinePlan = twoLinePlan };
        var unit = new RecordingUnitOfWork { FailOnSave = failOnSave };
        var dispatcher = new RecordingDispatcher();
        var actor = new TestActor();
        var errors = new WorkforceBudgetErrors(new EchoLocalizer<CreateWorkforceBudgetRequest>());
        var effects = new WorkforceBudgetEffects(actor, dispatcher, NullLogger<WorkforceBudgetEffects>.Instance);
        var read = new StubBudgetReadStore();
        return new Harness(
            write,
            unit,
            dispatcher.Dispatched,
            new CreateWorkforceBudgetCommandHandler(write, read, unit, actor, effects, errors),
            new ApproveWorkforceBudgetCommandHandler(write, read, unit, actor, TimeProvider.System, effects, errors));
    }

    private static CreateWorkforceBudgetRequest ValidRequest() => new("WB-2027-001", 9, "EGP", [ValidLine()]);

    private static WorkforceBudgetLineRequest ValidLine() => Line11();

    private static WorkforceBudgetLineRequest Line11() => new(
        11,
        3,
        180000m,
        12000m,
        [new WorkforceBudgetPeriodAllocationRequest(100, 3, 180000m, 12000m)]);

    private static WorkforceBudgetLineRequest Line12() => new(
        12,
        3,
        120000m,
        8000m,
        [new WorkforceBudgetPeriodAllocationRequest(100, 3, 120000m, 8000m)]);

    private static WorkforceBudget SubmittedBudget()
    {
        var budget = new WorkforceBudget("WB-2027-001", 9, 4, 1, "EGP")
        {
            TenantId = "tenant-1",
            CompanyId = 11,
            CreatedById = "planner"
        };
        var line = budget.AddLine(11, 10, 2, 3, 4, 3, 180000m, 12000m);
        line.AddPeriodAllocation(100, 3, 180000m, 12000m);
        typeof(WorkforceBudget).GetProperty(nameof(WorkforceBudget.Id))!.SetValue(budget, 3);
        typeof(WorkforceBudgetLine).GetProperty(nameof(WorkforceBudgetLine.Id))!.SetValue(line, 5);
        budget.Submit(DateTimeOffset.UtcNow, "planner");
        return budget;
    }

    private static WorkforceBudget ApprovedBudget(int id, int planId)
    {
        var budget = new WorkforceBudget("WB-OLD", planId, 4, 1, "EGP")
        {
            TenantId = "tenant-1",
            CompanyId = 11,
            CreatedById = "planner"
        };
        var line = budget.AddLine(71, 10, 2, 3, 4, 1, 60000m, 4000m);
        line.AddPeriodAllocation(100, 1, 60000m, 4000m);
        typeof(WorkforceBudget).GetProperty(nameof(WorkforceBudget.Id))!.SetValue(budget, id);
        budget.Submit(DateTimeOffset.UtcNow, "planner");
        budget.Approve(DateTimeOffset.UtcNow, "approver", true);
        budget.Activate(DateTimeOffset.UtcNow);
        return budget;
    }

    private static WorkforcePlan ApprovedPlanEntity(int id, string code, string titleEn, string titleAr)
    {
        var plan = new WorkforcePlan(code, 4, titleEn, titleAr, null)
        {
            TenantId = "tenant-1",
            CompanyId = 11,
            CreatedById = "planner"
        };
        typeof(WorkforcePlan).GetProperty(nameof(WorkforcePlan.Id))!.SetValue(plan, id);
        var line = plan.AddLine(10, null, 20, 30, 2, new DateOnly(2027, 1, 1), 2, 0, null);
        line.AddPeriodTarget(100, 2, 0);
        plan.Submit(DateTimeOffset.UtcNow, "planner");
        plan.BeginReview();
        plan.Approve(DateTimeOffset.UtcNow, "approver", true);
        return plan;
    }

    private static string RowVersion() => Convert.ToBase64String([1, 2, 3, 4, 5, 6, 7, 8]);

    private sealed record Harness(
        RecordingBudgetWriteStore Write,
        RecordingUnitOfWork Unit,
        List<RealtimeChangeRequest> Dispatched,
        CreateWorkforceBudgetCommandHandler Create,
        ApproveWorkforceBudgetCommandHandler Approve);

    private sealed class RecordingBudgetWriteStore : IWorkforceBudgetWriteStore
    {
        public bool TwoLinePlan { get; set; }
        public List<WorkforceBudget> Added { get; } = [];
        public List<PositionEnvelope> Envelopes { get; } = [];
        public Dictionary<int, WorkforceBudget> Budgets { get; } = new();
        public Dictionary<int, WorkforcePlan> Plans { get; } = new();
        public WorkforceBudget? Effective { get; set; }

        public void Add(WorkforceBudget budget) => Added.Add(budget);
        public void AddEnvelope(PositionEnvelope envelope) => Envelopes.Add(envelope);
        public Task<WorkforceBudget?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult(Budgets.TryGetValue(id, out var budget) ? budget : null);
        public Task<bool> CodeExistsAsync(string budgetCode, int fiscalYearId, int? excludedId, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> BudgetExistsForPlanAsync(int workforcePlanId, int? excludedId, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<BudgetPlanSnapshot?> GetPlanAsync(int workforcePlanId, CancellationToken cancellationToken) =>
            Task.FromResult<BudgetPlanSnapshot?>(TwoLinePlan ? TwoLineSnapshot() : SingleLineSnapshot());

        private static BudgetPlanSnapshot SingleLineSnapshot() => new(
            9, 4, 1, nameof(WorkforcePlanStatus.Approved),
            [new BudgetPlanLineSnapshot(11, 10, 2, 3, 4, 3, 0, 3, [new BudgetPlanLinePeriodSnapshot(100, 3, 0)])]);

        private static BudgetPlanSnapshot TwoLineSnapshot() => new(
            9, 4, 1, nameof(WorkforcePlanStatus.Approved),
            [new BudgetPlanLineSnapshot(11, 10, 2, 3, 4, 3, 0, 3, [new BudgetPlanLinePeriodSnapshot(100, 3, 0)]),
             new BudgetPlanLineSnapshot(12, 10, 2, 3, 4, 2, 1, 3, [new BudgetPlanLinePeriodSnapshot(100, 2, 1)])]);
        public Task<FiscalYearPlanningSnapshot?> GetFiscalYearAsync(int fiscalYearId, CancellationToken cancellationToken) =>
            Task.FromResult<FiscalYearPlanningSnapshot?>(new FiscalYearPlanningSnapshot(4, new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31), new HashSet<int> { 100 }, "Open"));
        public Task<WorkforceBudget?> GetEffectiveBudgetAsync(int fiscalYearId, int? excludedId, CancellationToken cancellationToken) => Task.FromResult(Effective);
        public Task<WorkforcePlan?> GetPlanForUpdateAsync(int planId, CancellationToken cancellationToken) =>
            Task.FromResult<WorkforcePlan?>(Plans.TryGetValue(planId, out var plan) ? plan : ApprovedPlanEntity(planId, "WP-2027", "Plan", "خطة"));
        public void RemovePeriodAllocations(IReadOnlyCollection<WorkforceBudgetPeriodAllocation> allocations) { }
        public void RemoveLines(IReadOnlyCollection<WorkforceBudgetLine> lines) { }
        public void ApplyRowVersion(WorkforceBudget budget, string rowVersion) { }
    }

    private sealed class StubBudgetReadStore : IWorkforceBudgetReadStore
    {
        public Task<PageResponse<WorkforceBudgetListItemResponse>> GetPageAsync(GetWorkforceBudgetsQuery query, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<WorkforceBudgetDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult<WorkforceBudgetDetailResponse?>(new WorkforceBudgetDetailResponse(
                3, "WB-2027-001", 9, 4, 1, "EGP", "2026-09-V1", WorkforceBudgetStatus.Approved,
                null, null, DateTimeOffset.UtcNow, "approver", null, null, null, DateTimeOffset.UtcNow, null,
                3, 180000m, 12000m, 192000m, true, [], DateTime.UtcNow, null, "AQ=="));
        public Task<PageResponse<BudgetSourcePlanResponse>> GetSourcePlansAsync(GetBudgetSourcePlansQuery query, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<BudgetSourcePlanResponse?> GetSourcePlanByIdAsync(int planId, CancellationToken cancellationToken) =>
            Task.FromResult<BudgetSourcePlanResponse?>(null);
        public Task<PageResponse<PositionEnvelopeListItemResponse>> GetEnvelopesAsync(GetPositionEnvelopesQuery query, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<PositionEnvelopeDetailResponse?> GetEnvelopeByIdAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult<PositionEnvelopeDetailResponse?>(null);
    }

    private sealed class RecordingUnitOfWork : IUnitOfWork
    {
        public bool FailOnSave { get; set; }
        public int Saves { get; private set; }

        public async Task<TResult> ExecuteAtomicallyAsync<TResult>(
            IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation,
            CancellationToken cancellationToken = default) => await operation(cancellationToken);

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            Saves++;
            if (FailOnSave) throw new InvalidOperationException("Injected persistence fault.");
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingDispatcher : IRealtimeChangeDispatcher
    {
        public List<RealtimeChangeRequest> Dispatched { get; } = [];
        public void Dispatch(RealtimeChangeRequest request) => Dispatched.Add(request);
    }

    private sealed class TestActor : ICurrentActor
    {
        public string? UserId => "approver";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 11;
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
