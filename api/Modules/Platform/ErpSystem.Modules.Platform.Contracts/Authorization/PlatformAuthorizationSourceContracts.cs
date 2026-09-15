namespace ErpSystem.Modules.Platform.Contracts.Authorization;

public sealed record PlatformRoleOption(string Id, string Name);

public interface IPlatformAuthorizationSource
{
    Task<int> GetUserCountAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<string>> GetUserRoleIdsAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<PlatformRoleOption>> GetRolesAsync(IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<PlatformRoleOption>> GetAssignableRolesAsync(string? tenantId, CancellationToken cancellationToken = default);
    Task<bool> AreRoleIdsValidAsync(string? tenantId, IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default);
}
