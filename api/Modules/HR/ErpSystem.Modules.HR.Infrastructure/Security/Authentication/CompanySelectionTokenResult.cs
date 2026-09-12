namespace ErpSystem.Modules.HR.Infrastructure.Security.Authentication;

public sealed record CompanySelectionTokenResult(
    string Token,
    DateTime ExpiresAt,
    string JwtId);

public sealed record ValidatedCompanySelectionToken(
    string UserId,
    string TenantId,
    string SecurityStamp,
    string JwtId);
