using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Errors;
using ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Entities;
using ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Enums;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.FiscalYears.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Queries.GetFiscalYears;

namespace ErpSystem.Modules.Accounting.Tests;

public sealed class FiscalYearCompanyIsolationTests
{
    [Fact]
    public async Task CreateHandler_StampsTrustedScopeAcrossTheAggregate()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var actor = new TestActor("tenant-1", 11);
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var scheduler = new RecordingScheduler();
        var handler = new CreateFiscalYearCommandHandler(
            new FiscalYearWriteStore(context),
            new FiscalYearReadStore(context),
            context,
            scheduler,
            actor,
            new FiscalYearErrors(new EchoLocalizer<CreateFiscalYearRequest>()));

        var result = await handler.Handle(new CreateFiscalYearCommand(
            "FY-2027", "السنة المالية 2027", "Fiscal Year 2027",
            new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31),
            FiscalPeriodFrequency.Monthly), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("tenant-1", (await context.FiscalYears.SingleAsync()).TenantId);
        Assert.Equal(11, (await context.FiscalYears.SingleAsync()).CompanyId);
        Assert.All(await context.FiscalPeriods.ToListAsync(), period =>
        {
            Assert.Equal("tenant-1", period.TenantId);
            Assert.Equal(11, period.CompanyId);
        });
        Assert.Equal(("tenant-1", 11, "Add"),
            (scheduler.Change!.TenantId, scheduler.Change.CompanyId, scheduler.Change.Action));
    }

    [Fact]
    public async Task FiscalYearsAndPeriods_AreVisibleOnlyInTheActiveTenantAndCompany()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using (var first = CreateContext(options, "tenant-1", 11))
        {
            first.FiscalYears.Add(Create("FY-2027", "tenant-1", 11));
            await first.SaveChangesAsync();
        }

        await using (var second = CreateContext(options, "tenant-1", 22))
        {
            Assert.Empty(await second.FiscalYears.AsNoTracking().ToListAsync());
            Assert.Empty(await second.FiscalPeriods.AsNoTracking().ToListAsync());
            second.FiscalYears.Add(Create("FY-2027", "tenant-1", 22));
            await second.SaveChangesAsync();
            Assert.Equal(22, (await second.FiscalYears.SingleAsync()).CompanyId);
            Assert.All(await second.FiscalPeriods.ToListAsync(), period => Assert.Equal(22, period.CompanyId));
        }

        await using var otherTenant = CreateContext(options, "tenant-2", 11);
        Assert.Empty(await otherTenant.FiscalYears.AsNoTracking().ToListAsync());
        Assert.Empty(await otherTenant.FiscalPeriods.AsNoTracking().ToListAsync());
    }

    [Fact]
    public async Task RestoreHandler_RejectsAnOverlapCreatedWhileTheDraftWasArchived()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var actor = new TestActor("tenant-1", 11);
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var archived = Create("FY-OLD", "tenant-1", 11);
        archived.IsDeleted = true;
        context.FiscalYears.AddRange(archived, Create("FY-NEW", "tenant-1", 11));
        await context.SaveChangesAsync();
        var scheduler = new RecordingScheduler();
        var handler = new RestoreFiscalYearCommandHandler(
            new FiscalYearWriteStore(context),
            new FiscalYearReadStore(context),
            context,
            scheduler,
            actor,
            new FiscalYearErrors(new EchoLocalizer<CreateFiscalYearRequest>()));

        var result = await handler.Handle(
            new RestoreFiscalYearCommand(archived.Id, Convert.ToBase64String(archived.RowVersion)),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("FiscalYear.OverlappingDates", result.Error.Code);
        Assert.True(archived.IsDeleted);
        Assert.Null(scheduler.Change);
    }

    [Fact]
    public async Task RepeatedLifecycleTarget_IsIdempotentWithoutAuditOrRealtimeNoise()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var actor = new TestActor("tenant-1", 11);
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var fiscalYear = Create("FY-2027", "tenant-1", 11);
        fiscalYear.Open();
        context.FiscalYears.Add(fiscalYear);
        await context.SaveChangesAsync();
        var scheduler = new RecordingScheduler();
        var auditStore = new RecordingChangeLogStore();
        var handler = new ChangeFiscalYearLifecycleCommandHandler(
            new FiscalYearWriteStore(context),
            new FiscalYearReadStore(context),
            new FiscalYearAuditTrail(auditStore, actor, TimeProvider.System),
            context,
            scheduler,
            actor,
            new FiscalYearErrors(new EchoLocalizer<CreateFiscalYearRequest>()));

        var result = await handler.Handle(new ChangeFiscalYearLifecycleCommand(
            fiscalYear.Id,
            Convert.ToBase64String(fiscalYear.RowVersion),
            FiscalYearLifecycleAction.Open), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(auditStore.Records);
        Assert.Null(scheduler.Change);
    }

    [Fact]
    public async Task ReopenHandler_CommitsAuditAndSchedulesCompanyScopedRefresh()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var actor = new TestActor("tenant-1", 11);
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var fiscalYear = Create("FY-2027", "tenant-1", 11);
        fiscalYear.Open();
        fiscalYear.BeginClosing();
        fiscalYear.Close();
        fiscalYear.Lock();
        context.FiscalYears.Add(fiscalYear);
        await context.SaveChangesAsync();
        var scheduler = new RecordingScheduler();
        var auditStore = new RecordingChangeLogStore();
        var handler = new ChangeFiscalYearLifecycleCommandHandler(
            new FiscalYearWriteStore(context),
            new FiscalYearReadStore(context),
            new FiscalYearAuditTrail(auditStore, actor, TimeProvider.System),
            context,
            scheduler,
            actor,
            new FiscalYearErrors(new EchoLocalizer<CreateFiscalYearRequest>()));

        var result = await handler.Handle(new ChangeFiscalYearLifecycleCommand(
            fiscalYear.Id,
            Convert.ToBase64String(fiscalYear.RowVersion),
            FiscalYearLifecycleAction.Reopen), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(FiscalYearStatus.Open, fiscalYear.Status);
        Assert.All(fiscalYear.Periods, period => Assert.Equal(FiscalPeriodStatus.Open, period.Status));
        var audit = Assert.Single(auditStore.Records);
        Assert.Contains("Locked", audit.JsonOldValues, StringComparison.Ordinal);
        Assert.Contains("Open", audit.JsonNewValues, StringComparison.Ordinal);
        Assert.Equal(("tenant-1", 11, "Update"),
            (scheduler.Change!.TenantId, scheduler.Change.CompanyId, scheduler.Change.Action));
    }

    [Fact]
    public async Task UpdateHandler_PreservesPersistedPeriodsWhenFrequencyIsUnchanged()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var actor = new TestActor("tenant-1", 11);
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var fiscalYear = Create("FY-2027", "tenant-1", 11);
        context.FiscalYears.Add(fiscalYear);
        await context.SaveChangesAsync();
        var originalPeriodIds = fiscalYear.Periods.Select(period => period.Id).ToArray();
        var scheduler = new RecordingScheduler();
        var auditStore = new RecordingChangeLogStore();
        var handler = new UpdateFiscalYearCommandHandler(
            new FiscalYearWriteStore(context),
            new FiscalYearReadStore(context),
            new FiscalYearAuditTrail(auditStore, actor, TimeProvider.System),
            context,
            scheduler,
            actor,
            new FiscalYearErrors(new EchoLocalizer<CreateFiscalYearRequest>()));

        var result = await handler.Handle(new UpdateFiscalYearCommand(
            fiscalYear.Id,
            fiscalYear.Code,
            "السنة المالية المعدلة",
            "Updated Fiscal Year",
            fiscalYear.StartDate,
            fiscalYear.EndDate,
            fiscalYear.PeriodFrequency,
            Convert.ToBase64String(fiscalYear.RowVersion)), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(originalPeriodIds, fiscalYear.Periods.Select(period => period.Id));
        Assert.Equal("Update", scheduler.Change?.Action);
    }

    [Fact]
    public async Task ArchiveHandler_RequiresAndAppliesTheCurrentRowVersion()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var actor = new TestActor("tenant-1", 11);
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var fiscalYear = Create("FY-2027", "tenant-1", 11);
        context.FiscalYears.Add(fiscalYear);
        await context.SaveChangesAsync();
        var rowVersion = Convert.ToBase64String(fiscalYear.RowVersion);
        var scheduler = new RecordingScheduler();
        var handler = new ArchiveFiscalYearCommandHandler(
            new FiscalYearWriteStore(context), context, scheduler, actor, TimeProvider.System,
            new FiscalYearErrors(new EchoLocalizer<CreateFiscalYearRequest>()));

        var result = await handler.Handle(
            new ArchiveFiscalYearCommand(fiscalYear.Id, rowVersion), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.True(fiscalYear.IsDeleted);
        Assert.Equal("Archive", scheduler.Change?.Action);
    }

    [Fact]
    public async Task PageProjection_ExcludesArchivedPeriodsFromPeriodsCount()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var actor = new TestActor("tenant-1", 11);
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var fiscalYear = Create("FY-2027", "tenant-1", 11);
        fiscalYear.Periods.Last().IsDeleted = true;
        context.FiscalYears.Add(fiscalYear);
        await context.SaveChangesAsync();

        var page = await new FiscalYearReadStore(context).GetPageAsync(
            new GetFiscalYearsQuery { RecordStatus = "active", PageNumber = 1, PageSize = 10 },
            CancellationToken.None);

        Assert.Equal(11, Assert.Single(page.Items).PeriodsCount);
    }

    [Fact]
    public async Task FiscalYears_FailClosedWithoutTenantOrCompanyContext()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using (var scoped = CreateContext(options, "tenant-1", 11))
        {
            scoped.FiscalYears.Add(Create("FY-2027", "tenant-1", 11));
            await scoped.SaveChangesAsync();
        }

        await using var noCompany = CreateContext(options, "tenant-1", null);
        Assert.Empty(await noCompany.FiscalYears.AsNoTracking().ToListAsync());
        await using var noTenant = CreateContext(options, null, 11);
        Assert.Empty(await noTenant.FiscalYears.AsNoTracking().ToListAsync());
    }

    [Fact]
    public void Model_UsesCompositeCompanyRelationshipAndUniqueCodes()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        using var context = CreateContext(options, "tenant-1", 11);
        var fiscalYear = context.Model.FindEntityType(typeof(FiscalYear))!;
        var fiscalPeriod = context.Model.FindEntityType(typeof(FiscalPeriod))!;

        Assert.Contains(fiscalYear.GetIndexes(), index => index.IsUnique &&
            index.Properties.Select(property => property.Name)
                .SequenceEqual(["TenantId", "CompanyId", "Code"]));
        var relationship = Assert.Single(fiscalPeriod.GetForeignKeys(), foreignKey =>
            foreignKey.PrincipalEntityType.ClrType == typeof(FiscalYear));
        Assert.Equal(["TenantId", "CompanyId", "FiscalYearId"],
            relationship.Properties.Select(property => property.Name));
        Assert.Equal(["TenantId", "CompanyId", "Id"],
            relationship.PrincipalKey.Properties.Select(property => property.Name));
    }

    private static FiscalYear Create(string code, string tenantId, int companyId)
    {
        var fiscalYear = new FiscalYear(
            code, "السنة المالية 2027", "Fiscal Year 2027",
            new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31),
            FiscalPeriodFrequency.Monthly)
        {
            TenantId = tenantId,
            CompanyId = companyId
        };
        return fiscalYear;
    }

    private static AccountingDbContext CreateContext(
        DbContextOptions<AccountingDbContext> options,
        string? tenantId,
        int? companyId) => new(options, new TestActor(tenantId, companyId), TimeProvider.System);

    private sealed record TestActor(string? TenantId, int? CompanyId) : ICurrentActor
    {
        public string? UserId => "admin";
    }

    private sealed class RecordingScheduler : IFiscalYearChangeScheduler
    {
        public FiscalYearChange? Change { get; private set; }
        public void Schedule(FiscalYearChange change) => Change = change;
    }

    private sealed class RecordingChangeLogStore : IEntityChangeLogStore
    {
        public List<EntityChangeLogRecord> Records { get; } = [];

        public Task AddAsync(
            EntityChangeLogRecord record,
            CancellationToken cancellationToken = default)
        {
            Records.Add(record);
            return Task.CompletedTask;
        }
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, true);
        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(name, arguments), true);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}

