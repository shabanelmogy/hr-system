using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Commands;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Errors;
using ErpSystem.Modules.Inventory.Domain.Catalog.SubCategories.Entities;

namespace ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Commands;

public sealed record CreateSubCategoryCommand(SubCategoryRequest Request) : ICommand<Result<SubCategoryResponse>>;
public sealed record UpdateSubCategoryCommand(SubCategoryRequest Request) : ICommand<Result<SubCategoryResponse>>;
public sealed record ToggleSubCategoryCommand(int Id) : ICommand<Result>;

public sealed class CreateSubCategoryCommandValidator : AbstractValidator<CreateSubCategoryCommand>
{
    public CreateSubCategoryCommandValidator(IValidator<SubCategoryRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class UpdateSubCategoryCommandValidator : AbstractValidator<UpdateSubCategoryCommand>
{
    public UpdateSubCategoryCommandValidator(IValidator<SubCategoryRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class CreateSubCategoryCommandHandler(
    ISubCategoryWriteStore writeStore,
    ISubCategoryReadStore readStore,
    ISubCategoryEffects effects,
    ICurrentActor currentActor)
    : ICommandHandler<CreateSubCategoryCommand, Result<SubCategoryResponse>>
{
    public async Task<Result<SubCategoryResponse>> Handle(CreateSubCategoryCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command.Request);
        var scope = CatalogActorScope.Require(currentActor);
        var request = command.Request;
        var subCategory = new SubCategory
        {
            NameAr = request.NameAr,
            NameEn = request.NameEn,
            TenantId = scope.TenantId,
            CompanyId = scope.CompanyId
        };
        writeStore.Add(subCategory);
        await writeStore.SaveChangesAsync(cancellationToken);

        var response = await readStore.GetByIdAsync(subCategory.Id, cancellationToken)
            ?? throw new InvalidOperationException("The newly created subcategory could not be read.");
        await effects.InvalidateCacheAsync(cancellationToken);
        effects.DispatchChange("Create", subCategory);
        return Result.Success(response);
    }
}

public sealed class UpdateSubCategoryCommandHandler(
    ISubCategoryWriteStore writeStore,
    ISubCategoryReadStore readStore,
    ISubCategoryEffects effects,
    SubCategoryErrors errors)
    : ICommandHandler<UpdateSubCategoryCommand, Result<SubCategoryResponse>>
{
    public async Task<Result<SubCategoryResponse>> Handle(UpdateSubCategoryCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;
        var subCategory = await writeStore.GetForUpdateAsync(request.Id, cancellationToken);
        if (subCategory is null)
            return Result.Failure<SubCategoryResponse>(errors.SubCategoryNotFound);

        subCategory.NameAr = request.NameAr;
        subCategory.NameEn = request.NameEn;
        if (request.CategoryIds is not null)
            await writeStore.ReplaceCategoryLinksAsync(subCategory, request.CategoryIds, cancellationToken);

        await writeStore.SaveChangesAsync(cancellationToken);
        var response = await readStore.GetByIdAsync(subCategory.Id, cancellationToken)
            ?? throw new InvalidOperationException("The updated subcategory could not be read.");
        await effects.InvalidateCacheAsync(cancellationToken);
        effects.DispatchChange("Update", subCategory);
        return Result.Success(response);
    }
}

public sealed class ToggleSubCategoryCommandHandler(
    ISubCategoryWriteStore writeStore,
    ISubCategoryEffects effects,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    SubCategoryErrors errors)
    : ICommandHandler<ToggleSubCategoryCommand, Result>
{
    public async Task<Result> Handle(ToggleSubCategoryCommand command, CancellationToken cancellationToken)
    {
        var subCategory = await writeStore.GetForUpdateAsync(command.Id, cancellationToken);
        if (subCategory is null)
            return Result.Failure(errors.SubCategoryNotFound);

        subCategory.IsDeleted = !subCategory.IsDeleted;
        subCategory.DeletedById = currentActor.UserId;
        subCategory.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
        subCategory.DeletedByPc = currentActor.MachineName;
        await writeStore.SaveChangesAsync(cancellationToken);
        await effects.InvalidateCacheAsync(cancellationToken);
        effects.DispatchChange(subCategory.IsDeleted ? "Delete" : "Restore", subCategory);
        return Result.Success();
    }
}
