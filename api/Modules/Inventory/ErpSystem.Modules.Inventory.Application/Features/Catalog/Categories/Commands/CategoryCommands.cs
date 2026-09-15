using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Errors;
using ErpSystem.Modules.Inventory.Domain.Catalog.Categories.Entities;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;

namespace ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Commands;

public sealed record CreateCategoryCommand(CategoryRequest Request) : ICommand<Result<CategoryResponse>>;
public sealed record UpdateCategoryCommand(CategoryRequest Request) : ICommand<Result<CategoryResponse>>;
public sealed record ToggleCategoryCommand(int Id) : ICommand<Result>;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator(IValidator<CategoryRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator(IValidator<CategoryRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class CreateCategoryCommandHandler(
    ICategoryWriteStore writeStore,
    ICategoryReadStore readStore,
    ICategoryEffects effects,
    ICurrentActor currentActor)
    : ICommandHandler<CreateCategoryCommand, Result<CategoryResponse>>
{
    public async Task<Result<CategoryResponse>> Handle(CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        var scope = CatalogActorScope.Require(currentActor);
        var request = command.Request;
        var category = new Category
        {
            NameAr = request.NameAr,
            NameEn = request.NameEn,
            TenantId = scope.TenantId,
            CompanyId = scope.CompanyId
        };

        writeStore.Add(category);
        await writeStore.SaveChangesAsync(cancellationToken);
        var response = await readStore.GetByIdAsync(category.Id, cancellationToken)
            ?? throw new InvalidOperationException("The newly created category could not be read.");
        await effects.InvalidateCacheAsync(cancellationToken);
        effects.DispatchChange("Create", category);
        return Result.Success(response);
    }
}

public sealed class UpdateCategoryCommandHandler(
    ICategoryWriteStore writeStore,
    ICategoryReadStore readStore,
    ICategoryEffects effects,
    IEntityChangeLogService changeLogs,
    CategoryErrors errors)
    : ICommandHandler<UpdateCategoryCommand, Result<CategoryResponse>>
{
    public async Task<Result<CategoryResponse>> Handle(UpdateCategoryCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;
        var category = await writeStore.GetForUpdateAsync(request.Id, cancellationToken);
        if (category is null)
            return Result.Failure<CategoryResponse>(errors.CategoryNotFound);

        var updated = new Category
        {
            Id = request.Id,
            NameAr = request.NameAr,
            NameEn = request.NameEn
        };
        await changeLogs.CreateChangeLogAsync(request.Id, category, updated, cancellationToken);

        category.NameAr = request.NameAr;
        category.NameEn = request.NameEn;
        await writeStore.SaveChangesAsync(cancellationToken);
        var response = await readStore.GetByIdAsync(category.Id, cancellationToken)
            ?? throw new InvalidOperationException("The updated category could not be read.");
        await effects.InvalidateCacheAsync(cancellationToken);
        effects.DispatchChange("Update", category);
        return Result.Success(response);
    }
}

public sealed class ToggleCategoryCommandHandler(
    ICategoryWriteStore writeStore,
    ICategoryEffects effects,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    CategoryErrors errors)
    : ICommandHandler<ToggleCategoryCommand, Result>
{
    public async Task<Result> Handle(ToggleCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await writeStore.GetForUpdateAsync(command.Id, cancellationToken);
        if (category is null)
            return Result.Failure(errors.CategoryNotFound);
        if (await writeStore.HasActiveSubCategoriesAsync(command.Id, cancellationToken))
            return Result.Failure(errors.CategoryHasSubCategories);

        category.IsDeleted = !category.IsDeleted;
        category.DeletedById = currentActor.UserId;
        category.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
        category.DeletedByPc = currentActor.MachineName;
        await writeStore.SaveChangesAsync(cancellationToken);
        await effects.InvalidateCacheAsync(cancellationToken);
        effects.DispatchChange(category.IsDeleted ? "Delete" : "Restore", category);
        return Result.Success();
    }
}

internal static class CatalogActorScope
{
    public static (string TenantId, int CompanyId) Require(ICurrentActor actor)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is null or <= 0)
            throw new InvalidOperationException("A tenant and company are required for catalog operations.");
        return (actor.TenantId, actor.CompanyId.Value);
    }
}
