using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;

namespace ErpSystem.Modules.HR.Infrastructure.Security.Authentication;

public sealed class JwtProvider(
    IAuthenticationTokenService tokens) : IJwtProvider, IRealtimeTokenProvider
{
    public async Task<AccessTokenResult> GenerateAccessTokenAsync(
        ApplicationUser user,
        string sessionId,
        int companyId,
        string tenantId)
    {
        var issued = await tokens.GenerateAccessTokenAsync(
            new AccessTokenUserSnapshot(
                user.Id,
                user.UserName ?? string.Empty,
                user.Email ?? string.Empty,
                user.FirstName,
                user.LastName,
                user.SecurityStamp ?? string.Empty),
            sessionId,
            companyId,
            tenantId);

        return new AccessTokenResult(
            issued.Token,
            issued.ExpiresAt,
            issued.JwtId,
            issued.TenantName,
            issued.TenantPlanName);
    }

    public string GenerateRealtimeToken(ClaimsPrincipal principal) =>
        tokens.GenerateRealtimeToken(principal.Claims
            .Select(claim => new AccessTokenClaimValue(claim.Type, claim.Value))
            .ToArray());

    public TenantSelectionTokenResult GenerateTenantSelectionToken(ApplicationUser user)
    {
        var issued = tokens.GenerateTenantSelectionToken(new AuthenticationTokenSubjectSnapshot(
            user.Id,
            user.SecurityStamp ?? string.Empty));
        return new TenantSelectionTokenResult(
            issued.Token,
            issued.ExpiresAt,
            issued.JwtId);
    }

    public ValidatedTenantSelectionToken? ValidateTenantSelectionToken(string token)
    {
        var validated = tokens.ValidateTenantSelectionToken(token);
        return validated is null
            ? null
            : new ValidatedTenantSelectionToken(
                validated.UserId,
                validated.SecurityStamp,
                validated.JwtId);
    }

    public CompanySelectionTokenResult GenerateCompanySelectionToken(ApplicationUser user, string tenantId)
    {
        var issued = tokens.GenerateCompanySelectionToken(
            new AuthenticationTokenSubjectSnapshot(user.Id, user.SecurityStamp ?? string.Empty),
            tenantId);
        return new CompanySelectionTokenResult(
            issued.Token,
            issued.ExpiresAt,
            issued.JwtId);
    }

    public ValidatedCompanySelectionToken? ValidateCompanySelectionToken(string token)
    {
        var validated = tokens.ValidateCompanySelectionToken(token);
        return validated is null
            ? null
            : new ValidatedCompanySelectionToken(
                validated.UserId,
                validated.TenantId,
                validated.SecurityStamp,
                validated.JwtId);
    }

    public ValidatedAccessToken? ValidateExpiredAccessToken(string token)
    {
        var validated = tokens.ValidateExpiredAccessToken(token);
        return validated is null
            ? null
            : new ValidatedAccessToken(
                validated.UserId,
                validated.JwtId,
                validated.SessionId,
                validated.SecurityStamp,
                validated.TenantId,
                validated.CompanyId);
    }
}
