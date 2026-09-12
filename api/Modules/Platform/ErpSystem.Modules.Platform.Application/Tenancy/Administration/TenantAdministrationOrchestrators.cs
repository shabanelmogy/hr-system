using ErpSystem.Modules.Platform.Contracts.Tenancy.Administration;

namespace ErpSystem.Modules.Platform.Application.Tenancy.Administration;

internal sealed class TenantManagementOrchestrator(
    ITenantManagementAdapter adapter) : ITenantManagementOrchestrator
{
    public Task<TenantAdministrationPage<TenantManagementResponse>> GetPageAsync(
        TenantAdministrationPageRequest request,
        CancellationToken cancellationToken = default) =>
        adapter.GetPageAsync(request, cancellationToken);

    public Task<IReadOnlyList<TenantManagementResponse>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        adapter.GetAllAsync(cancellationToken);

    public Task<TenantAdministrationResult<TenantManagementResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        adapter.GetAsync(id, cancellationToken);

    public Task<TenantAdministrationResult<TenantManagementResponse>> CreateAsync(
        TenantManagementRequest request,
        CancellationToken cancellationToken = default) =>
        adapter.CreateAsync(request, cancellationToken);

    public Task<TenantAdministrationResult<TenantManagementResponse>> UpdateAsync(
        string id,
        TenantManagementRequest request,
        CancellationToken cancellationToken = default) =>
        adapter.UpdateAsync(id, request, cancellationToken);

    public Task<TenantAdministrationResult<TenantManagementResponse>> ArchiveAsync(
        string id,
        ArchiveTenantRequest request,
        CancellationToken cancellationToken = default) =>
        adapter.ArchiveAsync(id, request, cancellationToken);

    public Task<TenantAdministrationResult<TenantManagementResponse>> RestoreAsync(
        string id,
        RestoreTenantRequest request,
        CancellationToken cancellationToken = default) =>
        adapter.RestoreAsync(id, request, cancellationToken);
}

internal sealed class TenantAdministratorOrchestrator(
    ITenantAdministratorAdapter adapter) : ITenantAdministratorOrchestrator
{
    public Task<TenantAdministrationPage<TenantAdministratorResponse>> GetPageAsync(
        TenantAdministrationPageRequest request,
        CancellationToken cancellationToken = default) =>
        adapter.GetPageAsync(request, cancellationToken);

    public Task<IReadOnlyList<TenantAdministratorResponse>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        adapter.GetAllAsync(cancellationToken);

    public Task<TenantAdministrationResult<TenantAdministratorResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        adapter.GetAsync(id, cancellationToken);

    public Task<TenantAdministrationResult<TenantAdministratorResponse>> CreateAsync(
        CreateTenantAdministratorRequest request,
        CancellationToken cancellationToken = default) =>
        adapter.CreateAsync(request, cancellationToken);

    public Task<TenantAdministrationResult<TenantAdministratorResponse>> UpdateAsync(
        string id,
        UpdateTenantAdministratorRequest request,
        CancellationToken cancellationToken = default) =>
        adapter.UpdateAsync(id, request, cancellationToken);

    public Task<TenantAdministrationResult> ArchiveAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        adapter.ArchiveAsync(id, cancellationToken);

    public Task<TenantAdministrationResult<TenantAdministratorResponse>> RestoreAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        adapter.RestoreAsync(id, cancellationToken);
}

internal sealed class TenantAdministrationPolicy : ITenantAdministrationPolicy
{
    public string NormalizeIdentifier(string identifier) => identifier.Trim();

    public IReadOnlyList<string> NormalizeTenantIds(IEnumerable<string> tenantIds) =>
        tenantIds.Distinct(StringComparer.Ordinal).ToArray();

    public bool CanSetSeatLimits(
        int maxAdmins,
        int maxUsers,
        int currentAdminCount,
        int currentUserCount) =>
        maxAdmins >= currentAdminCount && maxUsers >= currentUserCount;

    public bool HasAdministratorSeat(int maxAdmins, int currentAdminCount) =>
        currentAdminCount < maxAdmins;
}
