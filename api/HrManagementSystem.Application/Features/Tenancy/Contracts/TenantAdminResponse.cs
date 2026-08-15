namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

public sealed record TenantAdminResponse(
    string Id,
    string FirstName,
    string LastName,
    string UserName,
    string Email,
    bool IsDisabled,
    bool IsLocked,
    string DefaultTenantId,
    IReadOnlyCollection<TenantAdminTenantResponse> Tenants,
    IReadOnlyCollection<int> CompanyIds,
    string LifecycleStatus,
    DateTime? ArchivedOn,
    string? ArchiveReason);

public sealed record TenantAdminTenantResponse(
    string Id,
    string Identifier,
    string Name,
    bool IsDefault);
