using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Errors;

namespace ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Queries;

public sealed record GetCategoriesQuery : IQuery<IReadOnlyList<CategoryResponse>>;

public sealed class GetCategoriesQueryHandler(ICategoryReadStore readStore)
    : IQueryHandler<GetCategoriesQuery, IReadOnlyList<CategoryResponse>>
{
    public Task<IReadOnlyList<CategoryResponse>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken) =>
        readStore.GetAllAsync(cancellationToken);
}

public sealed record GetCategoryByIdQuery(int Id) : IQuery<Result<CategoryResponse>>;

public sealed class GetCategoryByIdQueryHandler(ICategoryReadStore readStore, CategoryErrors errors)
    : IQueryHandler<GetCategoryByIdQuery, Result<CategoryResponse>>
{
    public async Task<Result<CategoryResponse>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await readStore.GetByIdAsync(request.Id, cancellationToken);
        return category is null
            ? Result.Failure<CategoryResponse>(errors.CategoryNotFound)
            : Result.Success(category);
    }
}
