using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Tenancy.Services;

/// <summary>
/// Legacy HTTP compatibility contract retained so existing HR presentation routes and
/// DTOs stay wire-compatible. Runtime tenant-administrator orchestration is Platform-owned.
/// </summary>
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
