namespace HrManagementSystem.Features.Analytics.Reports.Services;

public class ReportCategoryService(
    ApplicationDbContext context,
    IEntityChangeLogService entityChangeLogService,
    ReportCategoryErrors reportCategoryErrors,
    HybridCache hybridCache,
    IMapper mapper) : IReportCategoryService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly ReportCategoryErrors _reportCategoryErrors = reportCategoryErrors;
    private readonly HybridCache _hybridCache = hybridCache;
    private readonly string cacheKey = nameof(CacheKeys.AvailableReportsCategories);

    public async Task<IEnumerable<ReportCategoryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var ReportsCategories = await _hybridCache.GetOrCreateAsync<IEnumerable<ReportCategoryResponse>>(
            cacheKey,
            async cacheEntry =>
            {
                return await _context.ReportsCategories
                                     .AsNoTracking()
                                     .ProjectToType<ReportCategoryResponse>()
                                     .ToListAsync(cancellationToken);
            });

        return ReportsCategories;
    }

    public async Task<Result<ReportCategoryResponse>>? GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.ReportsCategories.FindAsync(id, cancellationToken);

        return response is not null
            ? Result.Success(response.Adapt<ReportCategoryResponse>())
            : Result.Failure<ReportCategoryResponse>(_reportCategoryErrors.ReportCategoryNotFound);
    }

    public async Task<Result<ReportCategoryResponse>> AddAsync(ReportCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var newReportCategory = _mapper.Map<ReportCategory>(request);

        await _context.AddAsync(newReportCategory, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = newReportCategory.Adapt<ReportCategoryResponse>();

        await _hybridCache.RemoveAsync(cacheKey, cancellationToken);

        return Result.Success(response);
    }

    public async Task<Result<ReportCategoryResponse>> UpdateAsync(ReportCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var currentReportCategory = await _context.ReportsCategories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (currentReportCategory is null)
            return Result.Failure<ReportCategoryResponse>(_reportCategoryErrors.ReportCategoryNotFound);

        // Apply the updates
        var updatedReportCategory = _mapper.Map<ReportCategory>(request);

        // Log the changes
        await _entityChangeLogService.CreateChangeLogAsync(request.Id, currentReportCategory, updatedReportCategory);

        _mapper.Map(request, currentReportCategory);

        _context.Update(currentReportCategory);
        await _context.SaveChangesAsync(cancellationToken);

        await _hybridCache.RemoveAsync(cacheKey, cancellationToken);

        var response = _mapper.Map<ReportCategoryResponse>(currentReportCategory);

        return Result.Success(response);
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        var reportCategory = await _context.ReportsCategories.FindAsync(id);

        //Todo: Check Before Delete In Another Tables

        if (reportCategory is null)
            return Result.Failure(_reportCategoryErrors.ReportCategoryNotFound);

        reportCategory.IsDeleted = !reportCategory.IsDeleted;

        await _context.SaveChangesAsync(cancellationToken);

        await _hybridCache.RemoveAsync(cacheKey, cancellationToken);

        return Result.Success();
    }
}