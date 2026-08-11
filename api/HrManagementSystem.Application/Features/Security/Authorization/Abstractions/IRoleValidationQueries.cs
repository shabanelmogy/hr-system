using HrManagementSystem.Application.Abstractions.Validation;

namespace HrManagementSystem.Application.Features.Security.Authorization.Abstractions;

public interface IRoleValidationQueries : IValidationQuery
{
    Task<bool> RoleNameExistsAsync(
        string roleName,
        string? excludedRoleId,
        CancellationToken cancellationToken);
}
