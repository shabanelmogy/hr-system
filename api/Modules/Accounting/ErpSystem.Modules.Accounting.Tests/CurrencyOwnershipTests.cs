using System.Reflection;
using System.Runtime.CompilerServices;
using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Errors;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Queries;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.Accounting.Contracts.Authorization;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Persistence;
using ErpSystem.Modules.Accounting.Presentation.Features.Finance.LedgerSetup.Currencies.V1;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Accounting.Tests;

public sealed class CurrencyOwnershipTests
{
    [Fact]
    public void DomainCurrency_NormalizesIsoCodeAndRejectsInvalidCodes()
    {
        var currency = new Currency(" egp ", "Egyptian Pound", "الجنيه المصري", "ج.م");

        Assert.Equal("EGP", currency.CurrencyCode);
        Assert.ThrowsAny<Exception>(() => new Currency("EG", "Pound", "جنيه", "£"));
        Assert.ThrowsAny<Exception>(() => new Currency("12A", "Bad", "غير صالح", "?"));
    }

    [Fact]
    public async Task CreateHandler_StampsTrustedTenantAndCompany()
    {
        var actor = new TestActor("tenant-1", 11);
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var handler = new CreateCurrencyCommandHandler(
            new CurrencyWriteStore(context),
            new CurrencyReadStore(context),
            context,
            actor,
            new CurrencyErrors(new EchoLocalizer<CreateCurrencyRequest>()));

        var result = await handler.Handle(
            new CreateCurrencyCommand("usd", "US Dollar", "دولار أمريكي", "$"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        var persisted = await context.Currencies.SingleAsync();
        Assert.Equal("USD", persisted.CurrencyCode);
        Assert.Equal("tenant-1", persisted.TenantId);
        Assert.Equal(11, persisted.CompanyId);
    }

    [Fact]
    public async Task CreateHandler_FailsClosedWithoutTrustedCompanyContext()
    {
        var actor = new TestActor("tenant-1", null);
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var handler = new CreateCurrencyCommandHandler(
            new CurrencyWriteStore(context),
            new CurrencyReadStore(context),
            context,
            actor,
            new CurrencyErrors(new EchoLocalizer<CreateCurrencyRequest>()));

        var result = await handler.Handle(
            new CreateCurrencyCommand("USD", "US Dollar", "دولار أمريكي", "$"),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Currency.CompanyContextRequired", result.Error.Code);
        Assert.Empty(context.Currencies.IgnoreQueryFilters());
    }

    [Fact]
    public async Task CreateHandler_KeepsArchivedCodeReservedWithinCompany()
    {
        var actor = new TestActor("tenant-1", 11);
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var archived = Create("USD", "tenant-1", 11);
        archived.IsDeleted = true;
        context.Currencies.Add(archived);
        await context.SaveChangesAsync();
        var handler = new CreateCurrencyCommandHandler(
            new CurrencyWriteStore(context),
            new CurrencyReadStore(context),
            context,
            actor,
            new CurrencyErrors(new EchoLocalizer<CreateCurrencyRequest>()));

        var result = await handler.Handle(
            new CreateCurrencyCommand(" usd ", "US Dollar", "دولار أمريكي", "$"),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Currency.DuplicateCode", result.Error.Code);
        Assert.Single(context.Currencies.IgnoreQueryFilters());
    }

    [Fact]
    public async Task ArchiveHandler_BlocksCurrencyReferencedByAccountingSettings()
    {
        var actor = new TestActor("tenant-1", 11);
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var currency = Create("USD", "tenant-1", 11);
        context.Currencies.Add(currency);
        await context.SaveChangesAsync();
        context.AccountingCompanySettings.Add(new AccountingCompanySettings(currency.Id, 999));
        await context.SaveChangesAsync();

        var handler = new ArchiveCurrencyCommandHandler(
            new CurrencyWriteStore(context),
            context,
            actor,
            TimeProvider.System,
            new CurrencyErrors(new EchoLocalizer<CreateCurrencyRequest>()));

        var result = await handler.Handle(
            new ArchiveCurrencyCommand(currency.Id, Convert.ToBase64String(currency.RowVersion)),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Currency.InUse", result.Error.Code);
        Assert.False(currency.IsDeleted);
    }

    [Fact]
    public async Task ArchiveHandler_BlocksCurrencyReferencedByAccount()
    {
        var actor = new TestActor("tenant-1", 11);
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var currency = Create("USD", "tenant-1", 11);
        context.Currencies.Add(currency);
        await context.SaveChangesAsync();
        context.Accounts.Add(new Account(
            "1000",
            "حساب",
            "Account",
            1,
            null,
            true,
            ManualPostingPolicy.Allowed,
            AccountCurrencyPolicy.SpecificCurrency,
            currency.Id)
        {
            TenantId = "tenant-1",
            CompanyId = 11
        });
        await context.SaveChangesAsync();

        var result = await Archive(context, actor, currency);

        Assert.True(result.IsFailure);
        Assert.Equal("Currency.InUse", result.Error.Code);
        Assert.False(currency.IsDeleted);
    }

    [Fact]
    public async Task ArchiveHandler_BlocksCurrencyReferencedByExchangeRate()
    {
        var actor = new TestActor("tenant-1", 11);
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var usd = Create("USD", "tenant-1", 11);
        var eur = Create("EUR", "tenant-1", 11);
        context.Currencies.AddRange(usd, eur);
        await context.SaveChangesAsync();
        context.ExchangeRates.Add(new ExchangeRate(
            1,
            usd.Id,
            eur.Id,
            new DateOnly(2026, 9, 22),
            null,
            1,
            1.25m)
        {
            TenantId = "tenant-1",
            CompanyId = 11
        });
        await context.SaveChangesAsync();

        var result = await Archive(context, actor, usd);

        Assert.True(result.IsFailure);
        Assert.Equal("Currency.InUse", result.Error.Code);
        Assert.False(usd.IsDeleted);
    }

    [Fact]
    public async Task ArchiveAndRestoreHandlers_UseSoftDeleteLifecycle()
    {
        var actor = new TestActor("tenant-1", 11);
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var currency = Create("USD", "tenant-1", 11);
        context.Currencies.Add(currency);
        await context.SaveChangesAsync();
        var stores = new CurrencyWriteStore(context);
        var errors = new CurrencyErrors(new EchoLocalizer<CreateCurrencyRequest>());

        var archive = new ArchiveCurrencyCommandHandler(stores, context, actor, TimeProvider.System, errors);
        var archiveResult = await archive.Handle(
            new ArchiveCurrencyCommand(currency.Id, Convert.ToBase64String(currency.RowVersion)),
            CancellationToken.None);

        Assert.True(archiveResult.IsSuccess);
        Assert.True(currency.IsDeleted);
        Assert.NotNull(currency.DeletedOn);

        var restore = new RestoreCurrencyCommandHandler(stores, new CurrencyReadStore(context), context, actor, errors);
        var restoreResult = await restore.Handle(
            new RestoreCurrencyCommand(currency.Id, Convert.ToBase64String(currency.RowVersion)),
            CancellationToken.None);

        Assert.True(restoreResult.IsSuccess);
        Assert.False(currency.IsDeleted);
        Assert.Null(currency.DeletedOn);
        Assert.Equal("USD", restoreResult.Value.CurrencyCode);
    }

    [Fact]
    public async Task Catalog_IsReadOnlyActiveAndCompanyIsolated()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        await using (var company11 = new AccountingDbContext(options, new TestActor("tenant-1", 11), TimeProvider.System))
        {
            company11.Currencies.Add(Create("USD", "tenant-1", 11));
            var archived = Create("EUR", "tenant-1", 11);
            archived.IsDeleted = true;
            company11.Currencies.Add(archived);
            await company11.SaveChangesAsync();
        }

        await using (var company22 = new AccountingDbContext(options, new TestActor("tenant-1", 22), TimeProvider.System))
        {
            company22.Currencies.Add(Create("GBP", "tenant-1", 22));
            await company22.SaveChangesAsync();
        }

        await using var scoped = new AccountingDbContext(options, new TestActor("tenant-1", 11), TimeProvider.System);
        IAccountingCurrencyCatalog catalog = new AccountingCurrencyCatalog(scoped);

        var active = await catalog.GetActiveAsync("tenant-1", 11, CancellationToken.None);
        var foreignCompany = await catalog.FindActiveByCodeAsync("tenant-1", 22, "GBP", CancellationToken.None);

        Assert.Equal("USD", Assert.Single(active).CurrencyCode);
        Assert.Null(foreignCompany);
        Assert.Null(await catalog.FindActiveByCodeAsync("tenant-1", 11, "EUR", CancellationToken.None));
        Assert.NotNull(await catalog.FindActiveByCodeAsync("tenant-1", 11, " usd ", CancellationToken.None));
    }

    [Fact]
    public async Task ReadStore_AppliesServerCriteriaRealTotalsAndDeterministicTieBreak()
    {
        var actor = new TestActor("tenant-1", 11);
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var usd = new Currency("USD", "Same", "نفس", "$")
        {
            TenantId = "tenant-1",
            CompanyId = 11
        };
        var eur = Create("EUR", "tenant-1", 11);
        var gbp = new Currency("GBP", "Same", "نفس", "£")
        {
            TenantId = "tenant-1",
            CompanyId = 11
        };
        eur.IsDeleted = true;
        context.Currencies.AddRange(usd, eur, gbp);
        await context.SaveChangesAsync();
        var store = new CurrencyReadStore(context);

        var active = await store.GetPageAsync(new GetCurrenciesQuery
        {
            PageNumber = 1,
            PageSize = 1,
            RecordStatus = "active",
            SortBy = "nameEn",
            SortDirection = "asc"
        }, CancellationToken.None);
        var archived = await store.GetPageAsync(new GetCurrenciesQuery
        {
            RecordStatus = "archived"
        }, CancellationToken.None);
        var startsWith = await store.GetPageAsync(new GetCurrenciesQuery
        {
            Search = " g ",
            SearchField = "currencyCode",
            SearchOperator = "startsWith",
            RecordStatus = "all"
        }, CancellationToken.None);

        Assert.Equal(2, active.MetaData.TotalCount);
        Assert.Equal(Math.Min(usd.Id, gbp.Id), Assert.Single(active.Items).Id);
        Assert.Equal(eur.Id, Assert.Single(archived.Items).Id);
        Assert.Equal("GBP", Assert.Single(startsWith.Items).CurrencyCode);
    }

    [Fact]
    public void QueryValidator_RejectsUnboundedOrUnsupportedServerCriteria()
    {
        var validator = new GetCurrenciesQueryValidator();

        var result = validator.Validate(new GetCurrenciesQuery
        {
            PageNumber = 0,
            PageSize = PaginationRequest.MaxClientPageSize + 1,
            Search = new string('x', 201),
            SearchField = "clientOnly",
            SearchOperator = "regex",
            RecordStatus = "deleted",
            SortBy = "random",
            SortDirection = "sideways"
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(GetCurrenciesQuery.PageNumber));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(GetCurrenciesQuery.PageSize));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(GetCurrenciesQuery.Search));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(GetCurrenciesQuery.SearchField));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(GetCurrenciesQuery.SearchOperator));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(GetCurrenciesQuery.RecordStatus));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(GetCurrenciesQuery.SortBy));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(GetCurrenciesQuery.SortDirection));
    }

    [Fact]
    public async Task ArchiveAndReferenceMutation_ShareCompanyCurrencySerializationBoundary()
    {
        const string expectedCurrencyResource = "Accounting:Currencies:tenant-1:11";
        var actor = new TestActor("tenant-1", 11);
        var unitOfWork = new RecordingAccountingUnitOfWork();
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new AccountingDbContext(options, actor, TimeProvider.System);
        var currency = Create("USD", "tenant-1", 11);
        context.Currencies.Add(currency);
        await context.SaveChangesAsync();
        Assert.True(currency.Id > 0);
        var archive = new ArchiveCurrencyCommandHandler(
            new StubCurrencyWriteStore(currency),
            unitOfWork,
            actor,
            TimeProvider.System,
            new CurrencyErrors(new EchoLocalizer<CreateCurrencyRequest>()));
        var settings = new SaveAccountingSettingsCommandHandler(
            new StubAccountingSettingsReadStore(),
            new StubAccountingSettingsWriteStore(),
            unitOfWork,
            actor,
            new LedgerSetupErrors(new EchoLedgerSetupLocalizer()));

        var archiveResult = await archive.Handle(
            new ArchiveCurrencyCommand(currency.Id, "AQ=="),
            CancellationToken.None);
        var settingsResult = await settings.Handle(
            new SaveAccountingSettingsCommand(currency.Id, 9, null),
            CancellationToken.None);

        Assert.True(archiveResult.IsSuccess);
        Assert.True(settingsResult.IsSuccess);
        Assert.Equal(2, unitOfWork.ResourceSets.Count);
        Assert.Contains(expectedCurrencyResource, unitOfWork.ResourceSets[0]);
        Assert.Contains(expectedCurrencyResource, unitOfWork.ResourceSets[1]);
    }

    [Fact]
    public void InitialAccountingMigration_OwnsCurrencyTableWithoutLegacyHrFinancialFields()
    {
        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        using var context = new AccountingDbContext(options, new TestActor("tenant-1", 11), TimeProvider.System);
        var currency = context.Model.FindEntityType(typeof(Currency));

        Assert.NotNull(currency);
        Assert.Equal("Currencies", currency!.GetTableName());
        Assert.Equal("acc", currency.GetSchema());
        Assert.Null(currency.FindProperty("ExchangeRateToDefault"));
        Assert.Null(currency.FindProperty("IsDefault"));
    }

    [Fact]
    public async Task Controller_IsThinAccountingOwnedSurface()
    {
        var sender = new RecordingSender();
        var controller = new CurrenciesController(sender);
        var query = new GetCurrenciesQuery { PageSize = 25 };
        var create = new CreateCurrencyRequest("USD", "US Dollar", "دولار أمريكي", "$");
        var update = new UpdateCurrencyRequest("USD", "US Dollar", "دولار أمريكي", "$", "AQ==");
        var concurrency = new CurrencyConcurrencyRequest("AQ==");

        Assert.IsType<OkObjectResult>(await controller.GetPage(query, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetLookup(CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetById(7, CancellationToken.None));
        Assert.IsType<CreatedAtActionResult>(await controller.Create(create, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.Update(7, update, CancellationToken.None));
        Assert.IsType<NoContentResult>(await controller.Archive(7, concurrency, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.Restore(7, concurrency, CancellationToken.None));

        Assert.Equal(
            "api/v{version:apiVersion}/currencies",
            Assert.Single(typeof(CurrenciesController).GetCustomAttributes<RouteAttribute>()).Template);
        Assert.NotNull(typeof(CurrenciesController).GetCustomAttribute<TenantMemberAttribute>());
        var actions = typeof(CurrenciesController).GetMethods(BindingFlags.Instance | BindingFlags.Public)
            .Where(method => method.GetCustomAttributes<HttpMethodAttribute>().Any())
            .ToDictionary(method => method.Name);
        Assert.Equal(AccountingPermissions.ViewAccountingSetup, actions[nameof(CurrenciesController.GetPage)].GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(AccountingPermissions.ViewAccountingSetup, actions[nameof(CurrenciesController.GetLookup)].GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(AccountingPermissions.ViewAccountingSetup, actions[nameof(CurrenciesController.GetById)].GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(AccountingPermissions.ManageAccountingSetup, actions[nameof(CurrenciesController.Create)].GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(AccountingPermissions.ManageAccountingSetup, actions[nameof(CurrenciesController.Update)].GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(AccountingPermissions.ManageAccountingSetup, actions[nameof(CurrenciesController.Archive)].GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(AccountingPermissions.ManageAccountingSetup, actions[nameof(CurrenciesController.Restore)].GetCustomAttribute<HasPermissionAttribute>()?.Policy);

        Assert.Collection(
            sender.Requests,
            request => Assert.Same(query, request),
            request => Assert.IsType<GetCurrencyLookupQuery>(request),
            request => Assert.Equal(7, Assert.IsType<GetCurrencyByIdQuery>(request).Id),
            request => Assert.Equal("USD", Assert.IsType<CreateCurrencyCommand>(request).CurrencyCode),
            request => Assert.Equal("AQ==", Assert.IsType<UpdateCurrencyCommand>(request).RowVersion),
            request => Assert.Equal("AQ==", Assert.IsType<ArchiveCurrencyCommand>(request).RowVersion),
            request => Assert.Equal("AQ==", Assert.IsType<RestoreCurrencyCommand>(request).RowVersion));
    }

    private static Currency Create(string code, string tenantId, int companyId)
    {
        var currency = new Currency(code, code + " name", code + " عربي", code)
        {
            TenantId = tenantId,
            CompanyId = companyId
        };
        return currency;
    }

    private static Task<Result> Archive(AccountingDbContext context, TestActor actor, Currency currency)
    {
        var handler = new ArchiveCurrencyCommandHandler(
            new CurrencyWriteStore(context),
            context,
            actor,
            TimeProvider.System,
            new CurrencyErrors(new EchoLocalizer<CreateCurrencyRequest>()));
        return handler.Handle(
            new ArchiveCurrencyCommand(currency.Id, Convert.ToBase64String(currency.RowVersion)),
            CancellationToken.None);
    }

    private sealed class TestActor(string? tenantId, int? companyId) : ICurrentActor
    {
        public string? UserId => "user-1";
        public string? TenantId => tenantId;
        public int? CompanyId => companyId;
        public string? MachineName => "tests";
        public bool IsInRole(string role) => false;
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }

    private sealed class EchoLedgerSetupLocalizer : ILedgerSetupLocalizer
    {
        public string Text(string key) => key;
        public string Format(string key, params object[] arguments) => key;
    }

    private sealed class RecordingAccountingUnitOfWork : IAccountingUnitOfWork
    {
        public List<IReadOnlyCollection<string>> ResourceSets { get; } = [];

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(1);

        public async Task<TResult> ExecuteAtomicallyAsync<TResult>(
            IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation,
            CancellationToken cancellationToken = default)
        {
            ResourceSets.Add(lockResources.ToArray());
            return await operation(cancellationToken);
        }
    }

    private sealed class StubCurrencyWriteStore(Currency currency) : ICurrencyWriteStore
    {
        public void Add(Currency value) => throw new NotSupportedException();
        public Task<Currency?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult<Currency?>(id == currency.Id ? currency : null);
        public Task<bool> CodeExistsAsync(string currencyCode, int? excludedId, CancellationToken cancellationToken) =>
            Task.FromResult(false);
        public Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult(false);
        public void ApplyOriginalRowVersion(Currency value, byte[] rowVersion) { }
    }

    private sealed class StubAccountingSettingsReadStore : IAccountingSettingsReadStore
    {
        public Task<AccountingSettingsResponse?> GetAsync(CancellationToken cancellationToken) =>
            Task.FromResult<AccountingSettingsResponse?>(new AccountingSettingsResponse(
                1,
                7,
                9,
                DateTime.UtcNow,
                null,
                "AQ=="));
    }

    private sealed class StubAccountingSettingsWriteStore : IAccountingSettingsWriteStore
    {
        public Task<AccountingCompanySettings?> GetForUpdateAsync(CancellationToken cancellationToken) =>
            Task.FromResult<AccountingCompanySettings?>(null);
        public Task<bool> CurrencyExistsAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult(true);
        public Task<bool> PrimaryBookExistsAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult(true);
        public void Add(AccountingCompanySettings settings) { }
        public void ApplyOriginalRowVersion(AccountingCompanySettings settings, byte[] rowVersion) { }
    }

    private sealed class RecordingSender : ISender
    {
        public List<object> Requests { get; } = [];

        public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            object response = request switch
            {
                GetCurrenciesQuery => Page(),
                GetCurrencyLookupQuery => new List<CurrencyLookupResponse> { Lookup() },
                GetCurrencyByIdQuery => Result.Success(Response()),
                CreateCurrencyCommand => Result.Success(Response()),
                UpdateCurrencyCommand => Result.Success(Response()),
                ArchiveCurrencyCommand => Result.Success(),
                RestoreCurrencyCommand => Result.Success(Response()),
                _ => throw new NotSupportedException(request.GetType().FullName)
            };
            return Task.FromResult((TResponse)response);
        }

        public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
            where TRequest : IRequest => throw new NotSupportedException();

        public Task<object?> Send(object request, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(
            IStreamRequest<TResponse> request,
            CancellationToken cancellationToken = default) =>
            Empty<TResponse>(cancellationToken);

        public IAsyncEnumerable<object?> CreateStream(
            object request,
            CancellationToken cancellationToken = default) =>
            Empty<object?>(cancellationToken);

        private static async IAsyncEnumerable<T> Empty<T>(
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            cancellationToken.ThrowIfCancellationRequested();
            yield break;
        }

        private static PageResponse<CurrencyResponse> Page()
        {
            var item = Response();
            var page = new PagedList<CurrencyResponse>([item], 1, 1, 10);
            return new PageResponse<CurrencyResponse>(page, page.MetaData);
        }

        private static CurrencyLookupResponse Lookup() =>
            new(7, "USD", "US Dollar", "دولار أمريكي", "$");

        private static CurrencyResponse Response() =>
            new(7, "USD", "US Dollar", "دولار أمريكي", "$", DateTime.UtcNow, null, false, "AQ==");
    }
}
