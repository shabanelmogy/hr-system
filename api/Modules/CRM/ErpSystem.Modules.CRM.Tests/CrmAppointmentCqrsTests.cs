using System.Reflection;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Abstractions;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Commands;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Contracts;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Errors;
using ErpSystem.Modules.CRM.Domain.Appointments.Entities;
using ErpSystem.Modules.CRM.Infrastructure;
using ErpSystem.Modules.CRM.Infrastructure.Features.Appointments.Persistence;
using ErpSystem.Modules.CRM.Presentation.Features.Appointments.V1;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.CRM.Tests;

public sealed class CrmAppointmentCqrsTests
{
    [Fact]
    public void Controller_IsThinMediatRAdapter_AndLegacyBusinessServiceIsGone()
    {
        var constructor = Assert.Single(typeof(AppointmentsController)
            .GetConstructors(BindingFlags.Public | BindingFlags.Instance));
        var parameter = Assert.Single(constructor.GetParameters());
        Assert.Equal(typeof(ISender), parameter.ParameterType);

        var application = typeof(IAppointmentReadStore).Assembly;
        Assert.Null(application.GetType(
            "ErpSystem.Modules.CRM.Application.Features.Appointments.Services.IAppointmentService"));

        var infrastructure = typeof(AppointmentReadStore).Assembly;
        Assert.Null(infrastructure.GetType(
            "ErpSystem.Modules.CRM.Infrastructure.Features.Appointments.Services.AppointmentService"));
    }

