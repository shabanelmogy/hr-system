namespace HrManagementSystem.Features.Security.Authentication.Contracts;

public sealed record SessionResponse(
    string UserId,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Permissions,
    long ExpiresAt);
