using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Contracts;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;

public sealed record RoleClaimsSnapshot(
    string Id,
    string Name,
    bool IsDeleted,
    bool IsSystem,
    IReadOnlyCollection<string> Permissions);

public sealed record RoleMutationSnapshot(
    string Id,
    string Name,
    bool IsDeleted,
    bool IsSystem);

public sealed record RoleRenameSnapshot(
    RoleMutationSnapshot Role,
    string? PreviousName);

public sealed record RoleStatusMutationSnapshot(
    RoleMutationSnapshot Role,
    IReadOnlyCollection<string> AffectedUserIds);

public sealed record RoleClaimsMutationSnapshot(
    RoleMutationSnapshot Role,
    IReadOnlyCollection<string> PreviousPermissions,
    IReadOnlyCollection<string> NewPermissions,
    IReadOnlyCollection<string> AffectedUserIds);

public interface IRoleManagementReadStore
{
    Task<IReadOnlyList<RoleResponse>> GetAllAsync(
        string tenantId,
        CancellationToken cancellationToken = default);

    Task<RoleDetailResponse?> GetByIdAsync(
        string tenantId,
        string id,
        CancellationToken cancellationToken = default);

    Task<RoleClaimsSnapshot?> GetClaimsAsync(
        string tenantId,
        string roleId,
        CancellationToken cancellationToken = default);
}

public interface IRoleRepository
{
    string NormalizeName(string roleName);

    Task<Result<RoleMutationSnapshot>> CreateAsync(
        string tenantId,
        string roleName,
        CancellationToken cancellationToken = default);

    Task<Result<RoleRenameSnapshot>> RenameAsync(
        string tenantId,
        string roleId,
        string roleName,
        CancellationToken cancellationToken = default);

    Task<Result<RoleStatusMutationSnapshot>> ToggleStatusAsync(
        string tenantId,
        string roleId,
        string revocationReason,
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<Result<RoleClaimsMutationSnapshot>> ReplaceClaimsAsync(
        string tenantId,
        string roleId,
        IReadOnlyCollection<string> permissions,
        string revocationReason,
        DateTime utcNow,
        CancellationToken cancellationToken = default);
}

public interface IRoleUnitOfWork
{
    Task<TResult> ExecuteAtomicallyAsync<TResult>(
        IReadOnlyCollection<string> lockResources,
        Func<CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IRoleLockResourceFactory
{
    string Create(string tenantId, string discriminator);
}

public interface IRolePostCommitEffects
{
    void PublishRoleChanged(string tenantId, string roleId, string action);

    void PublishRoleClaimsChanged(string tenantId, string roleId);

    void QueueSessionRevocations(
        IReadOnlyCollection<string> userIds,
        string notificationMessage);
}