    [Fact]
    public async Task CommandValidators_DelegateToRequestValidator()
    {
        var requestValidator = new InlineValidator<AppointmentRequest>();
        requestValidator.RuleFor(request => request.Text)
            .Must(_ => false)
            .WithMessage("appointment-invalid");

        var createValidator = new CreateAppointmentCommandValidator(requestValidator);
        var createResult = await createValidator.ValidateAsync(
            new CreateAppointmentCommand(CreateRequest()));
        Assert.False(createResult.IsValid);
        Assert.Contains(createResult.Errors, error => error.ErrorMessage == "appointment-invalid");

        var updateValidator = new UpdateAppointmentCommandValidator(requestValidator);
        var updateResult = await updateValidator.ValidateAsync(
            new UpdateAppointmentCommand(UpdateRequest(id: 0)));
        Assert.False(updateResult.IsValid);
        Assert.Contains(updateResult.Errors, error => error.PropertyName.EndsWith("Id", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Create_HandlerNormalizesUtc_Persists_ThenSchedulesChange()
    {
        var events = new List<string>();
        var repository = new RecordingRepository(events);
        var scheduler = new RecordingScheduler(events);
        var handler = new CreateAppointmentCommandHandler(repository, scheduler);
        var start = new DateTimeOffset(2026, 9, 13, 14, 0, 0, TimeSpan.FromHours(2));
        var end = start.AddHours(1);

        var result = await handler.Handle(
            new CreateAppointmentCommand(new AppointmentRequest(start, end, "Customer follow-up", false)),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(repository.Added);
        Assert.Equal(TimeSpan.Zero, repository.Added!.Start.Offset);
        Assert.Equal(start.UtcDateTime, repository.Added.Start.UtcDateTime);
        Assert.Equal(TimeSpan.Zero, repository.Added.End.Offset);
        Assert.Equal(["add", "save", "Add"], events);
    }

    [Fact]
    public async Task UpdateAndDelete_FailClosed_WhenOwnedAppointmentIsMissing()
    {
        var errors = new AppointmentErrors(new EchoLocalizer<AppointmentRequest>());
        var updateRepository = new RecordingRepository([]);
        var updateScheduler = new RecordingScheduler([]);
        var updateHandler = new UpdateAppointmentCommandHandler(
            updateRepository,
            updateScheduler,
            errors);

        var update = await updateHandler.Handle(
            new UpdateAppointmentCommand(UpdateRequest(id: 41)),
            CancellationToken.None);

        Assert.True(update.IsFailure);
        Assert.Equal("Appointment.AppointmentNotFound", update.Error.Code);
        Assert.Equal(0, updateRepository.SaveCount);

        var deleteRepository = new RecordingRepository([]);
        var deleteScheduler = new RecordingScheduler([]);
        var deleteHandler = new DeleteAppointmentCommandHandler(
            deleteRepository,
            deleteScheduler,
            errors);

        var delete = await deleteHandler.Handle(new DeleteAppointmentCommand(41), CancellationToken.None);

        Assert.True(delete.IsFailure);
        Assert.Equal("Appointment.AppointmentNotFound", delete.Error.Code);
        Assert.Equal(0, deleteRepository.SaveCount);
    }

    [Fact]
    public async Task DbContext_StampsTrustedActorScopeAndAuditFields()
    {
        var actor = new TestActor("user-a", "tenant-a", 7);
        var clock = new FixedTimeProvider(new DateTimeOffset(2026, 9, 13, 20, 0, 0, TimeSpan.Zero));
        await using var context = CreateContext(Guid.NewGuid().ToString("N"), new InMemoryDatabaseRoot(), actor, clock);
        var appointment = Appointment();

        context.Appointments.Add(appointment);
        await context.SaveChangesAsync();

        Assert.Equal("tenant-a", appointment.TenantId);
        Assert.Equal(7, appointment.CompanyId);
        Assert.Equal("user-a", appointment.CreatedById);
        Assert.Equal(clock.GetUtcNow().UtcDateTime, appointment.CreatedOn);
        Assert.False(string.IsNullOrWhiteSpace(appointment.CreatedByPc));
    }

    [Fact]
    public async Task ReadStore_IsTenantCompanyAndUserOwned()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var root = new InMemoryDatabaseRoot();
        var clock = new FixedTimeProvider(DateTimeOffset.UtcNow);

        await SeedAsync(databaseName, root, new TestActor("user-a", "tenant-a", 1), "A-1", clock);
        await SeedAsync(databaseName, root, new TestActor("user-b", "tenant-a", 1), "A-1-other-user", clock);
        await SeedAsync(databaseName, root, new TestActor("user-a", "tenant-a", 2), "A-2", clock);
        await SeedAsync(databaseName, root, new TestActor("user-a", "tenant-b", 1), "B-1", clock);

        var actor = new TestActor("user-a", "tenant-a", 1);
        await using var context = CreateContext(databaseName, root, actor, clock);
        var readStore = new AppointmentReadStore(context, actor);

        var results = await readStore.GetAllAsync(null, null, CancellationToken.None);

        Assert.Equal(["A-1"], results.Select(result => result.Text));
    }

    [Fact]
    public async Task GlobalFilter_BlocksCrossTenantAndCompanyData()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var root = new InMemoryDatabaseRoot();
        var clock = new FixedTimeProvider(DateTimeOffset.UtcNow);
        await SeedAsync(databaseName, root, new TestActor("user-a", "tenant-a", 1), "A-1", clock);

        await using var otherCompany = CreateContext(
            databaseName,
            root,
            new TestActor("user-a", "tenant-a", 2),
            clock);
        Assert.Empty(await otherCompany.Appointments.AsNoTracking().ToListAsync());

        await using var otherTenant = CreateContext(
            databaseName,
            root,
            new TestActor("user-a", "tenant-b", 1),
            clock);
        Assert.Empty(await otherTenant.Appointments.AsNoTracking().ToListAsync());
    }

    [Fact]
    public async Task Delete_IsSoftDelete_AndNormalQueriesHideRow()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var root = new InMemoryDatabaseRoot();
        var actor = new TestActor("user-a", "tenant-a", 1);
        var clock = new FixedTimeProvider(DateTimeOffset.UtcNow);
        await using var context = CreateContext(databaseName, root, actor, clock);
        var appointment = Appointment();
        context.Appointments.Add(appointment);
        await context.SaveChangesAsync();

        context.Appointments.Remove(appointment);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        Assert.Empty(await context.Appointments.AsNoTracking().ToListAsync());
        var stored = Assert.Single(await context.Appointments
            .IgnoreQueryFilters()
            .AsNoTracking()
            .ToListAsync());
        Assert.True(stored.IsDeleted);
        Assert.Equal("user-a", stored.DeletedById);
        Assert.NotNull(stored.DeletedOn);
    }

    [Fact]
    public async Task ScopeRequirements_FailClosed_WhenActorContextIsIncomplete()
    {
        var incomplete = new TestActor(null, "tenant-a", 1);
        await using var context = CreateContext(
            Guid.NewGuid().ToString("N"),
            new InMemoryDatabaseRoot(),
            incomplete,
            new FixedTimeProvider(DateTimeOffset.UtcNow));
        context.Appointments.Add(Appointment());

        var writeException = await Assert.ThrowsAsync<InvalidOperationException>(
            () => context.SaveChangesAsync());
        Assert.Contains("user, tenant, and company", writeException.Message, StringComparison.OrdinalIgnoreCase);

        var readStore = new AppointmentReadStore(context, incomplete);
        var readException = await Assert.ThrowsAsync<InvalidOperationException>(
            () => readStore.GetAllAsync(null, null, CancellationToken.None));
        Assert.Contains("user, tenant, and company", readException.Message, StringComparison.OrdinalIgnoreCase);
    }

    private static AppointmentRequest CreateRequest() =>
        new(
            new DateTimeOffset(2026, 9, 13, 12, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 9, 13, 13, 0, 0, TimeSpan.Zero),
            "Customer follow-up",
            false);

    private static UpdateAppointmentRequest UpdateRequest(int id) =>
        new(
            id,
            new DateTimeOffset(2026, 9, 13, 12, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 9, 13, 13, 0, 0, TimeSpan.Zero),
            "Customer follow-up",
            false);

    private static Appointment Appointment(string text = "Customer follow-up") =>
        new(
            new DateTimeOffset(2026, 9, 13, 12, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 9, 13, 13, 0, 0, TimeSpan.Zero),
            text,
            false);

    private static CrmDbContext CreateContext(
        string databaseName,
        InMemoryDatabaseRoot root,
        ICurrentActor actor,
        TimeProvider timeProvider)
    {
        var options = new DbContextOptionsBuilder<CrmDbContext>()
            .UseInMemoryDatabase(databaseName, root)
            .Options;
        return new CrmDbContext(options, actor, timeProvider);
    }

    private static async Task SeedAsync(
        string databaseName,
        InMemoryDatabaseRoot root,
        ICurrentActor actor,
        string text,
        TimeProvider timeProvider)
    {
        await using var context = CreateContext(databaseName, root, actor, timeProvider);
        context.Appointments.Add(Appointment(text));
        await context.SaveChangesAsync();
    }

    private sealed class TestActor(
        string? userId,
        string? tenantId,
        int? companyId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }

    private sealed class RecordingRepository(List<string> events, Appointment? existing = null)
        : IAppointmentRepository
    {
        public Appointment? Added { get; private set; }
        public int SaveCount { get; private set; }

        public void Add(Appointment appointment)
        {
            Added = appointment;
            events.Add("add");
        }

        public Task<Appointment?> GetOwnedForUpdateAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult(existing);

        public void Remove(Appointment appointment) => events.Add("remove");

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;
            events.Add("save");
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingScheduler(List<string> events) : IAppointmentChangeScheduler
    {
        public void Schedule(int appointmentId, string action) => events.Add(action);
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, true);
        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(name, arguments), true);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
