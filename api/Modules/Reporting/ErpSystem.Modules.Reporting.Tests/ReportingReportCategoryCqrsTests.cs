using System.Reflection;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Errors;
using ErpSystem.Modules.Reporting.Domain.Analytics.Reports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Reports.Persistence;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Reports.V1;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;
using System.Globalization;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class ReportingReportCategoryCqrsTests
{
    [Fact]
    public void ReportingInfrastructure_RegistersModuleDbContextAsUnitOfWork()
    {
        var services = new ServiceCollection();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Reporting"] = "Server=(localdb)\\mssqllocaldb;Database=erp-reporting-tests;Trusted_Connection=True"
            })
            .Build();

        services.AddReportingInfrastructure(configuration);
        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ReportingDbContext>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        Assert.Same(context, unitOfWork);
    }

    [Fact]
    public void Controller_IsThinMediatRAdapter_AndLegacyBusinessServiceIsGone()
    {
        var constructor = Assert.Single(typeof(ReportsCategoriesController)
            .GetConstructors(BindingFlags.Public | BindingFlags.Instance));
        var parameter = Assert.Single(constructor.GetParameters());
        Assert.Equal(typeof(ISender), parameter.ParameterType);

        var application = typeof(IReportCategoryReadStore).Assembly;
        Assert.Null(application.GetType(
            "ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Services.IReportCategoryService"));

        var infrastructure = typeof(ReportCategoryReadStore).Assembly;
        Assert.Null(infrastructure.GetType(
            "ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Reports.Services.ReportCategoryService"));
    }

    [Fact]
    public async Task CommandValidator_DelegatesToRequestValidator()
    {
        var requestValidator = new InlineValidator<ReportCategoryRequest>();
        requestValidator.RuleFor(request => request.Name).Must(_ => false).WithMessage("invalid-report-category");
        var validator = new CreateReportCategoryCommandValidator(requestValidator);

        var result = await validator.ValidateAsync(
            new CreateReportCategoryCommand(new ReportCategoryRequest(0, "Sales")));

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "invalid-report-category");
    }

    [Fact]
    public async Task Create_HandlerOwnsPersistenceAndEffectsOrdering()
    {
        var events = new List<string>();
        var repository = new RecordingRepository(events);
        var readStore = new RecordingReadStore(() => repository.Entity is null
            ? null
            : new ReportCategoryResponse(repository.Entity.Id, repository.Entity.Name));
        var effects = new RecordingEffects(events);
        var handler = new CreateReportCategoryCommandHandler(repository, readStore, effects);

        var result = await handler.Handle(
            new CreateReportCategoryCommand(new ReportCategoryRequest(0, "Sales")),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Sales", repository.Entity?.Name);
        Assert.Equal(["add", "save", "invalidate", "Create"], events);
    }

    [Fact]
    public async Task Update_HandlerAuditsBeforeMutationAndPersistence()
    {
        var events = new List<string>();
        var entity = new ReportCategory { Id = 12, Name = "Sales" };
        var repository = new RecordingRepository(events, entity);
        var readStore = new RecordingReadStore(() => new ReportCategoryResponse(entity.Id, entity.Name));
        var effects = new RecordingEffects(events);
        var errors = new ReportCategoryErrors(new EchoLocalizer<ReportCategoryRequest>());
        var handler = new UpdateReportCategoryCommandHandler(repository, readStore, effects, errors);

        var result = await handler.Handle(
            new UpdateReportCategoryCommand(new ReportCategoryRequest(12, "Finance")),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Finance", entity.Name);
        Assert.Equal(["audit", "save", "invalidate", "Update"], events);
    }

    [Fact]
    public async Task ReadStore_CacheInvalidationPreservesExistingCacheContract()
    {
        var options = new DbContextOptionsBuilder<ReportingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ReportingDbContext(
            options,
            new TestCurrentActor("actor-1"),
            TimeProvider.System);
        await using var cacheProvider = CreateCacheProvider();
        var cache = cacheProvider.GetRequiredService<HybridCache>();
        var readStore = new ReportCategoryReadStore(context, cache);
        var effects = new ReportCategoryEffects(
            new NullChangeLogService(),
            cache,
            new RecordingRealtimeDispatcher());

        context.ReportsCategories.Add(new ReportCategory { Name = "Sales" });
        await context.SaveChangesAsync();
        Assert.Single(await readStore.GetAllAsync(CancellationToken.None));

        context.ReportsCategories.Add(new ReportCategory { Name = "Finance" });
        await context.SaveChangesAsync();
        Assert.Single(await readStore.GetAllAsync(CancellationToken.None));

        await effects.InvalidateCacheAsync(CancellationToken.None);
        Assert.Equal(2, (await readStore.GetAllAsync(CancellationToken.None)).Count);
    }

    private static ServiceProvider CreateCacheProvider()
    {
        var services = new ServiceCollection();
        services.AddDistributedMemoryCache();
        services.AddHybridCache();
        return services.BuildServiceProvider();
    }

    private sealed class RecordingReadStore(Func<ReportCategoryResponse?> get) : IReportCategoryReadStore
    {
        public Task<IReadOnlyList<ReportCategoryResponse>> GetAllAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ReportCategoryResponse>>([]);

        public Task<ReportCategoryResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult(get());
    }

    private sealed class RecordingRepository(List<string> events, ReportCategory? existing = null)
        : IReportCategoryRepository
    {
        public ReportCategory? Entity { get; private set; } = existing;

        public void Add(ReportCategory reportCategory)
        {
            Entity = reportCategory;
            reportCategory.Id = 91;
            events.Add("add");
        }

        public Task<ReportCategory?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult(Entity);

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            events.Add("save");
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingEffects(List<string> events) : IReportCategoryEffects
    {
        public Task RecordUpdateAsync(
            int id,
            ReportCategory existing,
            ReportCategory updated,
            CancellationToken cancellationToken)
        {
            Assert.Equal("Sales", existing.Name);
            Assert.Equal("Finance", updated.Name);
            events.Add("audit");
            return Task.CompletedTask;
        }

        public Task InvalidateCacheAsync(CancellationToken cancellationToken)
        {
            events.Add("invalidate");
            return Task.CompletedTask;
        }

        public void DispatchChange(string action, ReportCategory reportCategory) => events.Add(action);
    }

    private sealed class RecordingRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public void Dispatch(RealtimeChangeRequest request) { }
    }

    private sealed class NullChangeLogService : IEntityChangeLogService
    {
        public Task<EntityChangeLogsRequest?> CreateChangeLogAsync<TEntity>(
            int entityId,
            TEntity existingEntity,
            TEntity updatedEntity,
            CancellationToken cancellationToken = default)
            where TEntity : class => Task.FromResult<EntityChangeLogsRequest?>(null);

        public Task<EntityChangeLogsRequest?> CreateChangeLogAsync<TEntity>(
            string entityKey,
            string entityName,
            TEntity existingEntity,
            TEntity updatedEntity,
            CancellationToken cancellationToken = default)
            where TEntity : class => Task.FromResult<EntityChangeLogsRequest?>(null);

        public Task<EntityChangeLogsRequest?> CreateChangeLogAsync(
            int entityId,
            string entityName,
            object existingEntity,
            object updatedEntity,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<EntityChangeLogsRequest?>(null);

        public Task<List<EntityChangeLogsResponse>> GetChangeLogKeyValuesAsync() => Task.FromResult<List<EntityChangeLogsResponse>>([]);

        public Task<List<EntityChangeLogsResponse>> GetChangeLogsByEntityAsync(
            string entityName,
            int entityId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<List<EntityChangeLogsResponse>>([]);
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, true);
        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(CultureInfo.InvariantCulture, name, arguments), true);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }

    private sealed class TestCurrentActor(string userId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
        public string? TenantId => null;
        public int? CompanyId => null;
    }
}
