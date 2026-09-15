using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Commands;

public sealed record CreateUserCommand(CreateUserRequest Request)
    : ICommand<Result<UserResponse>>;

public sealed record UpdateUserCommand(string Id, UpdateUserRequest Request)
    : ICommand<Result>;

public sealed record ChangeManagedUserPasswordCommand(string Id, ChangeUserPasswordRequest Request)
    : ICommand<Result>;

public sealed record ToggleUserStatusCommand(string Id) : ICommand<Result>;

public sealed record UnlockUserCommand(string Id) : ICommand<Result>;

public sealed record ArchiveUserCommand(string Id, ArchiveUserRequest Request) : ICommand<Result>;

public sealed record RestoreUserCommand(string Id) : ICommand<Result>;

public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator(IValidator<CreateUserRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator(IValidator<UpdateUserRequest> requestValidator)
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.Request).SetValidator(requestValidator);
    }
}

public sealed class ChangeManagedUserPasswordCommandValidator
    : AbstractValidator<ChangeManagedUserPasswordCommand>
{
    public ChangeManagedUserPasswordCommandValidator(
        IValidator<ChangeUserPasswordRequest> requestValidator)
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.Request).SetValidator(requestValidator);
    }
}

public sealed class ArchiveUserCommandValidator : AbstractValidator<ArchiveUserCommand>
{
    public ArchiveUserCommandValidator(IValidator<ArchiveUserRequest> requestValidator)
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.Request).SetValidator(requestValidator);
    }
}

public sealed class CreateUserCommandHandler(IUserManagementWriteStore store)
    : ICommandHandler<CreateUserCommand, Result<UserResponse>>
{
    public Task<Result<UserResponse>> Handle(
        CreateUserCommand request,
        CancellationToken cancellationToken) =>
        store.CreateAsync(request.Request, cancellationToken);
}

public sealed class UpdateUserCommandHandler(IUserManagementWriteStore store)
    : ICommandHandler<UpdateUserCommand, Result>
{
    public Task<Result> Handle(UpdateUserCommand request, CancellationToken cancellationToken) =>
        store.UpdateAsync(request.Id, request.Request, cancellationToken);
}

public sealed class ChangeManagedUserPasswordCommandHandler(IUserManagementWriteStore store)
    : ICommandHandler<ChangeManagedUserPasswordCommand, Result>
{
    public Task<Result> Handle(
        ChangeManagedUserPasswordCommand request,
        CancellationToken cancellationToken) =>
        store.ChangePasswordAsync(request.Id, request.Request, cancellationToken);
}

public sealed class ToggleUserStatusCommandHandler(IUserManagementWriteStore store)
    : ICommandHandler<ToggleUserStatusCommand, Result>
{
    public Task<Result> Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken) =>
        store.ToggleStatusAsync(request.Id, cancellationToken);
}

public sealed class UnlockUserCommandHandler(IUserManagementWriteStore store)
    : ICommandHandler<UnlockUserCommand, Result>
{
    public Task<Result> Handle(UnlockUserCommand request, CancellationToken cancellationToken) =>
        store.UnlockAsync(request.Id, cancellationToken);
}

public sealed class ArchiveUserCommandHandler(IUserManagementWriteStore store)
    : ICommandHandler<ArchiveUserCommand, Result>
{
    public Task<Result> Handle(ArchiveUserCommand request, CancellationToken cancellationToken) =>
        store.ArchiveAsync(request.Id, request.Request, cancellationToken);
}

public sealed class RestoreUserCommandHandler(IUserManagementWriteStore store)
    : ICommandHandler<RestoreUserCommand, Result>
{
    public Task<Result> Handle(RestoreUserCommand request, CancellationToken cancellationToken) =>
        store.RestoreAsync(request.Id, cancellationToken);
}
