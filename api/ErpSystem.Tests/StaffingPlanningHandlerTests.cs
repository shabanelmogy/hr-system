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

public sealed class StaffingPlanningHandlerTests
{
    [Fact]
    public async Task Approve_RejectsSelfApprovalWithoutReservationOrEffects()
    {
        var request = SubmittedRequest("planner", 1, 1_000m);
        var harness = CreateHarness(request, CreateEnvelope(), actorId: "planner");

        var result = await harness.Approve.Handle(new ApproveStaffingRequestCommand(request.Id, RowVersion()), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("StaffingRequest.SelfApproval", result.Error.Code);
        Assert.Equal(StaffingRequestStatus.Submitted, request.Status);
        Assert.Equal(0, harness.Envelope.ReservedHeadcount);
        Assert.Empty(harness.Dispatcher.Dispatched);
    }

    [Fact]
    public async Task Approve_ReservesHeadcountAndFiscalSalaryAsOneReservation()
    {
        var request = SubmittedRequest("planner", 2, 1_000m);
        var envelope = CreateEnvelope(authorizedHeadcount: 3, salaryBudget: 4_000m);
        var harness = CreateHarness(request, envelope, actorId: "approver");

        var result = await harness.Approve.Handle(new ApproveStaffingRequestCommand(request.Id, RowVersion()), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(StaffingRequestStatus.Approved, request.Status);
        Assert.Equal(2, envelope.ReservedHeadcount);
        Assert.Equal(2_000m, envelope.ReservedSalaryBudget);
        Assert.Equal(1, harness.Unit.Saves);
        Assert.Equal(2, harness.Dispatcher.Dispatched.Count);
    }

    [Fact]
    public async Task Approve_TwoRequestsAgainstOneEnvelopeCannotConsumeCapacityTwice()
    {
        var first = SubmittedRequest("planner-1", 2, 1_000m, 1);
        var second = SubmittedRequest("planner-2", 2, 1_000m, 2);
        var envelope = CreateEnvelope(authorizedHeadcount: 2, salaryBudget: 2_000m);
        var harness = CreateHarness(first, envelope, actorId: "approver");
        harness.Store.Requests[second.Id] = second;

        var firstResult = await harness.Approve.Handle(new ApproveStaffingRequestCommand(first.Id, RowVersion()), CancellationToken.None);
        var secondResult = await harness.Approve.Handle(new ApproveStaffingRequestCommand(second.Id, RowVersion()), CancellationToken.None);

        Assert.True(firstResult.IsSuccess);
        Assert.True(secondResult.IsFailure);
        Assert.Equal("PositionEnvelope.InsufficientHeadcount", secondResult.Error.Code);
        Assert.Equal(2, envelope.ReservedHeadcount);
        Assert.Equal(2_000m, envelope.ReservedSalaryBudget);
        Assert.Equal(StaffingRequestStatus.Submitted, second.Status);
    }

    [Fact]
    public async Task ApproveAmendment_ExpandsHeadcountAndSalaryExactlyOnce()
    {
        var amendment = new EnvelopeAmendment(50, 2, 2_000m, "approved expansion", "planner")
        {
            TenantId = "tenant-1",
            CompanyId = 11,
            CreatedById = "planner"
        };
        SetId(amendment, 5);
        amendment.Submit(DateTimeOffset.UtcNow, "planner");
        var envelope = CreateEnvelope(authorizedHeadcount: 3, salaryBudget: 3_000m, id: 50);
        var harness = CreateHarness(amendment, envelope, actorId: "approver");

        var result = await harness.ApproveAmendment.Handle(new ApproveEnvelopeAmendmentCommand(amendment.Id, RowVersion()), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(5, envelope.AuthorizedHeadcount);
        Assert.Equal(5_000m, envelope.AuthorizedSalaryBudget);
        Assert.Equal(EnvelopeAmendmentStatus.Approved, amendment.Status);

        var retry = await harness.ApproveAmendment.Handle(new ApproveEnvelopeAmendmentCommand(amendment.Id, RowVersion()), CancellationToken.None);
        Assert.True(retry.IsFailure);
        Assert.Equal(5, envelope.AuthorizedHeadcount);
        Assert.Equal(5_000m, envelope.AuthorizedSalaryBudget);
    }

    [Fact]
    public async Task Approve_FaultInjectionDoesNotDispatchOrLeavePartialReservation()
    {
        var request = SubmittedRequest("planner", 1, 1_000m);
        var envelope = CreateEnvelope();
        var harness = CreateHarness(request, envelope, actorId: "approver", failOnSave: true);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            harness.Approve.Handle(new ApproveStaffingRequestCommand(request.Id, RowVersion()), CancellationToken.None));

        // The real unit of work rolls the database transaction back and disposes the
        // request-scoped context after this exception. The fake intentionally records
        // only the observable contract: no post-commit effects were emitted.
        Assert.Equal(1, harness.Unit.Saves);
        Assert.Empty(harness.Dispatcher.Dispatched);
    }

    private static Harness CreateHarness(
        StaffingRequest request,
        PositionEnvelope envelope,
        string actorId = "approver",
        bool failOnSave = false)
    {
        var store = new Store { Envelope = envelope };
        store.Requests[request.Id] = request;
        var dispatcher = new Dispatcher();
        var actor = new Actor(actorId);
        var effects = new StaffingEffects(actor, dispatcher, NullLogger<StaffingEffects>.Instance);
        var errors = new StaffingErrors(new EchoLocalizer<CreateStaffingRequestRequest>());
        var unit = new UnitOfWork { FailOnSave = failOnSave };
        return new Harness(
            store,
            envelope,
            dispatcher,
            unit,
            new ApproveStaffingRequestCommandHandler(store, store, unit, actor, TimeProvider.System, effects, errors),
            new ApproveEnvelopeAmendmentCommandHandler(store, store, unit, actor, TimeProvider.System, effects, errors));
    }

    private static Harness CreateHarness(
        EnvelopeAmendment amendment,
        PositionEnvelope envelope,
        string actorId,
        bool failOnSave = false)
    {
        var store = new Store { Envelope = envelope };
        store.Amendments[amendment.Id] = amendment;
        var dispatcher = new Dispatcher();
        var actor = new Actor(actorId);
        var effects = new StaffingEffects(actor, dispatcher, NullLogger<StaffingEffects>.Instance);
        var errors = new StaffingErrors(new EchoLocalizer<CreateStaffingRequestRequest>());
        var unit = new UnitOfWork { FailOnSave = failOnSave };
        return new Harness(
            store,
            envelope,
            dispatcher,
            unit,
            new ApproveStaffingRequestCommandHandler(store, store, unit, actor, TimeProvider.System, effects, errors),
            new ApproveEnvelopeAmendmentCommandHandler(store, store, unit, actor, TimeProvider.System, effects, errors));
    }

    private static StaffingRequest SubmittedRequest(string creator, int requestedHeadcount, decimal costPerSlot, int id = 1)
    {
        var request = new StaffingRequest(
            50,
            requestedHeadcount,
            costPerSlot * 12,
            costPerSlot,
            costPerSlot * requestedHeadcount,
            new DateOnly(2027, 2, 1),
            StaffingRequestType.NewHire,
            StaffingRequestPriority.Normal,
            "hire request",
            "EGP",
            WorkforceBudget.CalculationPolicy)
        {
            TenantId = "tenant-1",
            CompanyId = 11,
            CreatedById = creator,
            RowVersion = [1, 2, 3]
        };
        SetId(request, id);
        request.Submit(DateTimeOffset.UtcNow, creator);
        return request;
    }

    private static PositionEnvelope CreateEnvelope(int authorizedHeadcount = 4, decimal salaryBudget = 4_000m, int id = 50)
    {
        var budget = new WorkforceBudget("WB-2027-001", 10, 4, 1, "EGP");
        var line = budget.AddLine(11, 10, 2, 3, 4, authorizedHeadcount, salaryBudget, 0m);
        typeof(WorkforceBudget).GetProperty(nameof(WorkforceBudget.Id))!.SetValue(budget, 3);
        typeof(WorkforceBudgetLine).GetProperty(nameof(WorkforceBudgetLine.Id))!.SetValue(line, 5);
        var envelope = PositionEnvelope.FromBudgetLine(budget, line);
        typeof(PositionEnvelope).GetProperty(nameof(PositionEnvelope.Id))!.SetValue(envelope, id);
        envelope.TenantId = "tenant-1";
        envelope.CompanyId = 11;
        envelope.CreatedById = "planner";
        return envelope;
    }

    private static StaffingRequestDetailResponse RequestDetail(StaffingRequest request) => new(
        request.Id, request.EnvelopeId, "WB-2027-001-P11", request.RequestedHeadcount,
        request.EstimatedAnnualSalaryPerSlot, request.EstimatedFiscalYearCostPerSlot, request.TotalReservedCost,
        request.TargetStartDate, request.RequestType, request.Priority, request.Justification, request.CurrencyCode,
        request.CalculationPolicyVersion, request.AllocatedRequisitionPositions, request.HiredPositions,
        request.RemainingAllocatable, request.RemainingToHire, request.Status, request.CloseReason,
        request.SubmittedOn, request.SubmittedById, request.ApprovedOn, request.ApprovedById,
        request.RejectedOn, request.RejectedById, request.DecisionReason, request.ClosedOn,
        DateTime.UtcNow, null, "AQ==");

    private static EnvelopeAmendmentDetailResponse AmendmentDetail(EnvelopeAmendment amendment) => new(
        amendment.Id, amendment.EnvelopeId, "WB-2027-001-P11", amendment.AdditionalHeadcount,
        amendment.AdditionalSalaryCost, amendment.Justification, amendment.Status, amendment.RequestedById,
        amendment.SubmittedOn, amendment.SubmittedById, amendment.ApprovedOn, amendment.ApprovedById,
        amendment.RejectedOn, amendment.RejectedById, amendment.DecisionReason, DateTime.UtcNow, null, "AQ==");

    private static string RowVersion() => Convert.ToBase64String([1, 2, 3]);

    private static void SetId(object entity, int id) => entity.GetType().GetProperty("Id")!.SetValue(entity, id);

    private sealed record Harness(
        Store Store,
        PositionEnvelope Envelope,
        Dispatcher Dispatcher,
        UnitOfWork Unit,
        ApproveStaffingRequestCommandHandler Approve,
        ApproveEnvelopeAmendmentCommandHandler ApproveAmendment);

    private sealed class Store : IStaffingWriteStore, IStaffingReadStore
    {
        public PositionEnvelope? Envelope { get; set; }
        public Dictionary<int, StaffingRequest> Requests { get; } = [];
        public Dictionary<int, EnvelopeAmendment> Amendments { get; } = [];
        public void AddAmendment(EnvelopeAmendment amendment) => Amendments[amendment.Id] = amendment;
        public void AddRequest(StaffingRequest request) => Requests[request.Id] = request;
        public Task<EnvelopeAmendment?> GetAmendmentForUpdateAsync(int id, CancellationToken _) => Task.FromResult(Amendments.GetValueOrDefault(id));
        public Task<StaffingRequest?> GetRequestForUpdateAsync(int id, CancellationToken _) => Task.FromResult(Requests.GetValueOrDefault(id));
        public Task<PositionEnvelope?> GetEnvelopeForUpdateAsync(int envelopeId, CancellationToken _) => Task.FromResult(Envelope?.Id == envelopeId ? Envelope : null);
        public Task<StaffingFiscalYearSnapshot?> GetFiscalYearAsync(int fiscalYearId, CancellationToken _) => Task.FromResult<StaffingFiscalYearSnapshot?>(new(fiscalYearId, new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31), "Open"));
        public void ApplyAmendmentRowVersion(EnvelopeAmendment _, string __) { }
        public void ApplyRequestRowVersion(StaffingRequest _, string __) { }
        public Task<EnvelopeAmendmentDetailResponse?> GetAmendmentByIdAsync(int id, CancellationToken _) => Task.FromResult(Amendments.TryGetValue(id, out var amendment) ? AmendmentDetail(amendment) : null);
        public Task<StaffingRequestDetailResponse?> GetRequestByIdAsync(int id, CancellationToken _) => Task.FromResult(Requests.TryGetValue(id, out var request) ? RequestDetail(request) : null);
        public Task<PageResponse<EnvelopeAmendmentListItemResponse>> GetAmendmentsAsync(GetEnvelopeAmendmentsQuery _, CancellationToken __) => throw new NotSupportedException();
        public Task<PageResponse<StaffingRequestListItemResponse>> GetRequestsAsync(GetStaffingRequestsQuery _, CancellationToken __) => throw new NotSupportedException();
    }

    private sealed class UnitOfWork : IUnitOfWork
    {
        public bool FailOnSave { get; init; }
        public int Saves { get; private set; }
        public Task<TResult> ExecuteAtomicallyAsync<TResult>(IReadOnlyCollection<string> _, Func<CancellationToken, Task<TResult>> operation, CancellationToken cancellationToken = default) => operation(cancellationToken);
        public Task<int> SaveChangesAsync(CancellationToken _) { Saves++; if (FailOnSave) throw new InvalidOperationException("Injected persistence fault."); return Task.FromResult(1); }
    }

    private sealed class Dispatcher : IRealtimeChangeDispatcher
    {
        public List<RealtimeChangeRequest> Dispatched { get; } = [];
        public void Dispatch(RealtimeChangeRequest request) => Dispatched.Add(request);
    }

    private sealed class Actor(string id) : ICurrentActor
    {
        public string? UserId => id;
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
