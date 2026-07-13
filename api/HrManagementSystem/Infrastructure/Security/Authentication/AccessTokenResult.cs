namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed record AccessTokenResult(string Token, DateTime ExpiresAt, string JwtId);
