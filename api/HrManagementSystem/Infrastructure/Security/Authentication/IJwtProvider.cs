namespace HrManagementSystem.Infrastructure.Security.Authentication;

public interface IJwtProvider
{
    Task<AccessTokenResult> GenerateAccessTokenAsync(ApplicationUser user, string sessionId);

    string GenerateRealtimeToken(ClaimsPrincipal principal);

    ValidatedAccessToken? ValidateExpiredAccessToken(string token);
}
