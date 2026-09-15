using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;

public interface IUserManagementWriteStore
{
    Task<Result<UserResponse>> CreateAsync(
        CreateUserRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(
        string id,
        UpdateUserRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> ChangePasswordAsync(
        string id,
        ChangeUserPasswordRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> ToggleStatusAsync(string id, CancellationToken cancellationToken = default);

    Task<Result> UnlockAsync(string id, CancellationToken cancellationToken = default);

    Task<Result> ArchiveAsync(
        string id,
        ArchiveUserRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> RestoreAsync(string id, CancellationToken cancellationToken = default);
}
