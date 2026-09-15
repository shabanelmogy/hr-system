using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.Modules.HR.Domain.OrganizationalStructure.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace ErpSystem.Modules.HR.Tests;

public sealed class HrApplicationDbContextScopeTests
{
    [Fact]
    public async Task SaveChangesAsync_RejectsTenantEntityWhenCurrentTenantIsMissing()
    {
        await using var context = CreateContext(new TestActor("actor-1", null, null));
        context.Candidates.Add(CreateCandidate("explicit-tenant"));

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => context.SaveChangesAsync());

        Assert.Contains("tenant scope is required", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task SaveChangesAsync_RejectsCompanyEntityWhenCurrentCompanyIsMissing()
    {
        await using var context = CreateContext(new TestActor("actor-1", "tenant-1", null));
        context.Branches.Add(CreateBranch("tenant-1", 42));

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => context.SaveChangesAsync());

        Assert.Contains("company scope is required", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task SaveChangesAsync_RejectsTenantScopeMutationOnExistingEntity()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        await using var context = CreateContext(databaseName, new TestActor("actor-1", "tenant-1", null));
        var candidate = CreateCandidate("tenant-1");
        context.Candidates.Add(candidate);
        await context.SaveChangesAsync();

        candidate.TenantId = "tenant-2";
        candidate.UpdateContact("updated@example.com", null);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => context.SaveChangesAsync());

        Assert.NotNull(exception);

        await using var verification = CreateContext(databaseName, new TestActor("actor-1", "tenant-1", null));
        var persisted = await verification.Candidates.IgnoreQueryFilters().SingleAsync();
        Assert.Equal("tenant-1", persisted.TenantId);
    }

    [Fact]
    public async Task SaveChangesAsync_RejectsCompanyScopeMutationOnExistingEntity()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        await using var context = CreateContext(databaseName, new TestActor("actor-1", "tenant-1", 1));
        var branch = CreateBranch("tenant-1", 1);
        context.Branches.Add(branch);
        await context.SaveChangesAsync();

        branch.CompanyId = 2;
        branch.UpdateContact("updated@example.com", null);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => context.SaveChangesAsync());

        Assert.NotNull(exception);

        await using var verification = CreateContext(databaseName, new TestActor("actor-1", "tenant-1", 1));
        var persisted = await verification.Branches.IgnoreQueryFilters().SingleAsync();
        Assert.Equal(1, persisted.CompanyId);
    }

    [Fact]
    public async Task SaveChangesAsync_PreservesCreationAuditAndConfiguresRowVersion()
    {
        var now = new DateTimeOffset(2026, 8, 11, 9, 30, 0, TimeSpan.Zero);
        await using var context = CreateContext(
            new TestActor("actor-1", "tenant-1", null),
            new FixedTimeProvider(now));

        var candidateType = context.Model.FindEntityType(typeof(Candidate))!;
        var rowVersion = candidateType.FindProperty(nameof(AuditableEntity.RowVersion))!;
        Assert.True(rowVersion.IsConcurrencyToken);
        Assert.Equal(ValueGenerated.OnAddOrUpdate, rowVersion.ValueGenerated);
        Assert.True(candidateType.FindProperty(nameof(Candidate.TenantId))!.IsConcurrencyToken);

        var branchType = context.Model.FindEntityType(typeof(Branch))!;
        Assert.True(branchType.FindProperty(nameof(Branch.TenantId))!.IsConcurrencyToken);
        Assert.True(branchType.FindProperty(nameof(Branch.CompanyId))!.IsConcurrencyToken);

        var candidate = CreateCandidate("tenant-1");
        context.Candidates.Add(candidate);
        await context.SaveChangesAsync();

        var createdOn = candidate.CreatedOn;
        var createdBy = candidate.CreatedById;
        candidate.UpdateContact("updated@example.com", null);
        await context.SaveChangesAsync();

        Assert.Equal(createdOn, candidate.CreatedOn);
        Assert.Equal(createdBy, candidate.CreatedById);
        Assert.Equal("actor-1", candidate.UpdatedById);
        Assert.Equal(now.UtcDateTime, candidate.UpdatedOn);
    }

    [Fact]
    public async Task JobRequisitionEnumDefaults_KeepDatabaseDefaultsAndExplicitZeroSentinels()
    {
        await using var context = CreateContext(new TestActor("actor-1", "tenant-1", 1));
        var entityType = context.Model.FindEntityType(typeof(JobRequisition))!;

        var requisitionType = entityType.FindProperty(nameof(JobRequisition.Type))!;
        Assert.Equal(RequisitionType.NewPosition, requisitionType.GetDefaultValue());
        Assert.Equal((RequisitionType)0, requisitionType.Sentinel);

        var planningSource = entityType.FindProperty(nameof(JobRequisition.PlanningSource))!;
        Assert.Equal(PlanningSource.Legacy, planningSource.GetDefaultValue());
        Assert.Equal((PlanningSource)0, planningSource.Sentinel);
    }

    private static ApplicationDbContext CreateContext(
        ICurrentActor actor,
        TimeProvider? timeProvider = null) =>
        CreateContext(Guid.NewGuid().ToString("N"), actor, timeProvider);

    private static ApplicationDbContext CreateContext(
        string databaseName,
        ICurrentActor actor,
        TimeProvider? timeProvider = null)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new ApplicationDbContext(options, actor, timeProvider ?? TimeProvider.System);
    }

    private static Candidate CreateCandidate(string tenantId) =>
        new("First", "Last", "first@example.com")
        {
            TenantId = tenantId
        };

    private static Branch CreateBranch(string tenantId, int companyId) =>
        new("HQ", "Headquarters", "المقر", "Africa/Cairo", new DateOnly(2026, 1, 1))
        {
            TenantId = tenantId,
            CompanyId = companyId
        };

    private sealed class TestActor(string? userId, string? tenantId, int? companyId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}

