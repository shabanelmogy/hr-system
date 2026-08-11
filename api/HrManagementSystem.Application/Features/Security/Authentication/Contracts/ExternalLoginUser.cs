namespace HrManagementSystem.Application.Features.Security.Authentication.Contracts;

public sealed record ExternalLoginUser(
    string ProviderKey,
    string Email,
    string FirstName,
    string LastName);
