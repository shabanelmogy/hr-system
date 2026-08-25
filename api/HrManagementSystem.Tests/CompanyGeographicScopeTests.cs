using System.Reflection;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Abstractions;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Commands;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Errors;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Queries;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Infrastructure.Features.OrganizationalStructure.CompanyGeographicScope.Persistence;
using HrManagementSystem.Infrastructure.Dependencies;
using HrManagementSystem.Infrastructure.Migrations;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.DependencyInjection;

namespace HrManagementSystem.Tests;

public sealed class CompanyGeographicScopeTests
{
    [Fact]
    public void ErrorsService_RegistersCompanyGeographicScopeErrors()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddLocalization();
        services.AddErrorsService();

        using var provider = services.BuildServiceProvider();

        Assert.NotNull(provider.GetRequiredService<CompanyGeographicScopeErrors>());
    }

    [Fact]
    public async Task Update_ReplacesScopeAtomicallyAndClearsTheOldDefaultFirst()
    {
        var events = new List<string>();
        var store = new RecordingStore(events);
        var unitOfWork = new RecordingUnitOfWork(events);
        var handler = new UpdateCompanyGeographicScopeCommandHandler(
            store,
            unitOfWork,
            new TestCurrentActor(),
            CreateErrors());

        var result = await handler.Handle(
            new UpdateCompanyGeographicScopeCommand([1, 2], 2),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(7, result.Value.CompanyId);
        Assert.Equal(
            ["validate-countries", "clear-default", "save", "replace", "save", "get"],
            events);
        Assert.Equal(
            ["company-geographic-scope:tenant-1:7"],
            Assert.Single(unitOfWork.LockResources));
        Assert.Equal([1, 2], store.ReplacedCountryIds);
        Assert.Equal(2, store.DefaultCountryId);
    }

    [Fact]
    public async Task Update_RejectsUnavailableCountriesBeforeChangingRows()
    {
        var events = new List<string>();
        var store = new RecordingStore(events) { CountriesAvailable = false };
        var handler = new UpdateCompanyGeographicScopeCommandHandler(
            store,
            new RecordingUnitOfWork(events),
            new TestCurrentActor(),
            CreateErrors());

        var result = await handler.Handle(
            new UpdateCompanyGeographicScopeCommand([1], 1),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CompanyGeographicScope.CountriesUnavailable", result.Error.Code);
        Assert.Equal(["validate-countries"], events);
    }

    [Fact]
    public async Task Query_FailsClosedWithoutACompanyContext()
    {
        var events = new List<string>();
        var handler = new GetCompanyGeographicScopeQueryHandler(
            new RecordingStore(events),
            new TestCurrentActor(companyId: null),
            CreateErrors());

        var result = await handler.Handle(
            new GetCompanyGeographicScopeQuery(),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CompanyGeographicScope.CompanyContextRequired", result.Error.Code);
        Assert.Empty(events);
    }

    [Fact]
    public void Validator_RejectsDuplicateIdsAndAnUnselectedDefault()
    {
        var validator = new UpdateCompanyGeographicScopeCommandValidator(
            new EchoLocalizer<UpdateCompanyGeographicScopeRequest>());

        var result = validator.Validate(
            new UpdateCompanyGeographicScopeCommand([1, 1], 2));

        Assert.Contains(result.Errors, failure => failure.PropertyName == "CountryIds");
        Assert.Contains(result.Errors, failure => failure.PropertyName == "DefaultCountryId");
    }

    [Fact]
    public void Migration_BackfillsExistingCompaniesAndAddsAdminPermissionsIdempotently()
    {
        var migration = new AddCompanyGeographicScope();
        var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
        typeof(AddCompanyGeographicScope)
            .GetMethod("Up", BindingFlags.Instance | BindingFlags.NonPublic)!
            .Invoke(migration, [builder]);

        var sql = Assert.Single(builder.Operations.OfType<SqlOperation>()).Sql;
        Assert.Contains("INSERT INTO [CompanyCountries]", sql, StringComparison.Ordinal);
        Assert.Contains("CROSS JOIN [Countries]", sql, StringComparison.Ordinal);
        Assert.Contains("[company].[CreatedById]", sql, StringComparison.Ordinal);
        Assert.Contains("NOT EXISTS", sql, StringComparison.Ordinal);
        Assert.Contains($"N'{Permissions.ViewCompanyGeographicScope}'", sql, StringComparison.Ordinal);
        Assert.Contains($"N'{Permissions.ManageCompanyGeographicScope}'", sql, StringComparison.Ordinal);
        Assert.Contains("[role].[NormalizedName] = N'ADMIN'", sql, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Store_ReselectingAnArchivedCountryReactivatesItsExistingCompanyLink()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var actor = new TestCurrentActor();

        await using var context = new ApplicationDbContext(options, actor, TimeProvider.System);
        context.CompanyCountries.Add(new CompanyCountry(1, false)
        {
            TenantId = "tenant-1",
            CompanyId = 7,
            IsDeleted = true,
            DeletedById = "actor-1",
            DeletedOn = DateTime.UtcNow,
            DeletedByPc = "test"
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var store = new CompanyGeographicScopeStore(context, actor);
        await store.ReplaceAsync(7, [1], 1, CancellationToken.None);
        await context.SaveChangesAsync();

        var links = await context.CompanyCountries
            .IgnoreQueryFilters()
            .Where(link => link.TenantId == "tenant-1" && link.CompanyId == 7)
            .ToListAsync();

        var link = Assert.Single(links);
        Assert.False(link.IsDeleted);
        Assert.True(link.IsDefault);
        Assert.Null(link.DeletedById);
    }

    private static CompanyGeographicScopeErrors CreateErrors() =>
        new(new EchoLocalizer<UpdateCompanyGeographicScopeRequest>());

    private sealed class RecordingStore(List<string> events) : ICompanyGeographicScopeStore
    {
        public bool CountriesAvailable { get; init; } = true;
        public IReadOnlyCollection<int> ReplacedCountryIds { get; private set; } = [];
        public int DefaultCountryId { get; private set; }

        public Task<CompanyGeographicScopeResponse> GetAsync(
            int companyId,
            CancellationToken cancellationToken)
        {
            events.Add("get");
            return Task.FromResult(new CompanyGeographicScopeResponse(companyId, DefaultCountryId, []));
        }

        public Task<bool> AreActiveCountriesAsync(
            IReadOnlyCollection<int> countryIds,
            CancellationToken cancellationToken)
        {
            events.Add("validate-countries");
            return Task.FromResult(CountriesAvailable);
        }

        public Task ClearDefaultAsync(int companyId, CancellationToken cancellationToken)
        {
            events.Add("clear-default");
            return Task.CompletedTask;
        }

        public Task ReplaceAsync(
            int companyId,
            IReadOnlyCollection<int> countryIds,
            int defaultCountryId,
            CancellationToken cancellationToken)
        {
            events.Add("replace");
            ReplacedCountryIds = countryIds.ToArray();
            DefaultCountryId = defaultCountryId;
            return Task.CompletedTask;
        }
    }

    private sealed class RecordingUnitOfWork(List<string> events) : IUnitOfWork
    {
        public List<IReadOnlyCollection<string>> LockResources { get; } = [];

        public async Task<TResult> ExecuteAtomicallyAsync<TResult>(
            IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation,
            CancellationToken cancellationToken = default)
        {
            LockResources.Add(lockResources);
            return await operation(cancellationToken);
        }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            events.Add("save");
            return Task.FromResult(1);
        }
    }

    private sealed class TestCurrentActor(int? companyId = 7) : ICurrentActor
    {
        public string? UserId => "actor-1";
        public string? TenantId => "tenant-1";
        public int? CompanyId => companyId;
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
