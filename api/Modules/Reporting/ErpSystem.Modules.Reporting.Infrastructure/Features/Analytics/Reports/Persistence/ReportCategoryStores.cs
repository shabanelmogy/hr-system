using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Contracts;
using ErpSystem.Modules.Reporting.Domain.Analytics.Reports.Entities;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Reports.Persistence;

public sealed class ReportCategoryReadStore(
    ReportingDbContext context,
    HybridCache hybridCache) : IReportCategoryReadStore
{
    private const string CacheKey = ReportCategoryCacheKeys.AvailableReportsCategories;

    public async Task<IReadOnlyList<ReportCategoryResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var categories = await hybridCache.GetOrCreateAsync(
            CacheKey,
            async _ => await context.ReportsCategories
                .AsNoTracking()
                .Select(category => new ReportCategoryResponse(category.Id, category.Name))
                .ToListAsync(cancellationToken));

        return categories;
    }

    public Task<ReportCategoryResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        context.ReportsCategories
            .AsNoTracking()
            .Where(category => category.Id == id)
            .Select(category => new ReportCategoryResponse(category.Id, category.Name))
            .FirstOrDefaultAsync(cancellationToken);
}

public sealed class ReportCategoryRepository(ReportingDbContext context) : IReportCategoryRepository
{
    public void Add(ReportCategory reportCategory) => context.ReportsCategories.Add(reportCategory);

    public Task<ReportCategory?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.ReportsCategories.FirstOrDefaultAsync(category => category.Id == id, cancellationToken);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}

public sealed class ReportCategoryEffects(
    IEntityChangeLogService entityChangeLogService,
    HybridCache hybridCache,
    IRealtimeChangeDispatcher realtimeChanges) : IReportCategoryEffects
{
    private const string CacheKey = ReportCategoryCacheKeys.AvailableReportsCategories;

    public Task RecordUpdateAsync(
        int id,
        ReportCategory existing,
        ReportCategory updated,
        CancellationToken cancellationToken) =>
        entityChangeLogService.CreateChangeLogAsync(id, existing, updated, cancellationToken);

    public Task InvalidateCacheAsync(CancellationToken cancellationToken) =>
        hybridCache.RemoveAsync(CacheKey, cancellationToken).AsTask();

    public void DispatchChange(string action, ReportCategory reportCategory) =>
        realtimeChanges.Dispatch(RealtimeChangeRequest.For<ReportCategory>(
            RealtimeAudience.ForPermission(ReportingPermissions.ViewReportsCategories),
            action,
            reportCategory.Id.ToString(CultureInfo.InvariantCulture)));
}

internal static class ReportCategoryCacheKeys
{
    public const string AvailableReportsCategories = "AvailableReportsCategories";
}
