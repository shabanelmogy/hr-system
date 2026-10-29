using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;

namespace ErpSystem.Modules.Platform.Presentation.Authentication;

public static class AuthenticationSessionContextRequestFactory
{
    public static AuthenticationSessionContextRequest FromPrincipal(ClaimsPrincipal user)
    {
        _ = long.TryParse(user.FindFirstValue(JwtRegisteredClaimNames.Exp), System.Globalization.NumberStyles.Integer,
            System.Globalization.CultureInfo.InvariantCulture, out var expires);
        _ = int.TryParse(user.FindFirstValue(AuthenticationTokenClaimNames.CompanyId), out var companyId);
        return new AuthenticationSessionContextRequest(
            user.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty,
            user.FindFirstValue(AuthenticationTokenClaimNames.TenantId) ?? string.Empty, companyId,
            user.FindFirstValue(ClaimTypes.Name) ?? string.Empty, user.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
            user.FindFirstValue(AuthenticationTokenClaimNames.FirstName) ?? string.Empty,
            user.FindFirstValue(AuthenticationTokenClaimNames.LastName) ?? string.Empty,
            user.FindAll(ClaimTypes.Role).Select(claim => claim.Value).Distinct().ToArray(),
            user.FindAll(PermissionClaimNames.Permission).Select(claim => claim.Value).Distinct().ToArray(), expires * 1000);
    }
}
