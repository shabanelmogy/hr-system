using FluentValidation;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.ArchiveCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.RestoreCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.UpdateCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Mapping;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryById;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryWithStates;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Persistence;
using HrManagementSystem.Infrastructure.Persistence;
using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace HrManagementSystem.Tests;

public sealed class CountryCqrsHandlerTests
{
    [Fact]
    public void Mapping_NormalizesMutationAndPreservesEntityOwnedFields()
    {
        var mapper = CreateMapper();
        CountryMutation create = new CreateCountryRequest(
            "  مصر  ", "  Egypt  ", " eg ", " egy ", " +20 ", "   ");

        var created = mapper.Map<Country>(create);

        Assert.Equal("مصر", created.NameAr);
        Assert.Equal("Egypt", created.NameEn);
        Assert.Equal("EG", created.Alpha2Code);
        Assert.Equal("EGY", created.Alpha3Code);
        Assert.Equal("+20", created.PhoneCode);
        Assert.Null(created.CurrencyCode);

        var states = new List<State> { new() { Id = 3, NameAr = "القاهرة", NameEn = "Cairo" } };
        var existing = new Country
        {
            Id = 41,
            NameAr = "قديم",
            NameEn = "Old",
            States = states,
            CreatedById = "creator",
            CreatedOn = new DateTime(2026, 1, 1),
            IsDeleted = true,
            DeletedById = "deleter",
            RowVersion = [7]
        };
        CountryMutation update = new UpdateCountryRequest(
            "  الأردن  ", "  Jordan  ", " jo ", " jor ", null, " jod ");

        mapper.Map(update, existing);

        Assert.Equal(41, existing.Id);
        Assert.Same(states, existing.States);
        Assert.Equal("creator", existing.CreatedById);
        Assert.Equal(new byte[] { 7 }, existing.RowVersion);
        Assert.True(existing.IsDeleted);
        Assert.Equal("deleter", existing.DeletedById);
        Assert.Equal("الأردن", existing.NameAr);
        Assert.Equal("Jordan", existing.NameEn);
        Assert.Equal("JO", existing.Alpha2Code);
        Assert.Equal("JOR", existing.Alpha3Code);
        Assert.Null(existing.PhoneCode);
        Assert.Equal("JOD", existing.CurrencyCode);
    }

    [Fact]
    public void Mapping_MapsActiveStateCountAndCollection()
    {
        var mapper = CreateMapper();
        var country = CountryWithStates();

        var row = mapper.Map<CountryListItemResponse>(country);
        var detail = mapper.Map<CountryResponse>(country);

        Assert.Equal(1, row.StatesCount);
        Assert.Equal("Cairo", Assert.Single(detail.States).NameEn);
    }

    [Fact]
    public async Task ReadStore_FiltersStatusAndProjectsStatesCount()
    {
        await using var context = CreateContext();
        context.Countries.AddRange(
            new Country { Id = 1, NameAr = "مصر", NameEn = "Egypt" },
            new Country
            {
                Id = 2,
                NameAr = "مؤرشف",
                NameEn = "Archived",
                IsDeleted = true,
                CurrencyCode = "EGP",
                States =
                [
                    new State { Id = 20, NameAr = "نشطة", NameEn = "Active", Code = "ACT" },
                    new State { Id = 21, NameAr = "محذوفة", NameEn = "Deleted", Code = "DEL", IsDeleted = true }
                ]
            });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var store = new CountryReadStore(context, CreateConfig());

        var page = await store.GetPageAsync(
            new GetCountriesQuery { Status = "archived", CurrencyCode = "egp", HasStates = true },
            CancellationToken.None);

        var country = Assert.Single(page.Items);
        Assert.Equal(2, country.Id);
        Assert.True(country.IsDeleted);
        Assert.Equal(1, country.StatesCount);
        Assert.Equal(1, page.MetaData.TotalCount);
    }

