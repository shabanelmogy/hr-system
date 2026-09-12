using ErpSystem.Modules.HR.Application.Abstractions.Validation;

namespace ErpSystem.Modules.HR.Application.Features.Security.Authorization.Abstractions;

public interface IRoleValidationQueries : IValidationQuery
{
    Task<bool> RoleNameExistsAsync(
        string roleName,
        string? excludedRoleId,
        CancellationToken cancellationToken);
}
