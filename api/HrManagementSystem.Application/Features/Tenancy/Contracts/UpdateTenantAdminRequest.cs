namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

public sealed record UpdateTenantAdminRequest(
    string FirstName,
    string LastName,
    string UserName,
    string Email,
    string? Password,
    bool IsDisabled,
    IReadOnlyCollection<string> TenantIds,
    string DefaultTenantId);
