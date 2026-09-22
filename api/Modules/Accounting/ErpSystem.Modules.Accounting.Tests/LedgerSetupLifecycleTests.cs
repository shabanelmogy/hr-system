using System.Globalization;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Localization;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Accounting.Tests;

public sealed class LedgerSetupLifecycleTests
{
    [Fact]
    public async Task DimensionDefinitionArchive_IsBlockedWhileAnActiveValueReferencesIt()
    {
        var actor = new TestActor("tenant-1", 7);
        await using var context = CreateContext(actor);
        var definition = new DimensionDefinition("COST_CENTER", "مركز التكلفة", "Cost center", DimensionValueSourceKind.AccountingOwned);
        context.DimensionDefinitions.Add(definition);
        await context.SaveChangesAsync();
        context.DimensionValues.Add(new DimensionValue(definition.Id, "HQ", "الرئيسي", "Head office"));
        await context.SaveChangesAsync();

        var handler = new ArchiveDimensionDefinitionCommandHandler(
            new DimensionWriteStore(context),
            context,
            actor,
            TimeProvider.System,
            Errors());

        var result = await handler.Handle(
            new ArchiveDimensionDefinitionCommand(definition.Id, Convert.ToBase64String(definition.RowVersion)),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Accounting.DimensionDefinition.InUse", result.Error.Code);
        Assert.False(definition.IsDeleted);
    }

    [Fact]
    public async Task BookArchive_IsBlockedWhenCompanySettingsReferenceIt()
    {
        var actor = new TestActor("tenant-1", 7);
        await using var context = CreateContext(actor);
        var currency = new Currency("USD", "US Dollar", "دولار أمريكي", "$");
        var book = new Book("PRIMARY", "الدفتر الرئيسي", "Primary book");
        context.Currencies.Add(currency);
        context.Books.Add(book);
        await context.SaveChangesAsync();
        context.AccountingCompanySettings.Add(new AccountingCompanySettings(currency.Id, book.Id));
        await context.SaveChangesAsync();

        var handler = new ArchiveBookCommandHandler(
            new BookWriteStore(context),
            context,
            actor,
            TimeProvider.System,
            Errors());

        var result = await handler.Handle(
            new ArchiveBookCommand(book.Id, Convert.ToBase64String(book.RowVersion)),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Accounting.Book.InUse", result.Error.Code);
        Assert.False(book.IsDeleted);
    }

    [Fact]
    public async Task ArchivedDimensionValues_AreDiscoverableByRecordStatus()
    {
        var actor = new TestActor("tenant-1", 7);
        await using var context = CreateContext(actor);
        var definition = new DimensionDefinition("COST_CENTER", "مركز التكلفة", "Cost center", DimensionValueSourceKind.AccountingOwned);
        context.DimensionDefinitions.Add(definition);
        await context.SaveChangesAsync();
        var active = new DimensionValue(definition.Id, "HQ", "الرئيسي", "Head office");
        var archived = new DimensionValue(definition.Id, "OLD", "قديم", "Old") { IsDeleted = true };
        context.DimensionValues.AddRange(active, archived);
        await context.SaveChangesAsync();

        var store = new DimensionReadStore(context);
        var activeRows = await store.ValuesAsync(definition.Id, "active", 1, 100, CancellationToken.None);
        var archivedRows = await store.ValuesAsync(definition.Id, "archived", 1, 100, CancellationToken.None);
        var allRows = await store.ValuesAsync(definition.Id, "all", 1, 100, CancellationToken.None);
        var firstPage = await store.ValuesAsync(definition.Id, "all", 1, 1, CancellationToken.None);
        var secondPage = await store.ValuesAsync(definition.Id, "all", 2, 1, CancellationToken.None);

        Assert.Equal("HQ", Assert.Single(activeRows).Code);
        Assert.Equal("OLD", Assert.Single(archivedRows).Code);
        Assert.Equal(2, allRows.Count);
        Assert.Equal("HQ", Assert.Single(firstPage).Code);
        Assert.Equal("OLD", Assert.Single(secondPage).Code);
    }

    [Fact]
    public void LedgerSetupErrors_UseAccountingOwnedArabicResources()
    {
        var originalCulture = CultureInfo.CurrentCulture;
        var originalUiCulture = CultureInfo.CurrentUICulture;
        try
        {
            CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("ar-EG");
            CultureInfo.CurrentUICulture = CultureInfo.GetCultureInfo("ar-EG");
            var errors = Errors();

            Assert.Contains("المستأجر", errors.ScopeRequired.Description, StringComparison.Ordinal);
            Assert.Contains("الدفتر المحاسبي", errors.NotFound("Book").Description, StringComparison.Ordinal);
            Assert.Equal("Accounting.Book.NotFound", errors.NotFound("Book").Code);
        }
        finally
        {
            CultureInfo.CurrentCulture = originalCulture;
            CultureInfo.CurrentUICulture = originalUiCulture;
        }
    }

    [Fact]
    public async Task ArchivedBusinessKeys_RemainReservedAndAreRejectedBeforeCommit()
    {
        var actor = new TestActor("tenant-1", 7);
        await using var context = CreateContext(actor);
        var level = new AccountHierarchyLevel(1, "المستوى", "Level", canPost: true) { IsDeleted = true };
        var definition = new DimensionDefinition("COST_CENTER", "مركز التكلفة", "Cost center", DimensionValueSourceKind.AccountingOwned) { IsDeleted = true };
        var book = new Book("PRIMARY", "الدفتر الرئيسي", "Primary book") { IsDeleted = true };
        var rateType = new ExchangeRateType("SPOT", "فوري", "Spot") { IsDeleted = true };
        context.AddRange(level, definition, book, rateType);
        await context.SaveChangesAsync();

        var account = new Account(
            "1000",
            "النقدية",
            "Cash",
            level.Id,
            null,
            allowPosting: true,
            ManualPostingPolicy.Allowed,
            AccountCurrencyPolicy.Any,
            null) { IsDeleted = true };
        var value = new DimensionValue(definition.Id, "HQ", "الرئيسي", "Head office") { IsDeleted = true };
        var journal = new JournalDefinition(
            book.Id,
            "GENERAL",
            "اليومية العامة",
            "General journal",
            "GENERAL",
            "GJ",
            6,
            JournalNumberingResetPolicy.FiscalYear) { IsDeleted = true };
        context.AddRange(account, value, journal);
        await context.SaveChangesAsync();

        Assert.True(await new AccountHierarchyLevelStore(context).LevelNumberExistsAsync(1, null, CancellationToken.None));
        Assert.True(await new AccountWriteStore(context).CodeExistsAsync("1000", null, CancellationToken.None));
        var dimensions = new DimensionWriteStore(context);
        Assert.True(await dimensions.DefinitionCodeExistsAsync("COST_CENTER", null, CancellationToken.None));
        Assert.True(await dimensions.ValueCodeExistsAsync(definition.Id, "HQ", null, CancellationToken.None));
        Assert.True(await new BookWriteStore(context).CodeExistsAsync("PRIMARY", null, CancellationToken.None));
        Assert.True(await new JournalDefinitionWriteStore(context).CodeExistsAsync(book.Id, "GENERAL", null, CancellationToken.None));
        Assert.True(await new ExchangeRateTypeStore(context).CodeExistsAsync("SPOT", null, CancellationToken.None));
    }

    private static AccountingDbContext CreateContext(ICurrentActor actor)
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new AccountingDbContext(options, actor, TimeProvider.System);
    }

    private static LedgerSetupErrors Errors() => new(new AccountingLedgerSetupJsonLocalizer());

    private sealed record TestActor(string Tenant, int Company) : ICurrentActor
    {
        public string? UserId => "user-1";
        public string? TenantId => Tenant;
        public int? CompanyId => Company;
        public string? MachineName => "tests";
        public bool IsInRole(string role) => false;
    }
}
