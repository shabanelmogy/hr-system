using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Profile;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Persistence;
using ErpSystem.Modules.Platform.Presentation.Features.Security.Authentication.V1;
using MediatR;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformUserProfileCqrsTests
{
    [Fact]
    public void AccountController_ProfileSurfaceUsesMediatRAndLegacyUserServiceNoLongerOwnsProfile()
    {
        var parameters = Assert.Single(typeof(AccountController).GetConstructors())
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.Equal([typeof(ISender)], parameters);
        Assert.Null(typeof(UserProfileStore).Assembly.GetType(
            "ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Services.UserService"));
        Assert.Null(typeof(GetUserProfileQuery).Assembly.GetType(
            "ErpSystem.Modules.Platform.Application.Features.Security.Users.Services.IUserService"));

        Assert.IsAssignableFrom<IQuery<Result<UserProfileResponse>>>(new GetUserProfileQuery("user-1"));
        Assert.IsAssignableFrom<IQuery<Result<UserPhoto>>>(new GetUserPhotoQuery("user-1"));
        Assert.IsAssignableFrom<ICommand<Result>>(
            new UpdateUserProfileCommand("user-1", new UpdateProfileRequest("user-1", "user", "First", "Last")));
        Assert.IsAssignableFrom<ICommand<Result>>(
            new UpdateUserProfilePictureCommand("user-1", new UpdateProfilePictureRequest(null, Remove: true)));
    }

    [Fact]
    public async Task UpdateProfile_HandlerPersistsBeforePublishingRealtimeChange()
    {
        var calls = new List<string>();
        var store = new RecordingProfileStore(calls);
        var effects = new RecordingProfileEffects(calls);
        var handler = new UpdateUserProfileCommandHandler(store, effects);

        var result = await handler.Handle(
            new UpdateUserProfileCommand(
                "user-1",
                new UpdateProfileRequest("user-1", "user", "First", "Last")),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(["store", "effect:ProfileUpdated"], calls);
    }

    private sealed class RecordingProfileStore(List<string> calls) : IUserProfileStore
    {
        public Task<UserProfileResponse> GetAsync(string userId, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<UserPhoto> GetPhotoAsync(string userId, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task UpdateAsync(
            string userId,
            UpdateProfileRequest request,
            CancellationToken cancellationToken = default)
        {
            calls.Add("store");
            return Task.CompletedTask;
        }

        public Task<UserProfilePictureUpdateOutcome> UpdatePictureAsync(
            string userId,
            UpdateProfilePictureRequest request,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(UserProfilePictureUpdateOutcome.Success);
    }

    private sealed class RecordingProfileEffects(List<string> calls) : IUserProfileEffects
    {
        public void DispatchChange(string userId, string action) => calls.Add($"effect:{action}");
    }
}
