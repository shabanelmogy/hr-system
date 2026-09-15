using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Errors;

namespace ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Queries;

public sealed record GetSubCategoriesQuery : IQuery<IReadOnlyList<SubCategoryResponse>>;
public sealed record GetSubCategoriesByCategoryQuery(int CategoryId) : IQuery<IReadOnlyList<SubCategoryResponse>>;
public sealed record GetSubCategoryByIdQuery(int Id) : IQuery<Result<SubCategoryResponse>>;

public sealed class GetSubCategoriesQueryHandler(ISubCategoryReadStore readStore)
    : IQueryHandler<GetSubCategoriesQuery, IReadOnlyList<SubCategoryResponse>>
{
    public Task<IReadOnlyList<SubCategoryResponse>> Handle(GetSubCategoriesQuery request, CancellationToken cancellationToken) =>
        readStore.GetAllAsync(cancellationToken);
}

public sealed class GetSubCategoriesByCategoryQueryHandler(ISubCategoryReadStore readStore)
    : IQueryHandler<GetSubCategoriesByCategoryQuery, IReadOnlyList<SubCategoryResponse>>
{
    public Task<IReadOnlyList<SubCategoryResponse>> Handle(GetSubCategoriesByCategoryQuery request, CancellationToken cancellationToken) =>
        readStore.GetByCategoryIdAsync(request.CategoryId, cancellationToken);
}

public sealed class GetSubCategoryByIdQueryHandler(ISubCategoryReadStore readStore, SubCategoryErrors errors)
    : IQueryHandler<GetSubCategoryByIdQuery, Result<SubCategoryResponse>>
{
    public async Task<Result<SubCategoryResponse>> Handle(GetSubCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var subCategory = await readStore.GetByIdAsync(request.Id, cancellationToken);
        return subCategory is null
            ? Result.Failure<SubCategoryResponse>(errors.SubCategoryNotFound)
            : Result.Success(subCategory);
    }
}
