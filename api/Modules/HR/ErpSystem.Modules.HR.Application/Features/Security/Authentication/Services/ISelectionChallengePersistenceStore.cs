using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;

public interface ISelectionChallengePersistenceStore
{
    Task StoreAsync(
        SelectionChallengePersistenceRecord challenge,
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<bool> ConsumeAsync(
        string jwtId,
        string userId,
        string scope,
        string? tenantId,
        DateTime utcNow,
        CancellationToken cancellationToken = default);
}
