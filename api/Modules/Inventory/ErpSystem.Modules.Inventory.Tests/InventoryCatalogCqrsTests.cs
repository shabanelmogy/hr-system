using System.Reflection;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Commands;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Errors;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Commands;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Errors;
using ErpSystem.Modules.Inventory.Domain.Catalog.Categories.Entities;
using ErpSystem.Modules.Inventory.Domain.Catalog.SubCategories.Entities;
using ErpSystem.Modules.Inventory.Infrastructure;
using ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.Categories.Persistence;
using ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.SubCategories.Persistence;
using ErpSystem.Modules.Inventory.Presentation.Features.Catalog.SubCategories.V1;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;
using CategoriesV1Controller = ErpSystem.Modules.Inventory.Presentation.Features.Catalog.Categories.V1.CategoriesController;
using CategoriesV2Controller = ErpSystem.Modules.Inventory.Presentation.Features.Catalog.Categories.V2.CategoriesController;

namespace ErpSystem.Modules.Inventory.Tests;

public sealed class InventoryCatalogCqrsTests
{
    [Fact]
    public void CatalogControllers_AreThinMediatRAdapters_AndLegacyServicesAreGone()
    {
        AssertSenderOnly(typeof(CategoriesV1Controller));
        AssertSenderOnly(typeof(CategoriesV2Controller));
        AssertSenderOnly(typeof(SubcategoriesController));

        var application = typeof(ICategoryReadStore).Assembly;
        Assert.Null(application.GetType("ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Services.ICategoryService"));
        Assert.Null(application.GetType("ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Services.ISubCategoryService"));

        var infrastructure = typeof(CategoryReadStore).Assembly;
        Assert.Null(infrastructure.GetType("ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.Categories.Services.CategoryService"));
        Assert.Null(infrastructure.GetType("ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.SubCategories.Services.SubcategoryService"));
    }

    [Fact]
    public async Task CatalogCommandValidators_DelegateToRequestValidators()
    {
        var categoryRequestValidator = new InlineValidator<CategoryRequest>();
        categoryRequestValidator.RuleFor(request => request.NameEn).Must(_ => false).WithMessage("category-invalid");
        var categoryCommandValidator = new CreateCategoryCommandValidator(categoryRequestValidator);

        var categoryResult = await categoryCommandValidator.ValidateAsync(
            new CreateCategoryCommand(new CategoryRequest(0, "تصنيف", "Category")));

        Assert.False(categoryResult.IsValid);
        Assert.Contains(categoryResult.Errors, error => error.ErrorMessage == "category-invalid");

        var subCategoryRequestValidator = new InlineValidator<SubCategoryRequest>();
        subCategoryRequestValidator.RuleFor(request => request.NameEn).Must(_ => false).WithMessage("subcategory-invalid");
        var subCategoryCommandValidator = new CreateSubCategoryCommandValidator(subCategoryRequestValidator);

        var subCategoryResult = await subCategoryCommandValidator.ValidateAsync(
            new CreateSubCategoryCommand(new SubCategoryRequest(0, "فرعي", "Subcategory", [])));

        Assert.False(subCategoryResult.IsValid);
        Assert.Contains(subCategoryResult.Errors, error => error.ErrorMessage == "subcategory-invalid");
    }

