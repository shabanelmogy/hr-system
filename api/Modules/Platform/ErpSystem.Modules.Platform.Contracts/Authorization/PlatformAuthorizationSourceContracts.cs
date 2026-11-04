namespace ErpSystem.Modules.Platform.Contracts.Authorization;

public sealed record PlatformRoleOption(string Id, string Name);
public sealed record PlatformRoleScopeOption(string Id, string Name, string? TenantId, string? TenantName);
public sealed record PlatformRoleScopePage(IReadOnlyList<PlatformRoleScopeOption> Items, int TotalCount);

public interface IPlatformAuthorizationSource
{
    Task<int> GetUserCountAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<string>> GetUserRoleIdsAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<PlatformRoleOption>> GetRolesAsync(IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<PlatformRoleOption>> GetAssignableRolesAsync(string? tenantId, CancellationToken cancellationToken = default);
    Task<bool> AreRoleIdsValidAsync(string? tenantId, IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default);
    Task<PlatformRoleScopePage> GetRoleScopesPageAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PlatformRoleScopeOption>> GetRoleScopesAsync(IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default);
}
