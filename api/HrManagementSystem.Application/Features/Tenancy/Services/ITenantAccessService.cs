using HrManagementSystem.Application.Features.Tenancy.Contracts;

namespace HrManagementSystem.Application.Features.Tenancy.Services;

public interface ITenantAccessService
{
    Task<TenantAccessResponse?> GetAsync(
        string tenantId,
        CancellationToken cancellationToken = default);
}
