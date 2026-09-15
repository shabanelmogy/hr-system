namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Tokens;

public sealed record ValidatedAccessToken(
    string UserId,
    string JwtId,
    string SessionId,
    string SecurityStamp,
    string TenantId,
    int CompanyId);
