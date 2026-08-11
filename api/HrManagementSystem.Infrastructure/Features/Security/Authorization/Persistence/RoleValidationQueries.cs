using HrManagementSystem.Application.Features.Security.Authorization.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.Security.Authorization.Persistence;

public sealed class RoleValidationQueries(ApplicationDbContext context)
    : IRoleValidationQueries
{
    public Task<bool> RoleNameExistsAsync(
        string roleName,
        string? excludedRoleId,
        CancellationToken cancellationToken) =>
        context.Roles.AnyAsync(
            role => role.Name == roleName &&
                    (excludedRoleId == null || role.Id != excludedRoleId),
            cancellationToken);
}
