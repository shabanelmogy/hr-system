using System.Security.Claims;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Entitlements;
using ErpSystem.Modules.Platform.Contracts.Modules;
using Microsoft.AspNetCore.Authorization;

namespace ErpSystem.Modules.Platform.Infrastructure.Authorization;

/// <summary>
/// Platform-owned live authorization check. JWT claims are the fast-path signal;
/// tenant permissions and entitlements are re-read so revocation is immediate.
/// Unknown permissions fail closed.
/// </summary>
public sealed class PermissionAuthorizationHandler(
    IModuleCatalogPolicy moduleCatalog,
    ITenantModuleEntitlementSource entitlements)
    : AuthorizationHandler<PermissionRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
            return;

        if (!context.User.HasClaim(PermissionClaimNames.Permission, requirement.Permission))
            return;

        if (!moduleCatalog.TryResolvePermission(
                requirement.Permission,
                out var moduleCode,
                out var submoduleCode))
        {
            if (PlatformPermissions.IsPlatformPermission(requirement.Permission))
                context.Succeed(requirement);
            return;
        }

        if (context.User.IsInRole(PlatformRoleNames.SuperAdmin))
            return;

        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var tenantId = context.User.FindFirstValue(AuthenticationTokenClaimNames.TenantId);
        var companyId = context.User.FindFirstValue(AuthenticationTokenClaimNames.CompanyId);
        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            !int.TryParse(companyId, out var parsedCompanyId) ||
            parsedCompanyId <= 0)
            return;

        if (!await entitlements.UserHasPermissionAsync(
                userId,
                tenantId,
                requirement.Permission).ConfigureAwait(false) ||
            !await entitlements.HasAccessAsync(
                tenantId,
                moduleCode,
                submoduleCode).ConfigureAwait(false))
        {
            return;
        }

        context.Succeed(requirement);
    }
}
