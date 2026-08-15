namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

public sealed record CreateTenantAdminRequest(
    string FirstName,
    string LastName,
    string UserName,
    string Email,
    string Password,
    IReadOnlyCollection<string> TenantIds,
    string DefaultTenantId);
