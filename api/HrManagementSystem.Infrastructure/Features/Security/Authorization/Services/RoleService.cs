using System.Globalization;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Application.Features.Security.Authorization.Contracts;
using HrManagementSystem.Application.Features.Security.Authorization.Errors;
using HrManagementSystem.Application.Features.Security.Authorization.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;
using HrManagementSystem.Infrastructure.Persistence;

namespace HrManagementSystem.Infrastructure.Features.Security.Authorization.Services
{
    public class RoleService(
        RoleManager<ApplicationRole> roleManager,
        RoleErrors roleErrors,
        IRealtimeChangeDispatcher realtimeChanges,
        ICurrentActor currentActor,
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ISecurityAuditService securityAudit,
        SessionRevocationNotifier revocationNotifier,
        TimeProvider timeProvider) : IRoleService
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

                await securityAudit.RecordAsync(new SecurityAuditRequest(
                    "RoleCreated",
                    "ApplicationRole",
                    role.Id,
                    TenantId: tenantId,
                    Metadata: new Dictionary<string, string?>
                    {
                        ["RoleName"] = role.Name,
                        ["IsSystem"] = role.IsSystem.ToString()
                    }), cancellationToken);

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

            var previousName = currentRole.Name;
            currentRole.Name = roleRequest.Name.Trim();

            var result = await _roleManager.UpdateAsync(currentRole);
            if (result.Succeeded)
            {
                var tenantId = RequiredTenantId();
                await securityAudit.RecordAsync(new SecurityAuditRequest(
                    "RoleUpdated",
                    "ApplicationRole",
                    currentRole.Id,
                    TenantId: tenantId,
                    Metadata: new Dictionary<string, string?>
                    {
                        ["PreviousName"] = previousName,
                        ["NewName"] = currentRole.Name
                    }), cancellationToken);

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

            var affectedCount = 0;
            if (role.IsDeleted)
            {
                affectedCount = await InvalidateUsersInRoleAsync(
                    role.Id,
                    "Role deactivated",
                    "Your session was revoked because your assigned role was deactivated.",
                    cancellationToken);
            }

            var tenantId = RequiredTenantId();
            await securityAudit.RecordAsync(new SecurityAuditRequest(
                role.IsDeleted ? "RoleArchived" : "RoleRestored",
                "ApplicationRole",
                role.Id,
                TenantId: tenantId,
                Metadata: new Dictionary<string, string?>
                {
                    ["RoleName"] = role.Name,
                    ["IsDeleted"] = role.IsDeleted.ToString(),
                    ["AffectedUsersCount"] = affectedCount.ToString(CultureInfo.InvariantCulture)
                }), cancellationToken);

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

            var previousClaims = (await _roleManager.GetClaimsAsync(role))
                .Select(claim => claim.Value)
                .ToHashSet();

            foreach (var claim in await _roleManager.GetClaimsAsync(role))
            {
                cancellationToken.ThrowIfCancellationRequested();
                await _roleManager.RemoveClaimAsync(role, claim);
            }

            foreach (var claim in selectedClaims)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await _roleManager.AddClaimAsync(role, new Claim(Permissions.Type, claim.DisplayValue));
            }

            var affectedCount = await InvalidateUsersInRoleAsync(
                role.Id,
                "Role permissions changed",
                "Your session was revoked because your role permissions were updated.",
                cancellationToken);

            var tenantId = RequiredTenantId();
            await securityAudit.RecordAsync(new SecurityAuditRequest(
                "RolePermissionsUpdated",
                "ApplicationRole",
                role.Id,
                TenantId: tenantId,
                Metadata: new Dictionary<string, string?>
                {
                    ["RoleName"] = role.Name,
                    ["PreviousPermissions"] = string.Join(',', previousClaims.OrderBy(claim => claim, StringComparer.Ordinal)),
                    ["NewPermissions"] = string.Join(',', selectedClaims.Select(claim => claim.DisplayValue).OrderBy(claim => claim, StringComparer.Ordinal)),
                    ["AffectedUsersCount"] = affectedCount.ToString(CultureInfo.InvariantCulture)
                }), cancellationToken);

            DispatchChange("PermissionsChanged", role.Id);
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

        private async Task<int> InvalidateUsersInRoleAsync(
            string roleId,
            string reason,
            string notificationMessage,
            CancellationToken cancellationToken)
        {
            var tenantId = RequiredTenantId();

            var affectedUserIds = await (
                from userRole in context.UserRoles
                join user in context.Users on userRole.UserId equals user.Id
                where userRole.RoleId == roleId && user.TenantId == tenantId
                select user.Id)
                .Distinct()
                .ToListAsync(cancellationToken);

            if (affectedUserIds.Count == 0)
                return 0;

            var now = timeProvider.GetUtcNow().UtcDateTime;

            var users = await context.Users
                .Include(user => user.RefreshTokens)
                .Where(user => affectedUserIds.Contains(user.Id))
                .ToListAsync(cancellationToken);

            foreach (var user in users)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await userManager.UpdateSecurityStampAsync(user);

                foreach (var token in user.RefreshTokens.Where(token => token.IsActiveAt(now)))
                {
                    token.Revoke(reason, now);
                }

                await userManager.UpdateAsync(user);
                revocationNotifier.Queue(user.Id, notificationMessage);
            }

            return users.Count;
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
