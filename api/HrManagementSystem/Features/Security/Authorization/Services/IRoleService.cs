using HrManagementSystem.Features.Security.Authorization.Contracts;

namespace HrManagementSystem.Features.Security.Authorization.Services
{
    public interface IRoleService
    {
        Task<List<RoleResponse>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<Result<RoleDetailResponse>> GetAsync(string id);

        Task<Result<RoleResponse>> AddAsync(RoleRequest request, CancellationToken cancellationToken = default);

        Task<Result> UpdateAsync(RoleRequest roleRequest, CancellationToken cancellationToken);

        Task<Result> ToggleStatusAsync(string id, CancellationToken cancellationToken);

        Task<Result<RoleResponse>> GetRoleClaims(string roleId, CancellationToken cancellationToken);

        Task<Result> UpdateRoleClaims(RoleRequest permissionRequest, CancellationToken cancellationToken);
    }
}