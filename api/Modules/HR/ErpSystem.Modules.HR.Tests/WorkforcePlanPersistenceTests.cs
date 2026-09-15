using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.HR.Domain.Employees.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.WorkforcePlanning.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.HR.Tests;

public sealed class WorkforcePlanPersistenceTests
{
    [Fact]
    public async Task BaselineHeadcount_UsesPositionBranchAndAsOfDate()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = CreateContext(options);
        context.EmployeeAssignments.AddRange(
            Assignment(1, 10, 1, new DateOnly(2027, 1, 1)),
            Assignment(2, 10, 2, new DateOnly(2027, 1, 1)),
            Assignment(3, 10, 1, new DateOnly(2028, 1, 1)),
            Assignment(4, 20, 1, new DateOnly(2027, 1, 1)),
            Assignment(5, 10, 1, new DateOnly(2027, 1, 1), isPrimary: false),
            Assignment(1, 10, 1, new DateOnly(2027, 1, 1)));
        await context.SaveChangesAsync();
        var store = CreateWriteStore(context);

        Assert.Equal(1, await store.GetBaselineHeadcountAsync(10, 1, new DateOnly(2027, 6, 1), CancellationToken.None));
        Assert.Equal(2, await store.GetBaselineHeadcountAsync(10, null, new DateOnly(2027, 6, 1), CancellationToken.None));
        Assert.Equal(2, await store.GetBaselineHeadcountAsync(10, 1, new DateOnly(2028, 6, 1), CancellationToken.None));
    }

    [Fact]
    public async Task Revisions_AreReturnedNewestFirstWithinTheSameSeries()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = CreateContext(options);
        var first = Plan("WP-2027");
        context.WorkforcePlans.Add(first);
        await context.SaveChangesAsync();
        var second = new WorkforcePlan(first.PlanCode, first.FiscalYearId, first.TitleEn, first.TitleAr, null, 2, first.PlanSeriesId, first.Id)
        {
            TenantId = first.TenantId,
            CompanyId = first.CompanyId,
            CreatedById = "admin"
        };
        context.WorkforcePlans.AddRange(second, Plan("OTHER"));
        await context.SaveChangesAsync();

        var revisions = await new WorkforcePlanReadStore(context).GetRevisionsAsync(first.Id, CancellationToken.None);

        Assert.Equal([2, 1], revisions.Select(revision => revision.RevisionNumber));
        Assert.All(revisions, revision => Assert.Equal(first.PlanSeriesId, revision.PlanSeriesId));
    }

    [Fact]
    public void Model_EnforcesOneEffectivePlanPerFiscalYearAndCompany()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        using var context = CreateContext(options);
        var plan = context.Model.FindEntityType(typeof(WorkforcePlan))!;

        Assert.Contains(plan.GetIndexes(), index => index.IsUnique &&
            index.Properties.Select(property => property.Name)
                .SequenceEqual(["TenantId", "CompanyId", "FiscalYearId"]));
    }

    [Fact]
    public void Model_PersistsVacancyTypesAndDerivesHeadcountTotals()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        using var context = CreateContext(options);
        var line = context.Model.FindEntityType(typeof(WorkforcePlanLine))!;

        Assert.NotNull(line.FindProperty(nameof(WorkforcePlanLine.NewHireSlots)));
        Assert.NotNull(line.FindProperty(nameof(WorkforcePlanLine.ReplacementSlots)));
        Assert.Null(line.FindProperty(nameof(WorkforcePlanLine.TargetHeadcount)));
        Assert.Null(line.FindProperty(nameof(WorkforcePlanLine.PlannedHiringSlots)));
    }


    [Fact]
    public void ApplyRowVersion_MarksParentForUpdateSoAggregateConcurrencyIsEnforced()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        using var context = CreateContext(options);
        var plan = Plan("ROWVERSION");
        plan.RowVersion = [1, 2, 3, 4];
        context.Attach(plan);
        context.Entry(plan).State = EntityState.Unchanged;
        var store = CreateWriteStore(context);

        store.ApplyRowVersion(plan, Convert.ToBase64String([9, 8, 7, 6]));

        var entry = context.Entry(plan);
        Assert.Equal(EntityState.Modified, entry.State);
        Assert.True(entry.Property(item => item.UpdatedOn).IsModified);
        Assert.Equal([9, 8, 7, 6], entry.Property(item => item.RowVersion).OriginalValue);
    }
    [Fact]
    public async Task Page_RecordStatusSeparatesActiveAndArchivedPlans()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = CreateContext(options);
        var active = Plan("ACTIVE");
        var archived = Plan("ARCHIVED");
        archived.IsDeleted = true;
        context.WorkforcePlans.AddRange(active, archived);
        await context.SaveChangesAsync();
        var store = new WorkforcePlanReadStore(context);

        var activePage = await store.GetPageAsync(new GetWorkforcePlansQuery { RecordStatus = "active" }, CancellationToken.None);
        var archivedPage = await store.GetPageAsync(new GetWorkforcePlansQuery { RecordStatus = "archived" }, CancellationToken.None);
        var allPage = await store.GetPageAsync(new GetWorkforcePlansQuery { RecordStatus = "all" }, CancellationToken.None);

        Assert.Single(activePage.Items);
        Assert.False(activePage.Items[0].IsDeleted);
        Assert.Single(archivedPage.Items);
        Assert.True(archivedPage.Items[0].IsDeleted);
        Assert.Equal(2, allPage.Items.Count);
    }

    private static EmployeeAssignment Assignment(int employeeId, int positionId, int branchId, DateOnly effectiveFrom, bool isPrimary = true) =>
        new(employeeId, positionId, branchId, 1, effectiveFrom, isPrimary)
        {
            TenantId = "tenant-1",
            CompanyId = 11,
            CreatedById = "admin"
        };

    private static WorkforcePlan Plan(string code) => new(code, 1, code, code, null)
    {
        TenantId = "tenant-1",
        CompanyId = 11,
        CreatedById = "admin"
    };

    private static ApplicationDbContext CreateContext(DbContextOptions<ApplicationDbContext> options) =>
        new(options, new TestActor(), TimeProvider.System);

    private static WorkforcePlanWriteStore CreateWriteStore(ApplicationDbContext context) =>
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

