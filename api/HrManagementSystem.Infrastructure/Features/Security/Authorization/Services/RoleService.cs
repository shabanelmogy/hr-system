using HrManagementSystem.Application.Features.Security.Authorization.Services;
using HrManagementSystem.Application.Features.Security.Authorization.Contracts;

using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Application.Features.Security.Authorization.Errors;
using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Features.Security.Authorization.Services
{
    public class RoleService(
        RoleManager<ApplicationRole> roleManager,
        RoleErrors roleErrors,
        IRealtimeChangeDispatcher realtimeChanges,
        ICurrentActor currentActor) : IRoleService
    {
        private readonly RoleManager<ApplicationRole> _roleManager = roleManager;
        private readonly RoleErrors _roleErrors = roleErrors;

        public async Task<List<RoleResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var tenantId = currentActor.TenantId;
            if (string.IsNullOrWhiteSpace(tenantId))
                return [];

            var roles = await _roleManager.Roles
                .AsNoTracking()
                .Where(role =>
                    (role.IsSystem &&
                     role.NormalizedName != AppRoles.super_admin.ToUpper()) ||
                    (!role.IsSystem && role.TenantId == tenantId))
                .Select(role => new RoleResponse(
                    role.Id,
                    role.Name ?? string.Empty,
                    role.IsDeleted,
                    null,
                    role.IsSystem))
                .ToListAsync(cancellationToken);
            return roles;
        }

        public async Task<Result<RoleDetailResponse>> GetAsync(string id, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (string.IsNullOrWhiteSpace(id))
                return Result.Failure<RoleDetailResponse>(_roleErrors.RoleNotFound);

            if (await FindVisibleRoleAsync(id, cancellationToken) is not { } role)
                return Result.Failure<RoleDetailResponse>(_roleErrors.RoleNotFound);

            var permissions = await _roleManager.GetClaimsAsync(role);

            var response = new RoleDetailResponse(
                role.Id,
                role.Name!,
                role.IsDeleted,
                permissions.Select(x => x.Value),
                role.IsSystem);

            return Result.Success(response);
        }

        public async Task<Result<RoleResponse>> AddAsync(RoleRequest request, CancellationToken cancellationToken = default)
        {
            var tenantId = currentActor.TenantId;
            if (string.IsNullOrWhiteSpace(tenantId) || IsSystemName(request.Name))
                return Result.Failure<RoleResponse>(_roleErrors.RoleNotFound);

            var role = new ApplicationRole
            {
                Name = request.Name.Trim(),
                TenantId = tenantId,
                IsSystem = false,
                ConcurrencyStamp = Guid.NewGuid().ToString()
            };

            var result = await _roleManager.CreateAsync(role);

            if (result.Succeeded)
            {
                var response = new RoleResponse(
                    role.Id,
                    role.Name ?? string.Empty,
                    role.IsDeleted,
                    null,
                    role.IsSystem);
                DispatchChange("Create", role.Id);
                return Result.Success(response);
            }

            var error = result.Errors.First();

            return Result.Failure<RoleResponse>(new Error(error.Code, error.Description, ErrorType.Validation));
        }

        public async Task<Result> UpdateAsync(RoleRequest roleRequest, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(roleRequest.Id))
                return Result.Failure(_roleErrors.RoleNotFound);

            cancellationToken.ThrowIfCancellationRequested();
            var currentRole = await FindOwnedMutableRoleAsync(roleRequest.Id, cancellationToken);
            if (currentRole is null || IsSystemName(roleRequest.Name))
                return Result.Failure(_roleErrors.RoleNotFound);

            currentRole.Name = roleRequest.Name.Trim();

            var result = await _roleManager.UpdateAsync(currentRole);
            if (result.Succeeded)
            {
                DispatchChange("Update", currentRole.Id);
                return Result.Success();
            }

            var error = result.Errors.First();

            return Result.Failure<RoleResponse>(new Error(error.Code, error.Description, ErrorType.Validation));
        }

        public async Task<Result> ToggleStatusAsync(string id, CancellationToken cancellationToken)
        {
            if (await FindOwnedMutableRoleAsync(id, cancellationToken) is not { } role)
                return Result.Failure<RoleDetailResponse>(_roleErrors.RoleNotFound);

            role.IsDeleted = !role.IsDeleted;

            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
            {
                var error = result.Errors.First();
                return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
            }

            DispatchChange(role.IsDeleted ? "Delete" : "Restore", role.Id);

            return Result.Success();
        }

        public async Task<Result<RoleResponse>> GetRoleClaims(string roleId, CancellationToken cancellationToken)
        {
            var role = await FindVisibleRoleAsync(roleId, cancellationToken);

            if (role == null)
                return Result.Failure<RoleResponse>(_roleErrors.RoleNotFound);

            cancellationToken.ThrowIfCancellationRequested();
            var roleClaims = (await _roleManager.GetClaimsAsync(role)).Select(claim => claim.Value).ToHashSet();
            var allClaims = Permissions.GetTenantPermissions();
            var currentClaims = allClaims
                .Select(permission => new CheckBoxViewModel
                {
                    DisplayValue = permission,
                    IsSelected = roleClaims.Contains(permission)
                })
                .ToList();

            var response = new RoleResponse(
                roleId,
                role.Name ?? string.Empty,
                role.IsDeleted,
                currentClaims,
                role.IsSystem);

            return Result.Success(response);
        }

        public async Task<Result> UpdateRoleClaims(RoleRequest rolerequest, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(rolerequest.Id))
                return Result.Failure(_roleErrors.RoleNotFound);

            cancellationToken.ThrowIfCancellationRequested();
            var role = await FindOwnedMutableRoleAsync(rolerequest.Id, cancellationToken);

            if (role == null)
                return Result.Failure(_roleErrors.RoleNotFound);

            var selectedClaims = rolerequest.RoleClaims?.Where(claim => claim.IsSelected).ToList() ?? [];
            if (selectedClaims.Any(claim => !Permissions.IsTenantPermission(claim.DisplayValue)) ||
                selectedClaims.Select(claim => claim.DisplayValue).Distinct(StringComparer.Ordinal).Count() != selectedClaims.Count)
            {
                return Result.Failure(_roleErrors.InvalidPermissions);
            }

            var roleClaims = await _roleManager.GetClaimsAsync(role);

            foreach (var claim in roleClaims)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await _roleManager.RemoveClaimAsync(role, claim);
            }

            foreach (var claim in selectedClaims)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await _roleManager.AddClaimAsync(role, new Claim(Permissions.Type, claim.DisplayValue));
            }

            DispatchChange("PermissionsChanged", role.Id);
            var tenantId = RequiredTenantId();
            var eventId = Guid.NewGuid();
            realtimeChanges.Dispatch(new RealtimeChangeRequest(
                RealtimeAudience.ForTenantPermission(tenantId, Permissions.ViewRoles),
                "role-claims",
                "Update",
                role.Id,
                eventId));
            realtimeChanges.Dispatch(new RealtimeChangeRequest(
                RealtimeAudience.ForTenantRole(tenantId, role.Id),
                "role-claims",
                "Update",
                role.Id,
                eventId));

            return Result.Success();
        }

        private void DispatchChange(string action, string roleId) =>
            realtimeChanges.Dispatch(RealtimeChangeRequest.For<ApplicationRole>(
                RealtimeAudience.ForTenantPermission(RequiredTenantId(), Permissions.ViewRoles),
                action,
                roleId));

        private string RequiredTenantId()
        {
            var tenantId = currentActor.TenantId;
            return !string.IsNullOrWhiteSpace(tenantId)
                ? tenantId
                : throw new InvalidOperationException("A tenant is required to publish role changes.");
        }

        private Task<ApplicationRole?> FindVisibleRoleAsync(string roleId, CancellationToken cancellationToken)
        {
            var tenantId = currentActor.TenantId;
            if (string.IsNullOrWhiteSpace(tenantId))
                return Task.FromResult<ApplicationRole?>(null);

            return _roleManager.Roles.SingleOrDefaultAsync(role =>
                role.Id == roleId &&
                ((role.IsSystem && role.NormalizedName != AppRoles.super_admin.ToUpper()) ||
                 (!role.IsSystem && role.TenantId == tenantId)), cancellationToken);
        }

        private Task<ApplicationRole?> FindOwnedMutableRoleAsync(
            string roleId,
            CancellationToken cancellationToken)
        {
            var tenantId = currentActor.TenantId;
            if (string.IsNullOrWhiteSpace(tenantId))
                return Task.FromResult<ApplicationRole?>(null);

            return _roleManager.Roles.SingleOrDefaultAsync(role =>
                role.Id == roleId &&
                !role.IsSystem &&
                role.TenantId == tenantId,
                cancellationToken);
        }

        private static bool IsSystemName(string roleName) =>
            string.Equals(roleName.Trim(), AppRoles.super_admin, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(roleName.Trim(), AppRoles.admin, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(roleName.Trim(), AppRoles.user, StringComparison.OrdinalIgnoreCase);
    }
}
