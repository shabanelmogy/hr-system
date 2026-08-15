namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed record TenantSelectionTokenResult(string Token, DateTime ExpiresAt);

public sealed record ValidatedTenantSelectionToken(
    string UserId,
    string SecurityStamp);
