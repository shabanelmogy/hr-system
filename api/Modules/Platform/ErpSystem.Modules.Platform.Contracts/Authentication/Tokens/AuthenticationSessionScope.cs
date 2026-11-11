using System.Globalization;

namespace ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;

/// <summary>Validates scope coordinates without assigning a Tenant or company to a system session.</summary>
public static class AuthenticationSessionScope
{
    public static bool TryResolve(string? scope, string? tenantId, string? companyValue,
        out string resolvedScope, out int companyId)
    {
        resolvedScope = scope ?? AuthenticationTokenClaimNames.CompanySession;
        companyId = 0;
        if (resolvedScope == AuthenticationTokenClaimNames.SystemSession)
            return tenantId is null && companyValue is null;

        return resolvedScope == AuthenticationTokenClaimNames.CompanySession &&
               !string.IsNullOrWhiteSpace(tenantId) &&
               int.TryParse(companyValue, NumberStyles.Integer, CultureInfo.InvariantCulture, out companyId) &&
               companyId > 0;
    }
}
