using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.Catalog.Categories.Contracts;
using ErpSystem.Modules.HR.Application.Features.Catalog.SubCategories.Contracts;
using ErpSystem.Modules.HR.Domain.Catalog.Categories.Entities;
using ErpSystem.Modules.HR.Domain.Catalog.SubCategories.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.Catalog.Categories.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Catalog.SubCategories.Services;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class CatalogCacheIsolationTests
{
    [Fact]
    public async Task Categories_CacheAndInvalidation_AreTenantAndCompanyScoped()
    {
        var actor = new MutableCurrentActor();
        await using var context = CreateContext(actor);
        await using var cacheProvider = CreateCacheProvider();
        var cache = cacheProvider.GetRequiredService<HybridCache>();
        var service = new CategoryService(
            new Mapper(new TypeAdapterConfig()),
            context,
            null!,
            actor,
            null!,
            cache,
            new RecordingRealtimeDispatcher());

        actor.SetScope("tenant-a", 1);
        context.Categories.Add(new Category { NameAr = "ألف 1", NameEn = "A-1" });
        await context.SaveChangesAsync();

        actor.SetScope("tenant-a", 2);
        context.Categories.Add(new Category { NameAr = "ألف 2", NameEn = "A-2" });
        await context.SaveChangesAsync();

        actor.SetScope("tenant-b", 1);
        context.Categories.Add(new Category { NameAr = "باء 1", NameEn = "B-1" });
        await context.SaveChangesAsync();

        actor.SetScope("tenant-a", 1);
        Assert.Equal(["A-1"], (await service.GetAllAsync()).Select(category => category.NameEn));

        actor.SetScope("tenant-a", 2);
        Assert.Equal(["A-2"], (await service.GetAllAsync()).Select(category => category.NameEn));

        actor.SetScope("tenant-b", 1);
        Assert.Equal(["B-1"], (await service.GetAllAsync()).Select(category => category.NameEn));

        actor.SetScope("tenant-a", 1);
        await service.AddAsync(new CategoryRequest(0, "ألف 1 جديد", "A-1-new"));
        Assert.Equal(
            ["A-1", "A-1-new"],
            (await service.GetAllAsync()).Select(category => category.NameEn).OrderBy(name => name));

        actor.SetScope("tenant-a", 2);
        Assert.Equal(["A-2"], (await service.GetAllAsync()).Select(category => category.NameEn));

        actor.SetScope("tenant-b", 1);
        Assert.Equal(["B-1"], (await service.GetAllAsync()).Select(category => category.NameEn));
    }

    [Fact]
    public async Task Subcategories_CacheAndInvalidation_AreTenantAndCompanyScoped()
    {
        var actor = new MutableCurrentActor();
        await using var context = CreateContext(actor);
        await using var cacheProvider = CreateCacheProvider();
        var cache = cacheProvider.GetRequiredService<HybridCache>();
        var service = new SubcategoryService(
            new Mapper(new TypeAdapterConfig()),
            context,
            null!,
            actor,
            null!,
            cache,
            new RecordingRealtimeDispatcher());

        actor.SetScope("tenant-a", 1);
        context.SubCategories.Add(new SubCategory { NameAr = "ألف 1", NameEn = "A-1" });
        await context.SaveChangesAsync();

        actor.SetScope("tenant-a", 2);
        context.SubCategories.Add(new SubCategory { NameAr = "ألف 2", NameEn = "A-2" });
        await context.SaveChangesAsync();

        actor.SetScope("tenant-b", 1);
        context.SubCategories.Add(new SubCategory { NameAr = "باء 1", NameEn = "B-1" });
        await context.SaveChangesAsync();

        actor.SetScope("tenant-a", 1);
        Assert.Equal(["A-1"], (await service.GetAllAsync()).Select(category => category.NameEn));

        actor.SetScope("tenant-a", 2);
        Assert.Equal(["A-2"], (await service.GetAllAsync()).Select(category => category.NameEn));

        actor.SetScope("tenant-b", 1);
        Assert.Equal(["B-1"], (await service.GetAllAsync()).Select(category => category.NameEn));

        actor.SetScope("tenant-a", 1);
        await service.AddAsync(new SubCategoryRequest(0, "ألف 1 جديد", "A-1-new", null));
        Assert.Equal(
            ["A-1", "A-1-new"],
            (await service.GetAllAsync()).Select(category => category.NameEn).OrderBy(name => name));

        actor.SetScope("tenant-a", 2);
        Assert.Equal(["A-2"], (await service.GetAllAsync()).Select(category => category.NameEn));

        actor.SetScope("tenant-b", 1);
        Assert.Equal(["B-1"], (await service.GetAllAsync()).Select(category => category.NameEn));
    }

    [Fact]
    public async Task CompanyScopedCatalogCaches_FailClosedWithoutCompleteScope()
    {
        var actor = new MutableCurrentActor();
        await using var context = CreateContext(actor);
        await using var cacheProvider = CreateCacheProvider();
        var cache = cacheProvider.GetRequiredService<HybridCache>();
        var service = new CategoryService(
            new Mapper(new TypeAdapterConfig()),
            context,
            null!,
            actor,
            null!,
            cache,
            new RecordingRealtimeDispatcher());

        actor.SetScope("tenant-a", null);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => service.GetAllAsync());
        Assert.Contains("tenant and company", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    private static ApplicationDbContext CreateContext(ICurrentActor actor)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        return new ApplicationDbContext(options, actor, TimeProvider.System);
    }

    private static ServiceProvider CreateCacheProvider()
    {
        var services = new ServiceCollection();
        services.AddDistributedMemoryCache();
        services.AddHybridCache();
        return services.BuildServiceProvider();
    }

    private sealed class MutableCurrentActor : ICurrentActor
    {
        public string? UserId { get; private set; } = "cache-test-user";
        public string? TenantId { get; private set; }
        public int? CompanyId { get; private set; }

        public void SetScope(string? tenantId, int? companyId)
        {
            TenantId = tenantId;
            CompanyId = companyId;
        }
    }

    private sealed class RecordingRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public List<RealtimeChangeRequest> Requests { get; } = [];

        public void Dispatch(RealtimeChangeRequest request) => Requests.Add(request);
    }
}
