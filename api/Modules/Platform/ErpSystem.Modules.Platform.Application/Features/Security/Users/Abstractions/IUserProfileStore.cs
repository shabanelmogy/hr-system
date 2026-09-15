using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;

public enum UserProfilePictureUpdateOutcome
{
    Success = 0,
    UserNotFound = 1
}

public interface IUserProfileStore
{
    Task<UserProfileResponse> GetAsync(string userId, CancellationToken cancellationToken = default);

    Task<UserPhoto> GetPhotoAsync(string userId, CancellationToken cancellationToken = default);

    Task UpdateAsync(
        string userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken = default);

    Task<UserProfilePictureUpdateOutcome> UpdatePictureAsync(
        string userId,
        UpdateProfilePictureRequest request,
        CancellationToken cancellationToken = default);
}

public interface IUserProfileEffects
{
    void DispatchChange(string userId, string action);
}
