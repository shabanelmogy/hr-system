using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

public interface IJwtProvider
{
    Task<AccessTokenResult> GenerateAccessTokenAsync(
        ApplicationUser user,
        string sessionId,
        int companyId);

    CompanySelectionTokenResult GenerateCompanySelectionToken(ApplicationUser user);

    ValidatedCompanySelectionToken? ValidateCompanySelectionToken(string token);

    string GenerateRealtimeToken(ClaimsPrincipal principal);

    ValidatedAccessToken? ValidateExpiredAccessToken(string token);
}
