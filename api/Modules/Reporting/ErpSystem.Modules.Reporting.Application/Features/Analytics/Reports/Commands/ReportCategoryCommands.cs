using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Errors;
using ErpSystem.Modules.Reporting.Domain.Analytics.Reports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Commands;

public sealed record CreateReportCategoryCommand(ReportCategoryRequest Request)
    : ICommand<Result<ReportCategoryResponse>>;

public sealed record UpdateReportCategoryCommand(ReportCategoryRequest Request)
    : ICommand<Result<ReportCategoryResponse>>;

public sealed record ToggleReportCategoryCommand(int Id) : ICommand<Result>;

public sealed class CreateReportCategoryCommandValidator : AbstractValidator<CreateReportCategoryCommand>
{
    public CreateReportCategoryCommandValidator(IValidator<ReportCategoryRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class UpdateReportCategoryCommandValidator : AbstractValidator<UpdateReportCategoryCommand>
{
    public UpdateReportCategoryCommandValidator(IValidator<ReportCategoryRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class CreateReportCategoryCommandHandler(
    IReportCategoryRepository repository,
    IReportCategoryReadStore readStore,
    IReportCategoryEffects effects)
    : ICommandHandler<CreateReportCategoryCommand, Result<ReportCategoryResponse>>
{
    public async Task<Result<ReportCategoryResponse>> Handle(
        CreateReportCategoryCommand command,
        CancellationToken cancellationToken)
    {
        var reportCategory = new ReportCategory
        {
            Name = command.Request.Name
        };

        repository.Add(reportCategory);
        await repository.SaveChangesAsync(cancellationToken);

        var response = await readStore.GetByIdAsync(reportCategory.Id, cancellationToken)
            ?? throw new InvalidOperationException("The newly created report category could not be read.");

        await effects.InvalidateCacheAsync(cancellationToken);
        effects.DispatchChange("Create", reportCategory);
        return Result.Success(response);
    }
}

public sealed class UpdateReportCategoryCommandHandler(
    IReportCategoryRepository repository,
    IReportCategoryReadStore readStore,
    IReportCategoryEffects effects,
    ReportCategoryErrors errors)
    : ICommandHandler<UpdateReportCategoryCommand, Result<ReportCategoryResponse>>
{
    public async Task<Result<ReportCategoryResponse>> Handle(
        UpdateReportCategoryCommand command,
        CancellationToken cancellationToken)
    {
        var request = command.Request;
        var reportCategory = await repository.GetForUpdateAsync(request.Id, cancellationToken);
        if (reportCategory is null)
            return Result.Failure<ReportCategoryResponse>(errors.ReportCategoryNotFound);

        var updated = new ReportCategory
        {
            Id = request.Id,
            Name = request.Name
        };

        await effects.RecordUpdateAsync(request.Id, reportCategory, updated, cancellationToken);
        reportCategory.Name = request.Name;
        await repository.SaveChangesAsync(cancellationToken);

        var response = await readStore.GetByIdAsync(reportCategory.Id, cancellationToken)
            ?? throw new InvalidOperationException("The updated report category could not be read.");

        await effects.InvalidateCacheAsync(cancellationToken);
        effects.DispatchChange("Update", reportCategory);
        return Result.Success(response);
    }
}

public sealed class ToggleReportCategoryCommandHandler(
    IReportCategoryRepository repository,
    IReportCategoryEffects effects,
    ReportCategoryErrors errors)
    : ICommandHandler<ToggleReportCategoryCommand, Result>
{
    public async Task<Result> Handle(
        ToggleReportCategoryCommand command,
        CancellationToken cancellationToken)
    {
        var reportCategory = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (reportCategory is null)
            return Result.Failure(errors.ReportCategoryNotFound);

        reportCategory.IsDeleted = !reportCategory.IsDeleted;
        await repository.SaveChangesAsync(cancellationToken);
        await effects.InvalidateCacheAsync(cancellationToken);
        effects.DispatchChange(reportCategory.IsDeleted ? "Delete" : "Restore", reportCategory);
        return Result.Success();
    }
}
