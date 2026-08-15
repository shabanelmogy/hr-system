using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Tenancy.Contracts;

namespace HrManagementSystem.Application.Features.Tenancy.Services;

public interface ITenantAdminService
{
    Task<PageResponse<TenantAdminResponse>> GetPageAsync(
        TenantAdminQuery request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TenantAdminResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<Result<TenantAdminResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<Result<TenantAdminResponse>> CreateAsync(
        CreateTenantAdminRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<TenantAdminResponse>> UpdateAsync(
        string id,
        UpdateTenantAdminRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<Result<TenantAdminResponse>> RestoreAsync(
        string id,
        CancellationToken cancellationToken = default);
}
