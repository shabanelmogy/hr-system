using System.Security.Claims;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using Microsoft.AspNetCore.Authorization;

namespace ErpSystem.Modules.Platform.Infrastructure.Authorization;

/// <summary>
/// Requires the complete, cryptographically validated tenant-session scope.
/// Bearer authentication performs the live session, membership, subscription,
/// and company checks; this handler keeps the endpoint policy fail-closed when
/// a principal was created by another authentication path or test.
/// </summary>
public sealed class TenantMemberAuthorizationHandler
    : AuthorizationHandler<TenantMemberRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        TenantMemberRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true ||
            context.User.IsInRole(PlatformRoleNames.SuperAdmin) ||
            (!context.User.IsInRole(PlatformRoleNames.Admin) &&
             !context.User.IsInRole(PlatformRoleNames.User)) ||
            !HasNonBlankClaim(context.User, ClaimTypes.NameIdentifier) ||
            !HasNonBlankClaim(context.User, AuthenticationTokenClaimNames.TenantId) ||
            !HasNonBlankClaim(context.User, AuthenticationTokenClaimNames.SessionId) ||
            !HasNonBlankClaim(context.User, AuthenticationTokenClaimNames.SecurityStamp) ||
            !HasPositiveCompanyId(context.User))
        {
            return Task.CompletedTask;
        }

        context.Succeed(requirement);
        return Task.CompletedTask;
    }

    private static bool HasNonBlankClaim(ClaimsPrincipal principal, string claimType) =>
        !string.IsNullOrWhiteSpace(principal.FindFirstValue(claimType));

    private static bool HasPositiveCompanyId(ClaimsPrincipal principal) =>
        int.TryParse(
            principal.FindFirstValue(AuthenticationTokenClaimNames.CompanyId),
            out var companyId) &&
        companyId > 0;
}

/// <summary>Marker requirement for tenant-scoped endpoint access.</summary>
public sealed class TenantMemberRequirement : IAuthorizationRequirement;