    [Fact]
    public async Task ReadStore_SearchesSortsDeterministicallyAndPages()
    {
        await using var context = CreateContext();
        context.Countries.AddRange(
            new Country { Id = 3, NameAr = "أ", NameEn = "Same", Alpha2Code = "AA" },
            new Country { Id = 1, NameAr = "ب", NameEn = "Same", Alpha2Code = "AB" },
            new Country { Id = 2, NameAr = "ج", NameEn = "Other", Alpha2Code = "ZZ" });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var store = new CountryReadStore(context, CreateConfig());

        var page = await store.GetPageAsync(
            new GetCountriesQuery
            {
                Search = "same",
                SortBy = "nameEn",
                SortDirection = "asc",
                PageNumber = 2,
                PageSize = 1
            },
            CancellationToken.None);

        Assert.Equal(3, Assert.Single(page.Items).Id);
        Assert.Equal(2, page.MetaData.TotalCount);
        Assert.Equal(2, page.MetaData.TotalPages);
    }

    [Fact]
    public async Task ReadStore_DetailIncludesArchivedAndStatesFiltersArchivedStates()
    {
        await using var context = CreateContext();
        var country = CountryWithStates();
        country.Id = 9;
        country.IsDeleted = true;
        context.Countries.Add(country);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var store = new CountryReadStore(context, CreateConfig());

        var detail = await store.GetByIdAsync(9, CancellationToken.None);
        var withStates = await store.GetWithStatesByIdAsync(9, CancellationToken.None);

        Assert.NotNull(detail);
        Assert.True(detail.IsDeleted);
        Assert.Equal("Cairo", Assert.Single(withStates!.States).NameEn);
    }