    [Fact]
    public async Task CreateCategory_HandlerOwnsScopePersistenceAndEffectsOrdering()
    {
        var actor = new TestActor("tenant-a", 7);
        var writeStore = new RecordingCategoryWriteStore();
        var readStore = new RecordingCategoryReadStore(() => writeStore.Added is null
            ? null
            : Response(writeStore.Added));
        var effects = new RecordingCategoryEffects();
        var handler = new CreateCategoryCommandHandler(writeStore, readStore, effects, actor);

        var result = await handler.Handle(
            new CreateCategoryCommand(new CategoryRequest(0, "تصنيف", "Category")),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(writeStore.Added);
        Assert.Equal("tenant-a", writeStore.Added!.TenantId);
        Assert.Equal(7, writeStore.Added.CompanyId);
        Assert.Equal(1, writeStore.SaveCount);
        Assert.Equal(["invalidate", "Create"], effects.Events);
    }

    [Fact]
    public async Task ToggleCategory_WithActiveSubcategories_PreservesExistingValidationSemantics()
    {
        var category = new Category { Id = 10, TenantId = "tenant-a", CompanyId = 7, NameAr = "تصنيف", NameEn = "Category" };
        var writeStore = new RecordingCategoryWriteStore(category) { HasActiveSubCategories = true };
        var effects = new RecordingCategoryEffects();
        var errors = new CategoryErrors(new EchoLocalizer<CategoryRequest>());
        var handler = new ToggleCategoryCommandHandler(
            writeStore,
            effects,
            new TestActor("tenant-a", 7),
            TimeProvider.System,
            errors);

        var result = await handler.Handle(new ToggleCategoryCommand(10), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Category.CategoryHasSubCategories", result.Error.Code);
        Assert.False(category.IsDeleted);
        Assert.Equal(0, writeStore.SaveCount);
        Assert.Empty(effects.Events);
    }

    [Fact]
    public async Task UpdateSubCategory_HandlerOwnsRelationshipMutationAndEffects()
    {
        var subCategory = new SubCategory
        {
            Id = 22,
            TenantId = "tenant-a",
            CompanyId = 7,
            NameAr = "قديم",
            NameEn = "Old"
        };
        var writeStore = new RecordingSubCategoryWriteStore(subCategory);
        var readStore = new RecordingSubCategoryReadStore(() => new SubCategoryResponse(
            subCategory.Id,
            subCategory.NameAr,
            subCategory.NameEn,
            subCategory.CreatedOn,
            subCategory.UpdatedOn,
            subCategory.IsDeleted));
        var effects = new RecordingSubCategoryEffects();
        var errors = new SubCategoryErrors(new EchoLocalizer<SubCategoryRequest>());
        var handler = new UpdateSubCategoryCommandHandler(writeStore, readStore, effects, errors);

        var result = await handler.Handle(
            new UpdateSubCategoryCommand(new SubCategoryRequest(22, "جديد", "New", [2, 3])),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("جديد", subCategory.NameAr);
        Assert.Equal("New", subCategory.NameEn);
        Assert.Equal([2, 3], writeStore.ReplacedCategoryIds);
        Assert.Equal(1, writeStore.SaveCount);
        Assert.Equal(["invalidate", "Update"], effects.Events);
    }

    [Fact]
    public async Task CategoryReadStore_CacheAndInvalidationRemainTenantCompanyScoped()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new InventoryDbContext(options);
        var actor = new MutableActor();
        await using var cacheProvider = CreateCacheProvider();
        var cache = cacheProvider.GetRequiredService<HybridCache>();
        var readStore = new CategoryReadStore(context, actor, cache);
        var effects = new CategoryEffects(actor, cache, new RecordingRealtimeDispatcher());

        context.Categories.AddRange(
            new Category { TenantId = "tenant-a", CompanyId = 1, NameAr = "أ", NameEn = "A-1" },
            new Category { TenantId = "tenant-a", CompanyId = 2, NameAr = "ب", NameEn = "A-2" },
            new Category { TenantId = "tenant-b", CompanyId = 1, NameAr = "ج", NameEn = "B-1" });
        await context.SaveChangesAsync();

        actor.Set("tenant-a", 1);
        Assert.Equal(["A-1"], (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn));
        actor.Set("tenant-a", 2);
        Assert.Equal(["A-2"], (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn));
        actor.Set("tenant-b", 1);
        Assert.Equal(["B-1"], (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn));

        actor.Set("tenant-a", 1);
        context.Categories.Add(new Category { TenantId = "tenant-a", CompanyId = 1, NameAr = "د", NameEn = "A-1-new" });
        await context.SaveChangesAsync();
        await effects.InvalidateCacheAsync(CancellationToken.None);
        Assert.Equal(
            ["A-1", "A-1-new"],
            (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn).OrderBy(value => value));

        actor.Set("tenant-a", 2);
        Assert.Equal(["A-2"], (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn));
    }

    [Fact]
    public async Task SubCategoryReadStore_CacheAndInvalidationRemainTenantCompanyScoped()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new InventoryDbContext(options);
        var actor = new MutableActor();
        await using var cacheProvider = CreateCacheProvider();
        var cache = cacheProvider.GetRequiredService<HybridCache>();
        var readStore = new SubCategoryReadStore(context, actor, cache);
        var effects = new SubCategoryEffects(actor, cache, new RecordingRealtimeDispatcher());

        context.SubCategories.AddRange(
            new SubCategory { TenantId = "tenant-a", CompanyId = 1, NameAr = "أ", NameEn = "A-1" },
            new SubCategory { TenantId = "tenant-a", CompanyId = 2, NameAr = "ب", NameEn = "A-2" },
            new SubCategory { TenantId = "tenant-b", CompanyId = 1, NameAr = "ج", NameEn = "B-1" });
        await context.SaveChangesAsync();

        actor.Set("tenant-a", 1);
        Assert.Equal(["A-1"], (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn));
        actor.Set("tenant-a", 2);
        Assert.Equal(["A-2"], (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn));
        actor.Set("tenant-b", 1);
        Assert.Equal(["B-1"], (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn));

        actor.Set("tenant-a", 1);
        context.SubCategories.Add(new SubCategory { TenantId = "tenant-a", CompanyId = 1, NameAr = "د", NameEn = "A-1-new" });
        await context.SaveChangesAsync();
        await effects.InvalidateCacheAsync(CancellationToken.None);
        Assert.Equal(
            ["A-1", "A-1-new"],
            (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn).OrderBy(value => value));

        actor.Set("tenant-b", 1);
        Assert.Equal(["B-1"], (await readStore.GetAllAsync(CancellationToken.None)).Select(item => item.NameEn));
    }

    [Fact]
    public async Task CatalogReadStore_FailsClosedWithoutCompleteScope()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new InventoryDbContext(options);
        var actor = new MutableActor();
        await using var cacheProvider = CreateCacheProvider();
        var readStore = new CategoryReadStore(context, actor, cacheProvider.GetRequiredService<HybridCache>());
        actor.Set("tenant-a", null);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            readStore.GetAllAsync(CancellationToken.None));

