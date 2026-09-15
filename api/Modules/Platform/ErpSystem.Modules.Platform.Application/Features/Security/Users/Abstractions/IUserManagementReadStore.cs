using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;

public interface IUserManagementReadStore
{
    Task<PageResponse<UserResponse>> GetPageAsync(
        UserManagementQuery request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<UserCompanyOptionResponse>> GetCompanyOptionsAsync(
        CancellationToken cancellationToken = default);

    Task<UserResponse?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
}
