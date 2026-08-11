using HrManagementSystem.Application.Features.Tenancy.Contracts;

namespace HrManagementSystem.Application.Features.Tenancy.Services;

public interface ITenantManagementService
{
    Task<IReadOnlyList<TenantManagementResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<Result<TenantManagementResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<Result<TenantManagementResponse>> CreateAsync(
        TenantManagementRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<TenantManagementResponse>> UpdateAsync(
        string id,
        TenantManagementRequest request,
        CancellationToken cancellationToken = default);
}
