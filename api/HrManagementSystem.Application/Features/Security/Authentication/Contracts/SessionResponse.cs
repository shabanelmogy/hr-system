namespace HrManagementSystem.Application.Features.Security.Authentication.Contracts;

public sealed record SessionResponse(
    string UserId,
    string TenantId,
    int CompanyId,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Permissions,
    long ExpiresAt);
