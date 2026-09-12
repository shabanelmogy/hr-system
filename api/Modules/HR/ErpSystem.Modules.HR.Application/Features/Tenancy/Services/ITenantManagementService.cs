using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Tenancy.Services;

/// <summary>
/// Legacy HTTP compatibility contract retained so existing HR presentation routes and
/// DTOs stay wire-compatible. Runtime tenant-management orchestration is Platform-owned.
/// </summary>
public interface ITenantManagementService
{
    Task<PageResponse<TenantManagementResponse>> GetPageAsync(
        TenantManagementQuery request,
        CancellationToken cancellationToken = default);

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

    Task<Result<TenantManagementResponse>> ArchiveAsync(
        string id,
        ArchiveTenantRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<TenantManagementResponse>> RestoreAsync(
        string id,
        RestoreTenantRequest request,
        CancellationToken cancellationToken = default);
}
