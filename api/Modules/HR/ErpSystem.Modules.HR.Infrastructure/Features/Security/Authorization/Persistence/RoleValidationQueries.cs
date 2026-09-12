using ErpSystem.Modules.HR.Application.Features.Security.Authorization.Abstractions;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authorization.Persistence;

public sealed class RoleValidationQueries(
    ApplicationDbContext context,
    ICurrentActor currentActor)
    : IRoleValidationQueries
{
    public Task<bool> RoleNameExistsAsync(
        string roleName,
        string? excludedRoleId,
        CancellationToken cancellationToken)
    {
        var normalizedName = roleName.Trim().ToUpperInvariant();
        return context.Roles.AnyAsync(
            role => role.NormalizedName == normalizedName &&
                    (role.IsSystem || role.TenantId == currentActor.TenantId) &&
                    (excludedRoleId == null || role.Id != excludedRoleId),
            cancellationToken);
    }
}
