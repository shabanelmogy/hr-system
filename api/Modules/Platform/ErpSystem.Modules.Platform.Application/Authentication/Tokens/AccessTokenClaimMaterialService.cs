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

        var snapshot = await source.GetAsync(
            request.User.UserId,
            request.TenantId,
            cancellationToken).ConfigureAwait(false);

        var tenantName = snapshot.Tenant?.Name ?? request.TenantId;
        var tenantPlanName = string.IsNullOrWhiteSpace(snapshot.Tenant?.PlanName)
            ? "Free"
            : snapshot.Tenant.PlanName.Trim();

        var roles = snapshot.Roles
            .Where(role => role.IsSystem ||
                (!role.IsSystem &&
                 string.Equals(role.TenantId, request.TenantId, StringComparison.Ordinal) &&
                 !role.IsDeleted))
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
            new(AccessTokenClaimNames.TenantId, request.TenantId),
            new(AccessTokenClaimNames.TenantName, tenantName),
            new(AccessTokenClaimNames.TenantPlanName, tenantPlanName),
            new(AccessTokenClaimNames.CompanyId, request.CompanyId.ToString(CultureInfo.InvariantCulture))
        };

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
                claim.ClaimValue is not null)
            .Select(claim => new AccessTokenClaimValue(claim.ClaimType!, claim.ClaimValue!)));

        return new AccessTokenClaimMaterialResult(
            tenantName,
            tenantPlanName,
            claims.DistinctBy(claim => (claim.Type, claim.Value)).ToArray());
    }
}
