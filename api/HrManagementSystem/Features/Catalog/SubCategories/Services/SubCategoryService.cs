namespace HrManagementSystem.Features.Catalog.SubCategories.Services;

public class SubcategoryService(
    IMapper mapper,
    ApplicationDbContext context,
    IEntityChangeLogService entityChangeLogService,
    IHttpContextAccessor httpContextAccessor,
    SubCategoryErrors subcategoryErrors,
    HybridCache hybridCache) : ISubCategoryService
{
    private readonly IMapper _mapper = mapper;
    private readonly ApplicationDbContext _context = context;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly SubCategoryErrors _subcategoryErrors = subcategoryErrors;
    private readonly HybridCache _hybridCache = hybridCache;

    private readonly string _cacheKey = "AvailableSubcategories";

    public async Task<IEnumerable<SubCategoryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var subCategories = await _context.SubCategories
                 .AsNoTracking()
                 .Include(s => s.CategorySubcategories)
                 .ThenInclude(cs => cs.Category) // Include the Category data
                 .Select(s => _mapper.Map<SubCategoryResponse>(s))
                 .ToListAsync(cancellationToken);

        return subCategories;
    }

    public async Task<IEnumerable<SubCategoryResponse>> GetAllAsyncRelatedToCategeory(int CategoryId, CancellationToken cancellationToken = default)
    {
        var subCategories = await _context.SubCategories
                 .AsNoTracking()
                 .Include(s => s.CategorySubcategories)
                 .ThenInclude(cs => cs.Category) // Include the Category data
                 .Where(config => config.CategorySubcategories.Any(cs => cs.CategoryId == CategoryId))
                 .Select(s => _mapper.Map<SubCategoryResponse>(s))
                 .ToListAsync(cancellationToken);

        return subCategories;
    }

    public async Task<Result<SubCategoryResponse>> GetAsync(int id, CancellationToken cancellationToken)
    {
        var subcategory = await _context.SubCategories
            .AsNoTracking()
            .Include(s => s.CategorySubcategories)
            .ThenInclude(cs => cs.Category) // Include the Category data
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (subcategory is null)
            return Result.Failure<SubCategoryResponse>(_subcategoryErrors.SubCategoryNotFound);

        var response = _mapper.Map<SubCategoryResponse>(subcategory);
        return Result.Success(response);
    }

    public async Task<Result<SubCategoryResponse>> AddAsync(SubCategoryRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request, nameof(request));

        var newSubcategory = request.Adapt<SubCategory>();
        await _context.SubCategories.AddAsync(newSubcategory, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var savedSubcategory = await _context.SubCategories
                .Include(sc => sc.CategorySubcategories)
                .ThenInclude(cs => cs.Category) // Include the Category data
                .FirstOrDefaultAsync(sc => sc.Id == newSubcategory.Id, cancellationToken);

        var response = savedSubcategory.Adapt<SubCategoryResponse>();
        await _hybridCache.RemoveAsync(_cacheKey, cancellationToken);

        return Result.Success(response);
    }

    public async Task<Result<SubCategoryResponse>> UpdateAsync(SubCategoryRequest request, CancellationToken cancellationToken = default)
    {

        var currentSubcategory = await _context.SubCategories
            .Include(s => s.CategorySubcategories)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (currentSubcategory == null)
            return Result.Failure<SubCategoryResponse>(_subcategoryErrors.SubCategoryNotFound);

        // Update scalar properties
        var updatedSubcategory = request.Adapt<SubCategory>();
        updatedSubcategory.Id = currentSubcategory.Id;
        updatedSubcategory.CreatedById = currentSubcategory.CreatedById;
        _context.Entry(currentSubcategory).CurrentValues.SetValues(updatedSubcategory);

        // Update category relationships if provided
        if (request.CategoryIds != null)
        {
            var existingRelationships = await _context.CategorySubcategories
                .Where(cs => cs.SubCategoryId == currentSubcategory.Id)
                .ToListAsync(cancellationToken);

            if (existingRelationships.Count != 0)
            {
                _context.CategorySubcategories.RemoveRange(existingRelationships);
            }

            var newRelationships = request.CategoryIds
                .Select(id => new CategorySubcategory
                {
                    SubCategoryId = currentSubcategory.Id,
                    CategoryId = id
                })
                .ToList();

            currentSubcategory.CategorySubcategories = newRelationships;
            _context.CategorySubcategories.AddRange(newRelationships);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var savedSubcategory = await _context.SubCategories
            .Include(sc => sc.CategorySubcategories)
            .ThenInclude(cs => cs.Category)
            .FirstOrDefaultAsync(sc => sc.Id == currentSubcategory.Id, cancellationToken);

        var response = savedSubcategory.Adapt<SubCategoryResponse>();
        await _hybridCache.RemoveAsync(_cacheKey, cancellationToken);

        return Result.Success(response);
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        var subcategory = await _context.SubCategories // Note: Adjusted to match DbContext naming convention
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (subcategory == null)
            return Result.Failure(_subcategoryErrors.SubCategoryNotFound);

        // No need to check Contents since it only references CategoryId
        // Cascade delete will handle CategorySubcategories
        subcategory.IsDeleted = !subcategory.IsDeleted;
        subcategory.DeletedById = _httpContextAccessor.HttpContext!.User.GetUserId();
        subcategory.DeletedOn = DateTime.UtcNow;
        subcategory.DeletedByPc = Environment.MachineName;

        await _context.SaveChangesAsync(cancellationToken);
        await _hybridCache.RemoveAsync(_cacheKey, cancellationToken);

        return Result.Success();
    }
}