    [Fact]
    public async Task Create_CommitsBeforeScheduling()
    {
        var lifecycle = new List<string>();
        var writer = new RecordingWriteStore(lifecycle);
        var scheduler = new RecordingScheduler(lifecycle);
        var handler = new CreateCountryCommandHandler(
            writer,
            new RecordingUnitOfWork(lifecycle, writer),
            scheduler,
            new TestCurrentActor(),
            CreateMapper(),
            CreateErrors());

        var result = await handler.Handle(Command(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(["add", "save", "schedule"], lifecycle);
        Assert.Equal(73, result.Value.Id);
        Assert.Equal("actor-1", Assert.Single(scheduler.Changes).ActorUserId);
    }

    [Fact]
    public async Task Create_FailedCommitNeverSchedules()
    {
        var lifecycle = new List<string>();
        var writer = new RecordingWriteStore(lifecycle);
        var scheduler = new RecordingScheduler(lifecycle);
        var handler = new CreateCountryCommandHandler(
            writer,
            new RecordingUnitOfWork(lifecycle, throwOnSave: true),
            scheduler,
            new TestCurrentActor(),
            CreateMapper(),
            CreateErrors());

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(Command(), CancellationToken.None));

        Assert.DoesNotContain("schedule", lifecycle);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task BulkCreate_UsesRegularUnitOfWorkAuditing()
    {
        await using var context = CreateContext();
        var scheduler = new RecordingScheduler([]);
        var handler = new CreateCountriesCommandHandler(
            new CountryWriteStore(context), context, scheduler, new TestCurrentActor(), CreateErrors(), CreateMapper());

        var result = await handler.Handle(
            new CreateCountriesCommand(
            [
                Request("مصر", "Egypt", "EG", "EGY"),
                Request("الأردن", "Jordan", "JO", "JOR")
            ]),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.CreatedCount);
        var countries = await context.Countries.AsNoTracking().ToListAsync();
        Assert.All(countries, country =>
        {
            Assert.Equal("actor-1", country.CreatedById);
            Assert.NotEqual(default, country.CreatedOn);
        });
        Assert.Equal("BulkAdd", Assert.Single(scheduler.Changes).Action);
    }

    [Fact]
    public async Task BulkCreate_DuplicateInputDoesNotWriteOrSchedule()
    {
        var lifecycle = new List<string>();
        var writer = new RecordingWriteStore(lifecycle);
        var scheduler = new RecordingScheduler(lifecycle);
        var handler = new CreateCountriesCommandHandler(
            writer,
            new RecordingUnitOfWork(lifecycle),
            scheduler,
            new TestCurrentActor(),
            CreateErrors(),
            CreateMapper());

        var result = await handler.Handle(
            new CreateCountriesCommand(
            [
                Request("مصر", "Egypt", "EG", "EGY"),
                Request("الأردن", " egypt ", "JO", "JOR")
            ]),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Empty(lifecycle);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task Update_FailedCommitRecordsAuditButNeverSchedules()
    {
        var lifecycle = new List<string>();
        var writer = new RecordingWriteStore(
            lifecycle,
            new Country { Id = 9, NameAr = "مصر", NameEn = "Egypt" });
        var scheduler = new RecordingScheduler(lifecycle);
        var audit = new RecordingAuditTrail();
        var handler = new UpdateCountryCommandHandler(
            writer,
            new RecordingUnitOfWork(lifecycle, throwOnSave: true),
            scheduler,
            audit,
            new TestCurrentActor(),
            CreateErrors(),
            CreateMapper());

        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(
            new UpdateCountryCommand(9, "مصر", "Egypt Updated", "EG", "EGY", "+20", "EGP"),
            CancellationToken.None));

        Assert.True(audit.Called);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task Archive_BlocksActiveStateDependency()
    {
        var lifecycle = new List<string>();
        var writer = new RecordingWriteStore(
            lifecycle,
            new Country { Id = 9, NameAr = "مصر", NameEn = "Egypt" }) { ActiveStates = true };
        var scheduler = new RecordingScheduler(lifecycle);
        var handler = new ArchiveCountryCommandHandler(
            writer,
            new RecordingUnitOfWork(lifecycle),
            scheduler,
            new TestCurrentActor(),
            TimeProvider.System,
            CreateErrors(),
            CreateMapper());

        var result = await handler.Handle(new ArchiveCountryCommand(9), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Country.CountryInUseByState", result.Error.Code);
        Assert.Empty(lifecycle);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task Restore_ClearsMetadataAndCommitsBeforeScheduling()
    {
        var lifecycle = new List<string>();
        var existing = new Country
        {
            Id = 9,
            NameAr = "مصر",
            NameEn = "Egypt",
            IsDeleted = true,
            DeletedById = "old",
            DeletedByPc = "old-pc",
            DeletedOn = DateTime.UtcNow.AddDays(-1)
        };
        var handler = new RestoreCountryCommandHandler(
            new RecordingWriteStore(lifecycle, existing),
            new RecordingUnitOfWork(lifecycle),
            new RecordingScheduler(lifecycle),
            new TestCurrentActor(),
            CreateErrors(),
            CreateMapper());

        var result = await handler.Handle(new RestoreCountryCommand(9), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.False(existing.IsDeleted);
        Assert.Null(existing.DeletedById);
        Assert.Null(existing.DeletedByPc);
        Assert.Null(existing.DeletedOn);
        Assert.Equal(["save", "schedule"], lifecycle);
    }

    [Theory]
    [InlineData(0, 10, "active", "nameEn", "asc")]
    [InlineData(1, 51, "active", "nameEn", "asc")]
    [InlineData(1, 10, "invalid", "nameEn", "asc")]
    [InlineData(1, 10, "active", "unknown", "asc")]
    [InlineData(1, 10, "active", "nameEn", "sideways")]
    public async Task PageValidator_RejectsInvalidAllowlistValues(
        int pageNumber, int pageSize, string status, string sortBy, string sortDirection)
    {
        var result = await new GetCountriesQueryValidator().ValidateAsync(new GetCountriesQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            Status = status,
            SortBy = sortBy,
            SortDirection = sortDirection
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task CreateValidator_RejectsInvalidCode()
    {
        IValidator<CreateCountryCommand> validator = new CreateCountryCommandValidator(
            new EchoStringLocalizer<CreateCountryRequest>());

        var result = await validator.ValidateAsync(Command(alpha2Code: "E"));

        Assert.Contains(result.Errors, error => error.PropertyName == "Alpha2Code");
    }

    [Fact]
    public async Task DetailQueryValidators_RejectNonPositiveIds()
    {
        var byId = await new GetCountryByIdQueryValidator().ValidateAsync(new GetCountryByIdQuery(0));
        var withStates = await new GetCountryWithStatesQueryValidator()
            .ValidateAsync(new GetCountryWithStatesQuery(-1));

        Assert.False(byId.IsValid);
        Assert.False(withStates.IsValid);
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new TestCurrentActor(), TimeProvider.System);
    }

    private static TypeAdapterConfig CreateConfig()
    {
        var config = new TypeAdapterConfig();
        new CountryMappingConfig().Register(config);
        return config;
    }

    private static IMapper CreateMapper() => new Mapper(CreateConfig());

    private static Country CountryWithStates() => new()
    {
        NameAr = "مصر",
        NameEn = "Egypt",
        States =
        [
            new State { Id = 1, NameAr = "القاهرة", NameEn = "Cairo", Code = "CAI" },
            new State { Id = 2, NameAr = "محذوفة", NameEn = "Deleted", Code = "DEL", IsDeleted = true }
        ]
    };

    private static CreateCountryRequest Request(string nameAr, string nameEn, string alpha2, string alpha3) =>
        new(nameAr, nameEn, alpha2, alpha3, null, null);

    private static CreateCountryCommand Command(
        string nameAr = "  مصر  ",
        string nameEn = "  Egypt  ",
        string? alpha2Code = " eg ",
        string? alpha3Code = " egy ",
        string? phoneCode = " +20 ",
        string? currencyCode = " egp ") =>
        new(nameAr, nameEn, alpha2Code, alpha3Code, phoneCode, currencyCode);

    private static CountryErrors CreateErrors() =>
        new(new EchoStringLocalizer<CreateCountryRequest>());

    private sealed class RecordingWriteStore(List<string> lifecycle, Country? existing = null) : ICountryWriteStore
    {
        public Country? Country { get; private set; } = existing;
        public bool ActiveStates { get; init; }

        public void Add(Country country) { Country = country; lifecycle.Add("add"); }
        public void AddRange(IReadOnlyCollection<Country> countries) => lifecycle.Add("add-range");
        public Task<Country?> GetForUpdateAsync(int id, CancellationToken token) => Task.FromResult(Country);
        public Task<bool> HasAnyConflictAsync(
            IReadOnlyCollection<Country> countries,
            int? excludedId,
            CancellationToken token) =>
            Task.FromResult(false);
        public Task<bool> HasActiveStatesAsync(int countryId, CancellationToken token) =>
            Task.FromResult(ActiveStates);
    }

    private sealed class RecordingUnitOfWork(
        List<string> lifecycle,
        RecordingWriteStore? writer = null,
        bool throwOnSave = false) : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken token = default)
        {
            if (throwOnSave) throw new InvalidOperationException("Commit failed.");
            lifecycle.Add("save");
            if (writer?.Country is { Id: 0 } country) country.Id = 73;
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingScheduler(List<string> lifecycle) : ICountryChangeScheduler
    {
        public List<CountryChange> Changes { get; } = [];
        public void Schedule(CountryChange change) { lifecycle.Add("schedule"); Changes.Add(change); }
    }

    private sealed class RecordingAuditTrail : ICountryAuditTrail
    {
        public bool Called { get; private set; }
        public void RecordUpdate(Country existingCountry, Country updatedCountry) => Called = true;
    }

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => "actor-1";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 1;
    }

    private sealed class EchoStringLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
