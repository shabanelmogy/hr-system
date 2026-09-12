namespace ErpSystem.Modules.HR.Infrastructure.Security.Authentication;

public sealed record ValidatedAccessToken(
    string UserId,
    string JwtId,
    string SessionId,
    string SecurityStamp,
    string TenantId,
    int CompanyId);
