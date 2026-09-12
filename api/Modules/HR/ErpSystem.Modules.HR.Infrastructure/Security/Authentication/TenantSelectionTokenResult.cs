namespace ErpSystem.Modules.HR.Infrastructure.Security.Authentication;

public sealed record TenantSelectionTokenResult(
    string Token,
    DateTime ExpiresAt,
    string JwtId);

public sealed record ValidatedTenantSelectionToken(
    string UserId,
    string SecurityStamp,
    string JwtId);
