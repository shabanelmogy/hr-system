namespace HrManagementSystem.Application.Abstractions.Persistence;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<TResult> ExecuteAtomicallyAsync<TResult>(
        IReadOnlyCollection<string> lockResources,
        Func<CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default);
}
