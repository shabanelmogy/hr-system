namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Tokens;

public sealed record TenantSelectionTokenResult(
    string Token,
    DateTime ExpiresAt,
    string JwtId);

public sealed record ValidatedTenantSelectionToken(
    string UserId,
    string SecurityStamp,
    string JwtId);
