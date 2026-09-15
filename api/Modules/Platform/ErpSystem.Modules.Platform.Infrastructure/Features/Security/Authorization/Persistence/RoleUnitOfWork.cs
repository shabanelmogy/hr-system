using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Persistence;

public sealed class RoleUnitOfWork(PlatformDbContext context) : IRoleUnitOfWork
{
    public Task<TResult> ExecuteAtomicallyAsync<TResult>(
        IReadOnlyCollection<string> lockResources,
        Func<CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default) =>
        context.ExecuteAtomicallyAsync(lockResources, operation, cancellationToken);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);
}
