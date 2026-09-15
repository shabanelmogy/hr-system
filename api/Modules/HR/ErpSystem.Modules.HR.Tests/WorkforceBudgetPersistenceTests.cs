using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.WorkforcePlanning.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.HR.Tests;

public sealed class WorkforceBudgetPersistenceTests
{
    [Fact]
    public void Model_EnforcesOneBudgetPerPlanRevisionAndOneEffectiveBudgetPerYear()
    {
        using var context = CreateContext();
        var budget = context.Model.FindEntityType(typeof(WorkforceBudget))!;

        Assert.Contains(budget.GetIndexes(), index => index.IsUnique &&
            index.Properties.Select(property => property.Name)
                .SequenceEqual(["TenantId", "CompanyId", "WorkforcePlanId"]));
        Assert.Contains(budget.GetIndexes(), index => index.IsUnique &&
            index.GetDatabaseName() == "UX_WorkforceBudgets_OneEffectivePerFiscalYear");
    }

    [Fact]
    public void Model_EnforcesOneEnvelopePerBudgetLineAndMoneyPrecision()
    {
        var sqlOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Server=(local);Database=WorkforcePlanningPhase2ModelCheck;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;
        using var context = new ApplicationDbContext(sqlOptions, new TestActor(), TimeProvider.System);
        var envelope = context.Model.FindEntityType(typeof(PositionEnvelope))!;
        var line = context.Model.FindEntityType(typeof(WorkforceBudgetLine))!;
        var allocation = context.Model.FindEntityType(typeof(WorkforceBudgetPeriodAllocation))!;

        Assert.Contains(envelope.GetIndexes(), index => index.IsUnique &&
            index.Properties.Select(property => property.Name)
                .SequenceEqual(["TenantId", "CompanyId", "WorkforceBudgetLineId"]));
        Assert.Contains(line.GetIndexes(), index => index.IsUnique &&
            index.Properties.Select(property => property.Name)
                .SequenceEqual(["TenantId", "CompanyId", "WorkforceBudgetId", "WorkforcePlanLineId"]));
        Assert.Contains(allocation.GetIndexes(), index => index.IsUnique &&
            index.Properties.Select(property => property.Name)
                .SequenceEqual(["TenantId", "CompanyId", "WorkforceBudgetLineId", "FiscalPeriodId"]));
        Assert.Equal("decimal(18,2)", line.FindProperty(nameof(WorkforceBudgetLine.AllocatedSalaryBudget))!.GetColumnType());
        Assert.Equal("decimal(18,2)", allocation.FindProperty(nameof(WorkforceBudgetPeriodAllocation.AllocatedSalaryCost))!.GetColumnType());
        Assert.Null(line.FindProperty(nameof(WorkforceBudgetLine.TotalAllocatedBudget)));
        Assert.Null(envelope.FindProperty(nameof(PositionEnvelope.AvailableHeadcount)));
    }

    [Fact]
    public async Task Page_ScopesBudgetsByYearPlanAndStatus()
    {
        await using var context = CreateContext();
        context.WorkforceBudgets.AddRange(Budget("WB-001", 9), Budget("WB-002", 10));
        await context.SaveChangesAsync();
        var store = CreateReadStore(context);

        var byPlan = await store.GetPageAsync(new GetWorkforceBudgetsQuery { WorkforcePlanId = 10 }, CancellationToken.None);
        var bySearch = await store.GetPageAsync(new GetWorkforceBudgetsQuery { Search = "wb-001" }, CancellationToken.None);
        var byStatus = await store.GetPageAsync(new GetWorkforceBudgetsQuery { Status = "approved" }, CancellationToken.None);

        Assert.Single(byPlan.Items);
        Assert.Equal("WB-002", byPlan.Items[0].BudgetCode);
        Assert.Single(bySearch.Items);
        Assert.Empty(byStatus.Items);
    }

    [Fact]
    public async Task Detail_ProjectsNestedLinesAndDerivedTotals()
    {
        await using var context = CreateContext();
        var budget = Budget("WB-001", 9);
        var line = budget.AddLine(11, 10, 2, 3, 4, 2, 120000m, 8000m);
        line.AddPeriodAllocation(100, 2, 120000m, 8000m);
        context.WorkforceBudgets.Add(budget);
        await context.SaveChangesAsync();
        var store = CreateReadStore(context);

        var detail = await store.GetByIdAsync(budget.Id, CancellationToken.None);

        Assert.NotNull(detail);
        Assert.Equal(2, detail.TotalAuthorizedHeadcount);
        Assert.Equal(128000m, detail.GrandTotalBudget);
        var projected = Assert.Single(detail.Lines);
        Assert.Equal(128000m, projected.TotalAllocatedBudget);
        Assert.Single(projected.PeriodAllocations);
    }

    [Theory]
    [InlineData(100)]
    [InlineData(5000)]
    public async Task Page_AcceptsClientPageSizesUsedByUi(int pageSize)
    {
        await using var context = CreateContext();
        context.WorkforceBudgets.Add(Budget("WB-001", 9));
        await context.SaveChangesAsync();
        var store = CreateReadStore(context);

        var page = await store.GetPageAsync(new GetWorkforceBudgetsQuery { PageNumber = 1, PageSize = pageSize }, CancellationToken.None);

        Assert.Single(page.Items);
        Assert.Equal(pageSize, page.MetaData.PageSize);
    }

    [Theory]
    [InlineData(100)]
    [InlineData(5000)]
    public async Task SourcePlans_AcceptsClientPageSizesUsedByUi(int pageSize)
    {
        await using var context = CreateContext();
        var store = CreateReadStore(context);

        var page = await store.GetSourcePlansAsync(new GetBudgetSourcePlansQuery { PageNumber = 1, PageSize = pageSize }, CancellationToken.None);

        Assert.Empty(page.Items);
        Assert.Equal(pageSize, page.MetaData.PageSize);
    }

    [Theory]
    [InlineData(100)]
    [InlineData(5000)]
    public async Task Envelopes_AcceptsClientPageSizesUsedByUi(int pageSize)
    {
        await using var context = CreateContext();
        var store = CreateReadStore(context);

        var page = await store.GetEnvelopesAsync(new GetPositionEnvelopesQuery { PageNumber = 1, PageSize = pageSize }, CancellationToken.None);

        Assert.Empty(page.Items);
        Assert.Equal(pageSize, page.MetaData.PageSize);
    }

    private static WorkforceBudget Budget(string code, int planId) => new(code, planId, 4, 1, "EGP")
    {
        TenantId = "tenant-1",
        CompanyId = 11,
        CreatedById = "admin"
    };

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new TestActor(), TimeProvider.System);
    }

    private static WorkforceBudgetReadStore CreateReadStore(ApplicationDbContext context) =>
        new(context, new OpenFiscalYearPlanningSource(), new TestActor());

    private sealed class TestActor : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 11;
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

