using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Security.Users.Contracts;

namespace HrManagementSystem.Application.Features.Security.Users.Services;

public interface IUserService
{
    Task<PageResponse<UserResponse>> GetPageAsync(
        UserManagementQuery request,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<UserCompanyOptionResponse>> GetCompanyOptionsAsync(
        CancellationToken cancellationToken = default);

    Task<Result<UserResponse>> GetAsync(string id);

    Task<Result<UserResponse>> AddAsync(CreateUserRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(string id, UpdateUserRequest request, CancellationToken cancellationToken = default);

    Task<Result> ChangeUserPasswordAsync(string id, ChangeUserPasswordRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateProfilePictureAsync(string id, UpdateProfilePictureRequest request, CancellationToken cancellationToken);

    Task<Result> ToggleStatus(string id);

    Task<Result> Unlock(string id);

    Task<Result> ArchiveAsync(
        string id,
        ArchiveUserRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> RestoreAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<Result<UserProfileResponse>> GetProfileAsync(string userId, CancellationToken cancellationToken);

    Task<Result<UserPhoto>> GetUserPhotoAsync(string userId, CancellationToken cancellationToken);

    Task<Result> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken cancellationToken);

    Task<Result> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken cancellationToken);
}
