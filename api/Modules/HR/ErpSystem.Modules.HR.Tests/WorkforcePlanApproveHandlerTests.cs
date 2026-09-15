using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging.Abstractions;

namespace ErpSystem.Modules.HR.Tests;

public sealed class WorkforcePlanApproveHandlerTests
{
    [Fact]
    public async Task Approve_AllowsAdminToApproveOwnPlan()
    {
        var plan = ReviewablePlan(createdById: "creator");
        var harness = CreateHarness(plan, new RoleActor("creator", PlatformRoleNames.Admin));

        var result = await harness.Approve.Handle(new ApproveWorkforcePlanCommand(plan.Id, "AQ=="), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(WorkforcePlanStatus.Approved, plan.Status);
        Assert.Equal("creator", plan.ApprovedById);
    }

    [Fact]
    public async Task Approve_RejectsSelfApprovalForNonAdmin()
    {
        var plan = ReviewablePlan(createdById: "creator");
        var harness = CreateHarness(plan, new RoleActor("creator"));

        var result = await harness.Approve.Handle(new ApproveWorkforcePlanCommand(plan.Id, "AQ=="), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("WorkforcePlan.SelfApproval", result.Error.Code);
        Assert.Equal(WorkforcePlanStatus.UnderReview, plan.Status);
    }

    private static WorkforcePlan ReviewablePlan(string createdById)
    {
        var plan = new WorkforcePlan("WP-2027", 4, "Plan", "خطة", null)
        {
            TenantId = "tenant-1",
            CompanyId = 11,
            CreatedById = createdById
        };
        typeof(WorkforcePlan).GetProperty(nameof(WorkforcePlan.Id))!.SetValue(plan, 9);
        var line = plan.AddLine(10, null, 20, 30, 2, new DateOnly(2027, 1, 1), 2, 0, null);
        line.AddPeriodTarget(100, 2, 0);
        plan.Submit(DateTimeOffset.UtcNow, createdById);
        plan.BeginReview();
        return plan;
    }

    private static Harness CreateHarness(WorkforcePlan plan, ICurrentActor actor)
    {
        var write = new StubPlanWriteStore(plan);
        var read = new StubPlanReadStore();
        var unit = new RecordingUnitOfWork();
        var dispatcher = new RecordingDispatcher();
        var errors = new WorkforcePlanErrors(new EchoLocalizer<CreateWorkforcePlanRequest>());
        var effects = new WorkforcePlanEffects(actor, dispatcher, NullLogger<WorkforcePlanEffects>.Instance);
        return new Harness(new ApproveWorkforcePlanCommandHandler(write, read, unit, actor, TimeProvider.System, effects, errors));
    }

    private sealed record Harness(ApproveWorkforcePlanCommandHandler Approve);

    private sealed class RoleActor(string userId, params string[] roles) : ICurrentActor
    {
        public string? UserId => userId;
        public string? TenantId => "tenant-1";
        public int? CompanyId => 11;
        public bool IsInRole(string role) => roles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }

    private sealed class StubPlanWriteStore(WorkforcePlan plan) : IWorkforcePlanWriteStore
    {
        public void Add(WorkforcePlan plan) => throw new NotSupportedException();
        public Task<WorkforcePlan?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult<WorkforcePlan?>(id == plan.Id ? plan : null);
        public Task<bool> CodeExistsAsync(string planCode, int fiscalYearId, int? excludedId, CancellationToken cancellationToken) =>
            Task.FromResult(false);
        public Task<FiscalYearPlanningSnapshot?> GetFiscalYearAsync(int fiscalYearId, CancellationToken cancellationToken) =>
            Task.FromResult<FiscalYearPlanningSnapshot?>(new FiscalYearPlanningSnapshot(
                4, new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31), new HashSet<int> { 100 }, "Open"));
        public Task<PositionPlanningSnapshot?> GetPositionAsync(int positionId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<bool> IsBranchAvailableAsync(int branchId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<int> GetBaselineHeadcountAsync(int positionId, int? branchId, DateOnly asOfDate, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public void RemovePeriodTargets(IReadOnlyCollection<WorkforcePlanLinePeriodTarget> targets) => throw new NotSupportedException();
        public void RemoveLines(IReadOnlyCollection<WorkforcePlanLine> lines) => throw new NotSupportedException();
        public void ApplyRowVersion(WorkforcePlan plan, string rowVersion) { }
    }

    private sealed class StubPlanReadStore : IWorkforcePlanReadStore
    {
        public Task<PageResponse<WorkforcePlanListItemResponse>> GetPageAsync(GetWorkforcePlansQuery query, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<WorkforcePlanDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult<WorkforcePlanDetailResponse?>(new WorkforcePlanDetailResponse(
                9, Guid.NewGuid(), "WP-2027", 4, 1, null, "Plan", "خطة", null,
                WorkforcePlanStatus.Approved, null, null, DateTimeOffset.UtcNow, "creator",
                null, null, null, null, null, [], DateTime.UtcNow, null, false, "AQ=="));
        public Task<IReadOnlyList<WorkforcePlanDetailResponse>> GetRevisionsAsync(int id, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
    }

    private sealed class RecordingUnitOfWork : IUnitOfWork
    {
        public async Task<TResult> ExecuteAtomicallyAsync<TResult>(
            IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation,
            CancellationToken cancellationToken = default) => await operation(cancellationToken);

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) => Task.FromResult(1);
    }

    private sealed class RecordingDispatcher : IRealtimeChangeDispatcher
    {
        public void Dispatch(RealtimeChangeRequest request) { }
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}

