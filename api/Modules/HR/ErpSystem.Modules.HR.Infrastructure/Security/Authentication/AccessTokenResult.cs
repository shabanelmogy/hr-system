namespace ErpSystem.Modules.HR.Infrastructure.Security.Authentication;

public sealed record AccessTokenResult(
    string Token,
    DateTime ExpiresAt,
    string JwtId,
    string TenantName,
    string TenantPlanName);
