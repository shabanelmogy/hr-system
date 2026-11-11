using System.Globalization;
using System.Security.Claims;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;

namespace ErpSystem.Modules.Platform.Application.Authentication.Tokens;

internal sealed class AccessTokenClaimMaterialService(IAccessTokenClaimMaterialSource source)
    : IAccessTokenClaimMaterialService
{
    public async Task<AccessTokenClaimMaterialResult> BuildAsync(
        AccessTokenClaimMaterialRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(request.User);

        var system = request.CompanyId == 0 && request.TenantId.Length == 0;
        if (!system && (request.CompanyId <= 0 || string.IsNullOrWhiteSpace(request.TenantId)))
            throw new InvalidOperationException("Invalid authentication session coordinates.");

        var snapshot = await source.GetAsync(
            request.User.UserId,
            request.TenantId,
            cancellationToken).ConfigureAwait(false);

        if (system && !snapshot.Roles.Any(role => role.IsSystem && !role.IsDeleted &&
                role.Name == PlatformRoleNames.SuperAdmin))
            throw new InvalidOperationException("A system session requires a live system administrator role.");

        var tenantName = system ? string.Empty : snapshot.Tenant?.Name ?? request.TenantId;
        var tenantPlanName = system ? string.Empty : string.IsNullOrWhiteSpace(snapshot.Tenant?.PlanName)
            ? "Free"
            : snapshot.Tenant.PlanName.Trim();

        var roles = snapshot.Roles
            .Where(role => !role.IsDeleted && (role.IsSystem ||
                (!role.IsSystem &&
                 !system &&
                 string.Equals(role.TenantId, request.TenantId, StringComparison.Ordinal) &&
                 !role.IsDeleted)))
            .ToArray();

        var claims = new List<AccessTokenClaimValue>
        {
            new(ClaimTypes.Name, request.User.UserName),
            new(ClaimTypes.Email, request.User.Email),
            new(ClaimTypes.NameIdentifier, request.User.UserId),
            new(AccessTokenClaimNames.FirstName, request.User.FirstName),
            new(AccessTokenClaimNames.LastName, request.User.LastName),
            new(AccessTokenClaimNames.JwtId, request.JwtId),
            new(AccessTokenClaimNames.SessionId, request.SessionId),
            new(AccessTokenClaimNames.SecurityStamp, request.User.SecurityStamp),
            new(AuthenticationTokenClaimNames.SessionScope, system
                ? AuthenticationTokenClaimNames.SystemSession : AuthenticationTokenClaimNames.CompanySession)
        };

        if (!system)
            claims.AddRange([
                new(AccessTokenClaimNames.TenantId, request.TenantId),
                new(AccessTokenClaimNames.TenantName, tenantName),
                new(AccessTokenClaimNames.TenantPlanName, tenantPlanName),
                new(AccessTokenClaimNames.CompanyId, request.CompanyId.ToString(CultureInfo.InvariantCulture))
            ]);

        claims.AddRange(roles.Select(role =>
            new AccessTokenClaimValue(ClaimTypes.Role, role.Name)));
        claims.AddRange(roles
            .Where(role => !role.IsSystem)
            .Select(role => new AccessTokenClaimValue(AccessTokenClaimNames.TenantRoleId, role.Id)));

        var roleIds = roles.Select(role => role.Id).ToHashSet(StringComparer.Ordinal);
        claims.AddRange(snapshot.RoleClaims
            .Where(claim =>
                roleIds.Contains(claim.RoleId) &&
                claim.ClaimType is not null &&
                claim.ClaimValue is not null &&
                !ReservedClaims.Contains(claim.ClaimType))
            .Select(claim => new AccessTokenClaimValue(claim.ClaimType!, claim.ClaimValue!)));

        if (!system && source is ICompanyPermissionClaimMaterialSource companyPermissions)
        {
            var direct = await companyPermissions.GetDirectPermissionsAsync(
                request.User.UserId,
                request.TenantId,
                request.CompanyId,
                cancellationToken).ConfigureAwait(false);
            claims.AddRange(direct.Select(permission =>
                new AccessTokenClaimValue(PermissionClaimNames.Permission, permission)));
        }

        return new AccessTokenClaimMaterialResult(
            tenantName,
            tenantPlanName,
            claims.DistinctBy(claim => (claim.Type, claim.Value)).ToArray());
    }

    private static readonly HashSet<string> ReservedClaims = new(StringComparer.Ordinal)
    {
        ClaimTypes.NameIdentifier, ClaimTypes.Name, ClaimTypes.Email, ClaimTypes.Role,
        AccessTokenClaimNames.FirstName, AccessTokenClaimNames.LastName,
        AccessTokenClaimNames.JwtId, AccessTokenClaimNames.SessionId, AccessTokenClaimNames.SecurityStamp,
        AccessTokenClaimNames.TenantId, AccessTokenClaimNames.TenantName, AccessTokenClaimNames.TenantPlanName,
        AccessTokenClaimNames.CompanyId, AccessTokenClaimNames.TenantRoleId,
        AuthenticationTokenClaimNames.Scope, AuthenticationTokenClaimNames.SessionScope,
        "exp", "nbf", "iat", "aud", "iss", "sub"
    };
}
