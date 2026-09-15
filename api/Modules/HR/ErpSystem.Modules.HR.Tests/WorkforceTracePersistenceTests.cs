using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.WorkforcePlanning.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace ErpSystem.Modules.HR.Tests;

public sealed class WorkforceTracePersistenceTests
{
    [Fact]
    public async Task TraceEdgesAlwaysReferenceReturnedNodes_AndFinancialsCanBeRedacted()
    {
        var actor = new TestActor("tenant-1", 11);
        await using var context = CreateContext(actor);
        var application = new EmploymentApplication(1, 1, ApplicationSource.CareersPortal, DateTimeOffset.UtcNow)
        {
            TenantId = actor.TenantId!, CompanyId = actor.CompanyId!.Value, CreatedById = "candidate-service"
        };
        SetId(application, 101);
        var offer = new JobOffer(
            "OFF-101", application.Id, 10, 20, 30, 10_000m, "EGP", PayFrequency.Monthly,
            EmploymentType.FullTime, WorkArrangement.Hybrid, new DateOnly(2027, 2, 1))
        {
            TenantId = actor.TenantId!, CompanyId = actor.CompanyId.Value, CreatedById = "recruiter"
        };
        SetId(offer, 201);
        offer.SubmitForApproval(DateTimeOffset.UtcNow, "recruiter", 120_000m, 100_000m, 10_000m, "2026-09-V1");
        context.EmploymentApplications.Add(application);
        context.JobOffers.Add(offer);
        await context.SaveChangesAsync();

        var store = new WorkforceTraceReadStore(context, new OpenFiscalYearPlanningSource(), actor);
        var redacted = await store.GetTraceByApplicationAsync(application.Id, includeFinancials: false, CancellationToken.None);
        var visible = await store.GetTraceByApplicationAsync(application.Id, includeFinancials: true, CancellationToken.None);

        Assert.NotNull(redacted);
        var nodeKeys = redacted!.Nodes.Select(node => node.Key).ToHashSet(StringComparer.Ordinal);
        Assert.Contains(redacted.Nodes, node => node.Key == "offer-201");
        Assert.All(redacted.Edges, edge =>
        {
            Assert.Contains(edge.FromKey, nodeKeys);
            Assert.Contains(edge.ToKey, nodeKeys);
        });
        Assert.All(redacted.Nodes, node =>
        {
            Assert.Null(node.FiscalCost);
            Assert.Null(node.CurrencyCode);
        });

        Assert.NotNull(visible);
        Assert.Contains(visible!.Nodes, node => node.FiscalCost == 100_000m && node.CurrencyCode == "EGP");
    }

    [Fact]
    public async Task TraceDoesNotCrossTenantOrReturnMissingRoots()
    {
        var databaseName = Guid.NewGuid().ToString();
        await using (var foreignContext = CreateContext(new TestActor("tenant-2", 22), databaseName))
        {
            var foreignApplication = new EmploymentApplication(1, 1, ApplicationSource.CareersPortal, DateTimeOffset.UtcNow)
            {
                TenantId = "tenant-2", CompanyId = 22, CreatedById = "other-tenant"
            };
            SetId(foreignApplication, 301);
            foreignContext.EmploymentApplications.Add(foreignApplication);
            await foreignContext.SaveChangesAsync();
        }

        var actor = new TestActor("tenant-1", 11);
        await using var context = CreateContext(actor, databaseName);

        var store = new WorkforceTraceReadStore(context, new OpenFiscalYearPlanningSource(), actor);

        Assert.Null(await store.GetTraceByApplicationAsync(301, includeFinancials: true, CancellationToken.None));
        Assert.Null(await store.GetTraceByOfferAsync(99999, includeFinancials: false, CancellationToken.None));
    }

