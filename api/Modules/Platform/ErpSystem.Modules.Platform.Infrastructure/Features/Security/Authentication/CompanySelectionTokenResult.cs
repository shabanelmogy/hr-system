namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Tokens;

public sealed record CompanySelectionTokenResult(
    string Token,
    DateTime ExpiresAt,
    string JwtId);

public sealed record ValidatedCompanySelectionToken(
    string UserId,
    string TenantId,
    string SecurityStamp,
    string JwtId);
