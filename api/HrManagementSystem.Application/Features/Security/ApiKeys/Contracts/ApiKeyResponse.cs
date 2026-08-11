namespace HrManagementSystem.Application.Features.Security.ApiKeys.Contracts;

public sealed record ApiKeyResponse(
    int Id,
    string KeyPrefix,
    string ClientUri,
    string Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? ExpiresAt,
    DateTime? RevokedAt);
