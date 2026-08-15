using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

public interface IJwtProvider
{
    Task<AccessTokenResult> GenerateAccessTokenAsync(
        ApplicationUser user,
        string sessionId,
        int companyId,
        string tenantId);

    TenantSelectionTokenResult GenerateTenantSelectionToken(ApplicationUser user);

    ValidatedTenantSelectionToken? ValidateTenantSelectionToken(string token);

    CompanySelectionTokenResult GenerateCompanySelectionToken(ApplicationUser user, string tenantId);

    ValidatedCompanySelectionToken? ValidateCompanySelectionToken(string token);

    string GenerateRealtimeToken(ClaimsPrincipal principal);

    ValidatedAccessToken? ValidateExpiredAccessToken(string token);
}