        Assert.Contains("tenant and company", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    private static void AssertSenderOnly(Type controllerType)
    {
        var constructor = Assert.Single(controllerType.GetConstructors(BindingFlags.Public | BindingFlags.Instance));
        var parameter = Assert.Single(constructor.GetParameters());
        Assert.Equal(typeof(ISender), parameter.ParameterType);
    }

    private static CategoryResponse Response(Category category) =>
        new(category.Id, category.NameAr, category.NameEn, [], category.CreatedOn, category.UpdatedOn, category.IsDeleted);

    private static ServiceProvider CreateCacheProvider()
    {
        var services = new ServiceCollection();
        services.AddDistributedMemoryCache();
        services.AddHybridCache();
        return services.BuildServiceProvider();
    }

    private sealed class TestActor(string? tenantId, int? companyId) : ICurrentActor
    {
        public string? UserId => "catalog-user";
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }

    private sealed class MutableActor : ICurrentActor
    {
        public string? UserId => "catalog-user";
        public string? TenantId { get; private set; }
        public int? CompanyId { get; private set; }
        public void Set(string? tenantId, int? companyId) => (TenantId, CompanyId) = (tenantId, companyId);
    }

    private sealed class RecordingCategoryReadStore(Func<CategoryResponse?> get) : ICategoryReadStore
    {
        public Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<CategoryResponse>>([]);
        public Task<CategoryResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) => Task.FromResult(get());
    }

    private sealed class RecordingCategoryWriteStore(Category? existing = null) : ICategoryWriteStore
    {
        public Category? Added { get; private set; }
        public int SaveCount { get; private set; }
        public bool HasActiveSubCategories { get; init; }
        public void Add(Category category)
        {
            Added = category;
            category.Id = 99;
        }
        public Task<Category?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => Task.FromResult(existing);
        public Task<bool> HasActiveSubCategoriesAsync(int categoryId, CancellationToken cancellationToken) => Task.FromResult(HasActiveSubCategories);
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingCategoryEffects : ICategoryEffects
    {
        public List<string> Events { get; } = [];
        public Task InvalidateCacheAsync(CancellationToken cancellationToken)
        {
            Events.Add("invalidate");
            return Task.CompletedTask;
        }
        public void DispatchChange(string action, Category category) => Events.Add(action);
    }

    private sealed class RecordingSubCategoryReadStore(Func<SubCategoryResponse?> get) : ISubCategoryReadStore
    {
        public Task<IReadOnlyList<SubCategoryResponse>> GetAllAsync(CancellationToken cancellationToken) => Task.FromResult<IReadOnlyList<SubCategoryResponse>>([]);
        public Task<IReadOnlyList<SubCategoryResponse>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken) => Task.FromResult<IReadOnlyList<SubCategoryResponse>>([]);
        public Task<SubCategoryResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) => Task.FromResult(get());
    }

    private sealed class RecordingSubCategoryWriteStore(SubCategory existing) : ISubCategoryWriteStore
    {
        public IReadOnlyList<int> ReplacedCategoryIds { get; private set; } = [];
        public int SaveCount { get; private set; }
        public void Add(SubCategory subCategory) { }
        public Task<SubCategory?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => Task.FromResult<SubCategory?>(existing);
        public Task ReplaceCategoryLinksAsync(SubCategory subCategory, IReadOnlyCollection<int> categoryIds, CancellationToken cancellationToken)
        {
            ReplacedCategoryIds = categoryIds.ToArray();
            return Task.CompletedTask;
        }
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingSubCategoryEffects : ISubCategoryEffects
    {
        public List<string> Events { get; } = [];
        public Task InvalidateCacheAsync(CancellationToken cancellationToken)
        {
            Events.Add("invalidate");
            return Task.CompletedTask;
        }
        public void DispatchChange(string action, SubCategory subCategory) => Events.Add(action);
    }

    private sealed class RecordingRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public void Dispatch(RealtimeChangeRequest request) { }
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, true);
        public LocalizedString this[string name, params object[] arguments] => new(name, string.Format(name, arguments), true);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
