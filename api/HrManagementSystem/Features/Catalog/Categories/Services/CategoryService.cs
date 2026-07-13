namespace HrManagementSystem.Features.Catalog.Categories.Services;

public class CategoryService(
    IMapper mapper,
    ApplicationDbContext context,
    IEntityChangeLogService entityChangeLogService,
    IHttpContextAccessor httpContextAccessor,
    CategoryErrors categoryErrors,
    HybridCache hybridCache) : ICategoryService
{
    private readonly IMapper _mapper = mapper;
    private readonly ApplicationDbContext _context = context;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly CategoryErrors _categoryErrors = categoryErrors;
    private readonly HybridCache _hybridCache = hybridCache;

    private readonly string _cacheKey = "AvailableCategories";


    public async Task<IEnumerable<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _hybridCache.GetOrCreateAsync(
            _cacheKey,
            async _ => await _context.Categories
                .AsNoTracking()
                .Where(c => !c.IsDeleted)
                .Select(c => new CategoryResponse(
                    c.Id,
                    c.NameAr,
                    c.NameEn,
                    c.CategorySubcategories
                        .Where(cs => cs.SubCategory != null && !cs.SubCategory.IsDeleted)
                        .Select(cs => new SimpleSubCategoryResponse(
                            cs.SubCategory!.Id,
                            cs.SubCategory.NameAr,
                            cs.SubCategory.NameEn,
                            cs.SubCategory.IsDeleted
                        ))
                        .ToList(),
                    c.CreatedOn,
                    c.UpdatedOn,
                    c.IsDeleted
                ))
                .ToListAsync(cancellationToken),
            cancellationToken: cancellationToken);
    }

    public async Task<Result<CategoryResponse>> GetAsync(int id, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .Include(c => c.CategorySubcategories)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category is null)
            return Result.Failure<CategoryResponse>(_categoryErrors.CategoryNotFound);

        var response = _mapper.Map<CategoryResponse>(category);
        return Result.Success(response);
    }

    public async Task<Result<CategoryResponse>> AddAsync(CategoryRequest request, CancellationToken cancellationToken = default)
    {
        // Map the request to a new category
        var newCategory = _mapper.Map<Category>(request);

        // Save the category only (without subcategories)
        await _context.Categories.AddAsync(newCategory, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Clear cache after adding a new category
        await _hybridCache.RemoveAsync(_cacheKey, cancellationToken);

        // Map the result to a response object
        var response = _mapper.Map<CategoryResponse>(newCategory);

        return Result.Success(response);
    }

    public async Task<Result<CategoryResponse>> UpdateAsync(CategoryRequest request, CancellationToken cancellationToken = default)
    {
        var currentCategory = await _context.Categories
            .Include(c => c.CategorySubcategories)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (currentCategory == null)
            return Result.Failure<CategoryResponse>(_categoryErrors.CategoryNotFound);

        //TODO : Why Make Issue When Edit Like (Crystal to Crystal1)
        var updatedCategory = _mapper.Map<Category>(request);
        await _entityChangeLogService.CreateChangeLogAsync(request.Id, currentCategory, updatedCategory);

        _mapper.Map(request, currentCategory);

        _context.Update(currentCategory);
        await _context.SaveChangesAsync(cancellationToken);

        await _hybridCache.RemoveAsync(_cacheKey, cancellationToken);

        var response = await _context.Categories
            .AsNoTracking()
            .Where(category => category.Id == currentCategory.Id)
            .ProjectToType<CategoryResponse>()
            .SingleAsync(cancellationToken);

        return Result.Success(response);
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null)
            return Result.Failure(_categoryErrors.CategoryNotFound);

        if (await _context.CategorySubcategories.AnyAsync(
                relationship => relationship.CategoryId == id &&
                                relationship.SubCategory != null &&
                                !relationship.SubCategory.IsDeleted,
                cancellationToken))
            return Result.Failure(_categoryErrors.CategoryHasSubCategories);

        // Cascade delete will handle CategorySubcategories
        category.IsDeleted = !category.IsDeleted;
        category.DeletedById = _httpContextAccessor.HttpContext!.User.GetUserId();
        category.DeletedOn = DateTime.UtcNow;
        category.DeletedByPc = Environment.MachineName;

        await _context.SaveChangesAsync(cancellationToken);
        await _hybridCache.RemoveAsync(_cacheKey, cancellationToken);

        return Result.Success();
    }
}