    [Fact]
    public async Task PlanCommitment_IsBoundedAndExcludesSupersededBudgets()
    {
        var actor = new TestActor("tenant-1", 11);
        await using var context = CreateContext(actor);
        const int fiscalYearId = 4;
        var plan = CreatePlan(10, fiscalYearId, "WP-2027");
        var currentBudget = CreateBudget(20, plan.Id, fiscalYearId, "WB-CURRENT", superseded: false);
        var supersededBudget = CreateBudget(21, plan.Id, fiscalYearId, "WB-OLD", superseded: true);
        var currentEnvelope = CreateEnvelope(40, currentBudget, "WB-CURRENT-P11");
        var supersededEnvelope = CreateEnvelope(41, supersededBudget, "WB-OLD-P11");
        context.AddRange(plan, currentBudget, supersededBudget, currentEnvelope, supersededEnvelope);
        await context.SaveChangesAsync();

        var store = new WorkforceTraceReadStore(context, new OpenFiscalYearPlanningSource(), actor);
        var page = await store.GetPlanCommitmentAsync(new GetPlanCommitmentSummaryQuery
        {
            FiscalYearId = fiscalYearId,
            PageNumber = 1,
            PageSize = 1,
            IncludeFinancials = false
        }, includeFinancials: false, CancellationToken.None);

        Assert.Single(page.Items);
        Assert.Equal(1, page.MetaData.TotalCount);
        Assert.Null(page.Items[0].AuthorizedSalaryCost);
        Assert.DoesNotContain(page.Items, row => row.PositionEnvelopeId == supersededEnvelope.Id);
    }

    private static ApplicationDbContext CreateContext(ICurrentActor actor, string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options, actor, TimeProvider.System);
    }

    private static WorkforcePlan CreatePlan(int id, int fiscalYearId, string code)
    {
        var plan = new WorkforcePlan(code, fiscalYearId, "Plan", "خطة", null)
        {
            TenantId = "tenant-1", CompanyId = 11, CreatedById = "planner"
        };
        SetId(plan, id);
        return plan;
    }

    private static WorkforceBudget CreateBudget(int id, int planId, int fiscalYearId, string code, bool superseded)
    {
        var budget = new WorkforceBudget(code, planId, fiscalYearId, 1, "EGP")
        {
            TenantId = "tenant-1", CompanyId = 11, CreatedById = "planner"
        };
        var line = budget.AddLine(11, 10, 2, 3, 4, 3, 300_000m, 0m);
        line.AddPeriodAllocation(100, 3, 300_000m, 0m);
        SetId(budget, id);
        SetId(line, id + 1000);
        budget.Submit(DateTimeOffset.UtcNow, "planner");
        budget.Approve(DateTimeOffset.UtcNow, "approver", true);
        budget.Activate(DateTimeOffset.UtcNow);
        if (superseded) budget.Supersede(DateTimeOffset.UtcNow);
        return budget;
    }

    private static PositionEnvelope CreateEnvelope(int id, WorkforceBudget budget, string code)
    {
        var line = budget.Lines.Single();
        var envelope = PositionEnvelope.FromBudgetLine(budget, line);
        SetId(envelope, id);
        envelope.TenantId = "tenant-1";
        envelope.CompanyId = 11;
        envelope.CreatedById = "planner";
        return envelope;
    }

    private static void SetId(object entity, int id) => entity.GetType().GetProperty("Id")!.SetValue(entity, id);

    private sealed record TestActor(string? TenantId, int? CompanyId) : ICurrentActor
    {
        public string? UserId => "trace-reader";
    }

    private sealed class OpenFiscalYearPlanningSource : IFiscalYearPlanningSource
    {
        public Task<FiscalYearPlanningSnapshot?> GetAsync(
            string tenantId,
            int companyId,
            int fiscalYearId,
            CancellationToken cancellationToken) =>
            Task.FromResult<FiscalYearPlanningSnapshot?>(new(
                fiscalYearId,
                $"FY-{fiscalYearId}",
                new DateOnly(2027, 1, 1),
                new DateOnly(2027, 12, 31),
                new HashSet<int>(),
                "Open"));
    }
}

