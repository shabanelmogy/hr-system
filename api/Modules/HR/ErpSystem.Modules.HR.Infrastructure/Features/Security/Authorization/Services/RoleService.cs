using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Contracts;
using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Services;
using ErpSystem.Modules.HR.Application.Features.Security.Authorization.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Authorization.Errors;
using ErpSystem.Modules.HR.Application.Features.Security.Authorization.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Modules;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authorization.Services
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
        TimeProvider timeProvider,
        IModuleCatalogPolicy moduleCatalog,
        ILogger<RoleService> logger) : IRoleService
    {
        private readonly RoleManager<ApplicationRole> _roleManager = roleManager;
        private readonly RoleErrors _roleErrors = roleErrors;
        private readonly ILogger<RoleService> _logger = logger;

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

            var roleName = request.Name.Trim();
            var normalizedName = _roleManager.NormalizeKey(roleName) ?? roleName.ToUpperInvariant();
            var postCommit = new List<PostCommitEffect>();

            try
            {
                var result = await context.ExecuteAtomicallyAsync(
                    [RoleLockResource(tenantId, $"name:{normalizedName}")],
                    async token =>
                    {
                        var role = new ApplicationRole
                        {
                            Name = roleName,
                            TenantId = tenantId,
                            IsSystem = false,
                            ConcurrencyStamp = Guid.NewGuid().ToString()
                        };

                        var createResult = await _roleManager.CreateAsync(role);
                        EnsureIdentitySuccess(createResult);

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
                            }), token);

                        postCommit.Add(new PostCommitEffect(
                            "RoleCreated.Realtime",
                            () => DispatchChange("Create", role.Id, tenantId)));
                        return Result.Success(response);
                    },
                    cancellationToken);

                RunPostCommit(postCommit);
                return result;
            }
            catch (IdentityMutationException exception)
            {
                return Result.Failure<RoleResponse>(exception.Error);
            }
        }

        public async Task<Result> UpdateAsync(RoleRequest roleRequest, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(roleRequest.Id))
                return Result.Failure(_roleErrors.RoleNotFound);

            cancellationToken.ThrowIfCancellationRequested();
            if (IsSystemName(roleRequest.Name))
                return Result.Failure(_roleErrors.RoleNotFound);

            var tenantId = currentActor.TenantId;
            if (string.IsNullOrWhiteSpace(tenantId))
                return Result.Failure(_roleErrors.RoleNotFound);

            var postCommit = new List<PostCommitEffect>();
            try
            {
                var result = await context.ExecuteAtomicallyAsync(
                    [RoleLockResource(tenantId, $"id:{roleRequest.Id}")],
                    async token =>
                    {
                        var currentRole = await FindOwnedMutableRoleAsync(roleRequest.Id, token);
                        if (currentRole is null)
                            return Result.Failure(_roleErrors.RoleNotFound);

                        var previousName = currentRole.Name;
                        currentRole.Name = roleRequest.Name.Trim();
                        EnsureIdentitySuccess(await _roleManager.UpdateAsync(currentRole));

                        await securityAudit.RecordAsync(new SecurityAuditRequest(
                            "RoleUpdated",
                            "ApplicationRole",
                            currentRole.Id,
                            TenantId: tenantId,
                            Metadata: new Dictionary<string, string?>
                            {
                                ["PreviousName"] = previousName,
                                ["NewName"] = currentRole.Name
                            }), token);

                        postCommit.Add(new PostCommitEffect(
                            "RoleUpdated.Realtime",
                            () => DispatchChange("Update", currentRole.Id, tenantId)));
                        return Result.Success();
                    },
                    cancellationToken);

                RunPostCommit(postCommit);
                return result;
            }
            catch (IdentityMutationException exception)
            {
                return Result.Failure(exception.Error);
            }
        }

        public async Task<Result> ToggleStatusAsync(string id, CancellationToken cancellationToken)
        {
            var tenantId = currentActor.TenantId;
            if (string.IsNullOrWhiteSpace(tenantId))
                return Result.Failure<RoleDetailResponse>(_roleErrors.RoleNotFound);

            var postCommit = new List<PostCommitEffect>();
            try
            {
                var result = await context.ExecuteAtomicallyAsync(
                    [RoleLockResource(tenantId, $"id:{id}")],
                    async token =>
                    {
                        var role = await FindOwnedMutableRoleAsync(id, token);
                        if (role is null)
                            return Result.Failure<RoleDetailResponse>(_roleErrors.RoleNotFound);

                        role.IsDeleted = !role.IsDeleted;
                        EnsureIdentitySuccess(await _roleManager.UpdateAsync(role));

                        var affectedCount = 0;
                        if (role.IsDeleted)
                        {
                            affectedCount = await InvalidateUsersInRoleAsync(
                                role.Id,
                                "Role deactivated",
                                "Your session was revoked because your assigned role was deactivated.",
                                postCommit,
                                token);
                        }

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
                            }), token);

                        postCommit.Add(new PostCommitEffect(
                            "RoleStatusChanged.Realtime",
                            () => DispatchChange(
                                role.IsDeleted ? "Delete" : "Restore",
                                role.Id,
                                tenantId)));
                        return Result.Success();
                    },
                    cancellationToken);

                RunPostCommit(postCommit);
                return result;
            }
            catch (IdentityMutationException exception)
            {
                return Result.Failure(exception.Error);
            }
        }

        public async Task<Result<RoleResponse>> GetRoleClaims(string roleId, CancellationToken cancellationToken)
        {
            var role = await FindVisibleRoleAsync(roleId, cancellationToken);

            if (role == null)
                return Result.Failure<RoleResponse>(_roleErrors.RoleNotFound);

            cancellationToken.ThrowIfCancellationRequested();
            var roleClaims = (await _roleManager.GetClaimsAsync(role)).Select(claim => claim.Value).ToHashSet();
            var allClaims = GetAssignableTenantPermissions();
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
            var tenantId = currentActor.TenantId;
            if (string.IsNullOrWhiteSpace(tenantId))
                return Result.Failure(_roleErrors.RoleNotFound);

            var selectedClaims = rolerequest.RoleClaims?.Where(claim => claim.IsSelected).ToList() ?? [];
            var assignablePermissions = GetAssignableTenantPermissions().ToHashSet(StringComparer.Ordinal);
            if (selectedClaims.Any(claim => !assignablePermissions.Contains(claim.DisplayValue)) ||
                selectedClaims.Select(claim => claim.DisplayValue).Distinct(StringComparer.Ordinal).Count() != selectedClaims.Count)
            {
                return Result.Failure(_roleErrors.InvalidPermissions);
            }

            var postCommit = new List<PostCommitEffect>();
            try
            {
                var result = await context.ExecuteAtomicallyAsync(
                    [RoleLockResource(tenantId, $"id:{rolerequest.Id}")],
                    async token =>
                    {
                        var role = await FindOwnedMutableRoleAsync(rolerequest.Id, token);
                        if (role is null)
                            return Result.Failure(_roleErrors.RoleNotFound);

                        var existingClaims = await _roleManager.GetClaimsAsync(role);
                        var previousClaims = existingClaims
                            .Select(claim => claim.Value)
                            .ToHashSet();

                        foreach (var claim in existingClaims)
                        {
                            token.ThrowIfCancellationRequested();
                            EnsureIdentitySuccess(await _roleManager.RemoveClaimAsync(role, claim));
                        }

                        foreach (var claim in selectedClaims)
                        {
                            token.ThrowIfCancellationRequested();
                            EnsureIdentitySuccess(await _roleManager.AddClaimAsync(
                                role,
                                new Claim(Permissions.Type, claim.DisplayValue)));
                        }

                        var affectedCount = await InvalidateUsersInRoleAsync(
                            role.Id,
                            "Role permissions changed",
                            "Your session was revoked because your role permissions were updated.",
                            postCommit,
                            token);

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
                            }), token);

                        postCommit.Add(new PostCommitEffect(
                            "RolePermissionsUpdated.Realtime",
                            () => DispatchChange("PermissionsChanged", role.Id, tenantId)));
                        var eventId = Guid.NewGuid();
                        postCommit.Add(new PostCommitEffect(
                            "RolePermissionsUpdated.TenantRealtime",
                            () => realtimeChanges.Dispatch(new RealtimeChangeRequest(
                                RealtimeAudience.ForTenantPermission(tenantId, Permissions.ViewRoles),
                                "role-claims",
                                "Update",
                                role.Id,
                                eventId))));
                        postCommit.Add(new PostCommitEffect(
                            "RolePermissionsUpdated.RoleRealtime",
                            () => realtimeChanges.Dispatch(new RealtimeChangeRequest(
                                RealtimeAudience.ForTenantRole(tenantId, role.Id),
                                "role-claims",
                                "Update",
                                role.Id,
                                eventId))));

                        return Result.Success();
                    },
                    cancellationToken);

                RunPostCommit(postCommit);
                return result;
            }
            catch (IdentityMutationException exception)
            {
                return Result.Failure(exception.Error);
            }
        }

        private IReadOnlyList<string> GetAssignableTenantPermissions() =>
            Permissions.GetTenantPermissions()
                .Concat(moduleCatalog.GetInstalled()
                    .SelectMany(module => module.Submodules)
                    .SelectMany(submodule => submodule.RequiredPermissions))
                .Where(permission =>
                    !string.IsNullOrWhiteSpace(permission) &&
                    !PlatformPermissions.IsPlatformPermission(permission))
                .Distinct(StringComparer.Ordinal)
                .ToArray();

        private async Task<int> InvalidateUsersInRoleAsync(
            string roleId,
            string reason,
            string notificationMessage,
            ICollection<PostCommitEffect> postCommit,
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
                EnsureIdentitySuccess(await userManager.UpdateSecurityStampAsync(user));

                foreach (var token in user.RefreshTokens.Where(token => token.IsActiveAt(now)))
                {
                    token.Revoke(reason, now);
                }

                EnsureIdentitySuccess(await userManager.UpdateAsync(user));
                postCommit.Add(new PostCommitEffect(
                    "SessionRevocation.Hangfire",
                    () => revocationNotifier.Queue(user.Id, notificationMessage)));
            }

            return users.Count;
        }

        private void DispatchChange(string action, string roleId, string tenantId) =>
            realtimeChanges.Dispatch(RealtimeChangeRequest.For<ApplicationRole>(
                RealtimeAudience.ForTenantPermission(tenantId, Permissions.ViewRoles),
                action,
                roleId));

        private string RequiredTenantId() => currentActor.TenantId is { Length: > 0 } tenantId
            ? tenantId
            : throw new InvalidOperationException("A tenant is required to publish role changes.");

        private static string RoleLockResource(string tenantId, string discriminator)
        {
            var hash = Convert.ToHexString(SHA256.HashData(
                Encoding.UTF8.GetBytes($"role|{tenantId}|{discriminator}")));
            return $"ErpSystem:HR:Role:{hash[..32]}";
        }

        private void RunPostCommit(IEnumerable<PostCommitEffect> effects)
        {
            foreach (var effect in effects)
            {
                try
                {
                    effect.Action();
                }
                catch (Exception exception)
                {
                    _logger.LogError(
                        exception,
                        "Post-commit role side effect failed. Effect={EffectName}",
                        effect.Name);
                }
            }
        }

        private sealed record PostCommitEffect(string Name, Action Action);

        private static void EnsureIdentitySuccess(IdentityResult result)
        {
            if (result.Succeeded)
                return;

            var error = result.Errors.FirstOrDefault() ?? new IdentityError
            {
                Code = "IdentityOperationFailed",
                Description = "The identity operation failed."
            };
            throw new IdentityMutationException(
                new Error(error.Code, error.Description, ErrorType.Validation));
        }

        private sealed class IdentityMutationException(Error error) : Exception
        {
            public Error Error { get; } = error;
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
