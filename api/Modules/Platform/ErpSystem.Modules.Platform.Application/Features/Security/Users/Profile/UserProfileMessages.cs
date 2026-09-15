using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Errors;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Profile;

public sealed record GetUserProfileQuery(string UserId) : IQuery<Result<UserProfileResponse>>;

public sealed record GetUserPhotoQuery(string UserId) : IQuery<Result<UserPhoto>>;

public sealed record UpdateUserProfileCommand(string UserId, UpdateProfileRequest Request)
    : ICommand<Result>;

public sealed record UpdateUserProfilePictureCommand(string UserId, UpdateProfilePictureRequest Request)
    : ICommand<Result>;

public sealed class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator(IValidator<UpdateProfileRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class UpdateUserProfilePictureCommandValidator : AbstractValidator<UpdateUserProfilePictureCommand>
{
    public UpdateUserProfilePictureCommandValidator(IValidator<UpdateProfilePictureRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class GetUserProfileQueryHandler(IUserProfileStore store)
    : IQueryHandler<GetUserProfileQuery, Result<UserProfileResponse>>
{
    public async Task<Result<UserProfileResponse>> Handle(
        GetUserProfileQuery request,
        CancellationToken cancellationToken) =>
        Result.Success(await store.GetAsync(request.UserId, cancellationToken));
}

public sealed class GetUserPhotoQueryHandler(IUserProfileStore store)
    : IQueryHandler<GetUserPhotoQuery, Result<UserPhoto>>
{
    public async Task<Result<UserPhoto>> Handle(
        GetUserPhotoQuery request,
        CancellationToken cancellationToken) =>
        Result.Success(await store.GetPhotoAsync(request.UserId, cancellationToken));
}

public sealed class UpdateUserProfileCommandHandler(
    IUserProfileStore store,
    IUserProfileEffects effects)
    : ICommandHandler<UpdateUserProfileCommand, Result>
{
    public async Task<Result> Handle(
        UpdateUserProfileCommand request,
        CancellationToken cancellationToken)
    {
        await store.UpdateAsync(request.UserId, request.Request, cancellationToken);
        effects.DispatchChange(request.UserId, "ProfileUpdated");
        return Result.Success();
    }
}

public sealed class UpdateUserProfilePictureCommandHandler(
    IUserProfileStore store,
    IUserProfileEffects effects,
    UserErrors errors)
    : ICommandHandler<UpdateUserProfilePictureCommand, Result>
{
    public async Task<Result> Handle(
        UpdateUserProfilePictureCommand request,
        CancellationToken cancellationToken)
    {
        var outcome = await store.UpdatePictureAsync(
            request.UserId,
            request.Request,
            cancellationToken);
        if (outcome == UserProfilePictureUpdateOutcome.UserNotFound)
            return Result.Failure(errors.UserNotFound);

        effects.DispatchChange(request.UserId, "ProfilePictureUpdated");
        return Result.Success();
    }
}
