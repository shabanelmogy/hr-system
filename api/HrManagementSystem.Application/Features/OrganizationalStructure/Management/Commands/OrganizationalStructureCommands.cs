using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Abstractions;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Contracts;

namespace HrManagementSystem.Application.Features.OrganizationalStructure.Management.Commands;

public sealed record CreateOrganizationalStructureCommand(string Resource, OrganizationalStructureMutation Request)
    : ICommand<Result<OrganizationalStructureItem>>;
public sealed record CreateOrganizationalStructureBulkCommand(string Resource, IReadOnlyList<OrganizationalStructureMutation> Requests)
    : ICommand<Result<OrganizationalStructureBulkCreateResponse>>;
public sealed record UpdateOrganizationalStructureCommand(string Resource, int Id, OrganizationalStructureMutation Request)
    : ICommand<Result<OrganizationalStructureItem>>;
public sealed record ArchiveOrganizationalStructureCommand(string Resource, int Id) : ICommand<Result>;
public sealed record RestoreOrganizationalStructureCommand(string Resource, int Id) : ICommand<Result>;
public sealed record ApproveJobDescriptionCommand(int Id, DateOnly EffectiveDate, DateOnly? ExpiryDate)
    : ICommand<Result<OrganizationalStructureItem>>;
public sealed record RejectJobDescriptionCommand(int Id, string Reason)
    : ICommand<Result<OrganizationalStructureItem>>;

public sealed class OrganizationalStructureMutationValidator : AbstractValidator<OrganizationalStructureMutation>
{
    public OrganizationalStructureMutationValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50).Matches("^[A-Za-z0-9._-]+$");
        RuleFor(x => x.NameEn).NotEmpty().MaximumLength(200);
        RuleFor(x => x.NameAr).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DescriptionEn).MaximumLength(2000);
        RuleFor(x => x.DescriptionAr).MaximumLength(2000);
        RuleFor(x => x.ManagerId).GreaterThan(0).When(x => x.ManagerId.HasValue);
        RuleFor(x => x.TargetHeadcount).GreaterThanOrEqualTo(0).When(x => x.TargetHeadcount.HasValue);
        RuleFor(x => x.LevelOrder).GreaterThanOrEqualTo(0).When(x => x.LevelOrder.HasValue);
        RuleFor(x => x.MinSalary).GreaterThanOrEqualTo(0).When(x => x.MinSalary.HasValue);
        RuleFor(x => x.MaxSalary).GreaterThanOrEqualTo(0).When(x => x.MaxSalary.HasValue);
        RuleFor(x => x.MinExperienceYears).GreaterThanOrEqualTo(0).When(x => x.MinExperienceYears.HasValue);
    }
}

public sealed class CreateOrganizationalStructureCommandValidator : AbstractValidator<CreateOrganizationalStructureCommand>
{
    public CreateOrganizationalStructureCommandValidator()
    {
        RuleFor(x => x.Resource).Must(OrganizationalResources.IsSupported);
        RuleFor(x => x.Request).SetValidator(new OrganizationalStructureMutationValidator());
    }
}

public sealed class CreateOrganizationalStructureBulkCommandValidator : AbstractValidator<CreateOrganizationalStructureBulkCommand>
{
    public const int MaximumBatchSize = 100;

    public CreateOrganizationalStructureBulkCommandValidator()
    {
        RuleFor(x => x.Resource).Must(OrganizationalResources.IsSupported);
        RuleFor(x => x.Requests)
            .NotNull()
            .NotEmpty()
            .Must(requests => requests is { Count: <= MaximumBatchSize });
        RuleForEach(x => x.Requests).SetValidator(new OrganizationalStructureMutationValidator());
    }
}

public sealed class UpdateOrganizationalStructureCommandValidator : AbstractValidator<UpdateOrganizationalStructureCommand>
{
    public UpdateOrganizationalStructureCommandValidator()
    {
        RuleFor(x => x.Resource).Must(OrganizationalResources.IsSupported);
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Request).SetValidator(new OrganizationalStructureMutationValidator());
    }
}

public sealed class CreateOrganizationalStructureCommandHandler(IOrganizationalStructureManagement management)
    : ICommandHandler<CreateOrganizationalStructureCommand, Result<OrganizationalStructureItem>>
{
    public Task<Result<OrganizationalStructureItem>> Handle(CreateOrganizationalStructureCommand request, CancellationToken cancellationToken) =>
        management.CreateAsync(request.Resource, request.Request, cancellationToken);
}

public sealed class CreateOrganizationalStructureBulkCommandHandler(IOrganizationalStructureManagement management)
    : ICommandHandler<CreateOrganizationalStructureBulkCommand, Result<OrganizationalStructureBulkCreateResponse>>
{
    public Task<Result<OrganizationalStructureBulkCreateResponse>> Handle(
        CreateOrganizationalStructureBulkCommand request,
        CancellationToken cancellationToken) =>
        management.CreateBulkAsync(request.Resource, request.Requests, cancellationToken);
}

public sealed class UpdateOrganizationalStructureCommandHandler(IOrganizationalStructureManagement management)
    : ICommandHandler<UpdateOrganizationalStructureCommand, Result<OrganizationalStructureItem>>
{
    public Task<Result<OrganizationalStructureItem>> Handle(UpdateOrganizationalStructureCommand request, CancellationToken cancellationToken) =>
        management.UpdateAsync(request.Resource, request.Id, request.Request, cancellationToken);
}

public sealed class ArchiveOrganizationalStructureCommandHandler(IOrganizationalStructureManagement management)
    : ICommandHandler<ArchiveOrganizationalStructureCommand, Result>
{
    public Task<Result> Handle(ArchiveOrganizationalStructureCommand request, CancellationToken cancellationToken) =>
        management.ArchiveAsync(request.Resource, request.Id, cancellationToken);
}

public sealed class RestoreOrganizationalStructureCommandHandler(IOrganizationalStructureManagement management)
    : ICommandHandler<RestoreOrganizationalStructureCommand, Result>
{
    public Task<Result> Handle(RestoreOrganizationalStructureCommand request, CancellationToken cancellationToken) =>
        management.RestoreAsync(request.Resource, request.Id, cancellationToken);
}

public sealed class ApproveJobDescriptionCommandHandler(IOrganizationalStructureManagement management)
    : ICommandHandler<ApproveJobDescriptionCommand, Result<OrganizationalStructureItem>>
{
    public Task<Result<OrganizationalStructureItem>> Handle(ApproveJobDescriptionCommand request, CancellationToken cancellationToken) =>
        management.ApproveJobDescriptionAsync(request.Id, request.EffectiveDate, request.ExpiryDate, cancellationToken);
}

public sealed class RejectJobDescriptionCommandHandler(IOrganizationalStructureManagement management)
    : ICommandHandler<RejectJobDescriptionCommand, Result<OrganizationalStructureItem>>
{
    public Task<Result<OrganizationalStructureItem>> Handle(RejectJobDescriptionCommand request, CancellationToken cancellationToken) =>
        management.RejectJobDescriptionAsync(request.Id, request.Reason, cancellationToken);
}
