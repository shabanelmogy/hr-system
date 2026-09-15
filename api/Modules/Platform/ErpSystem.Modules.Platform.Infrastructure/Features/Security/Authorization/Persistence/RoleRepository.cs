using System.Security.Claims;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Errors;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Persistence;

public sealed class RoleRepository(
    RoleManager<PlatformApplicationRole> roleManager,
    UserManager<PlatformApplicationUser> userManager,
    PlatformDbContext context,
    RoleErrors errors) : IRoleRepository
{
    public string NormalizeName(string roleName) =>
        roleManager.NormalizeKey(roleName) ?? roleName.ToUpperInvariant();

    public async Task<Result<RoleMutationSnapshot>> CreateAsync(
        string tenantId,
        string roleName,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var role = new PlatformApplicationRole
        {
            Name = roleName,
            TenantId = tenantId,
            IsSystem = false,
            ConcurrencyStamp = Guid.NewGuid().ToString()
        };

        var identityResult = await roleManager.CreateAsync(role);
        return identityResult.Succeeded
            ? Result.Success(ToSnapshot(role))
            : Result.Failure<RoleMutationSnapshot>(ToError(identityResult));
    }

    public async Task<Result<RoleRenameSnapshot>> RenameAsync(
        string tenantId,
        string roleId,
        string roleName,
        CancellationToken cancellationToken = default)
    {
        var role = await FindOwnedMutableRoleAsync(tenantId, roleId, cancellationToken);
        if (role is null)
            return Result.Failure<RoleRenameSnapshot>(errors.RoleNotFound);

        var previousName = role.Name;
        role.Name = roleName;
        var identityResult = await roleManager.UpdateAsync(role);
        return identityResult.Succeeded
            ? Result.Success(new RoleRenameSnapshot(ToSnapshot(role), previousName))
            : Result.Failure<RoleRenameSnapshot>(ToError(identityResult));
    }

    public async Task<Result<RoleStatusMutationSnapshot>> ToggleStatusAsync(
        string tenantId,
        string roleId,
        string revocationReason,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        var role = await FindOwnedMutableRoleAsync(tenantId, roleId, cancellationToken);
        if (role is null)
            return Result.Failure<RoleStatusMutationSnapshot>(errors.RoleNotFound);

        role.IsDeleted = !role.IsDeleted;
        var identityResult = await roleManager.UpdateAsync(role);
        if (!identityResult.Succeeded)
            return Result.Failure<RoleStatusMutationSnapshot>(ToError(identityResult));

        IReadOnlyCollection<string> affectedUserIds = [];
        if (role.IsDeleted)
        {
            var invalidation = await InvalidateUsersInRoleAsync(
                tenantId,
                role.Id,
                revocationReason,
                utcNow,
                cancellationToken);
            if (invalidation.IsFailure)
                return Result.Failure<RoleStatusMutationSnapshot>(invalidation.Error);

            affectedUserIds = invalidation.Value;
        }

        return Result.Success(new RoleStatusMutationSnapshot(ToSnapshot(role), affectedUserIds));
    }

    public async Task<Result<RoleClaimsMutationSnapshot>> ReplaceClaimsAsync(
        string tenantId,
        string roleId,
        IReadOnlyCollection<string> permissions,
        string revocationReason,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        var role = await FindOwnedMutableRoleAsync(tenantId, roleId, cancellationToken);
        if (role is null)
            return Result.Failure<RoleClaimsMutationSnapshot>(errors.RoleNotFound);

        var existingClaims = await roleManager.GetClaimsAsync(role);
        var previousPermissions = existingClaims
            .Select(claim => claim.Value)
            .ToArray();

        foreach (var claim in existingClaims)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var removeResult = await roleManager.RemoveClaimAsync(role, claim);
            if (!removeResult.Succeeded)
                return Result.Failure<RoleClaimsMutationSnapshot>(ToError(removeResult));
        }

        foreach (var permission in permissions)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var addResult = await roleManager.AddClaimAsync(
                role,
                new Claim(PermissionClaimNames.Permission, permission));
            if (!addResult.Succeeded)
                return Result.Failure<RoleClaimsMutationSnapshot>(ToError(addResult));
        }

        var invalidation = await InvalidateUsersInRoleAsync(
            tenantId,
            role.Id,
            revocationReason,
            utcNow,
            cancellationToken);
        if (invalidation.IsFailure)
            return Result.Failure<RoleClaimsMutationSnapshot>(invalidation.Error);

        return Result.Success(new RoleClaimsMutationSnapshot(
            ToSnapshot(role),
            previousPermissions,
            permissions.ToArray(),
            invalidation.Value));
    }

    private Task<PlatformApplicationRole?> FindOwnedMutableRoleAsync(
        string tenantId,
        string roleId,
        CancellationToken cancellationToken) =>
        roleManager.Roles.SingleOrDefaultAsync(role =>
            role.Id == roleId &&
            !role.IsSystem &&
            role.TenantId == tenantId,
            cancellationToken);

    private async Task<Result<IReadOnlyCollection<string>>> InvalidateUsersInRoleAsync(
        string tenantId,
        string roleId,
        string reason,
        DateTime utcNow,
        CancellationToken cancellationToken)
    {
        var affectedUserIds = await (
            from userRole in context.UserRoles
            join user in context.Users on userRole.UserId equals user.Id
            where userRole.RoleId == roleId &&
                  context.UserTenantAccesses.Any(access =>
                      access.UserId == user.Id && access.TenantId == tenantId)
            select user.Id)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (affectedUserIds.Count == 0)
            return Result.Success<IReadOnlyCollection<string>>([]);

        var users = await context.Users
            .Include(user => user.RefreshTokens)
            .Where(user => affectedUserIds.Contains(user.Id))
            .ToListAsync(cancellationToken);

        foreach (var user in users)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var stampResult = await userManager.UpdateSecurityStampAsync(user);
            if (!stampResult.Succeeded)
                return Result.Failure<IReadOnlyCollection<string>>(ToError(stampResult));

            foreach (var token in user.RefreshTokens.Where(token => token.IsActiveAt(utcNow)))
                token.Revoke(reason, utcNow);

            var updateResult = await userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return Result.Failure<IReadOnlyCollection<string>>(ToError(updateResult));
        }

        return Result.Success<IReadOnlyCollection<string>>(users.Select(user => user.Id).ToArray());
    }

    private static RoleMutationSnapshot ToSnapshot(PlatformApplicationRole role) =>
        new(role.Id, role.Name ?? string.Empty, role.IsDeleted, role.IsSystem);

    private static Error ToError(IdentityResult result)
    {
        var error = result.Errors.FirstOrDefault() ?? new IdentityError
        {
            Code = "IdentityOperationFailed",
            Description = "The identity operation failed."
        };
        return new Error(error.Code, error.Description, ErrorType.Validation);
    }
}
