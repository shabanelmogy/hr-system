using ErpSystem.BuildingBlocks.Application.Abstractions.Validation;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;

public interface IRoleValidationQueries : IValidationQuery
{
    Task<bool> RoleNameExistsAsync(
        string roleName,
        string? excludedRoleId,
        CancellationToken cancellationToken);
}
