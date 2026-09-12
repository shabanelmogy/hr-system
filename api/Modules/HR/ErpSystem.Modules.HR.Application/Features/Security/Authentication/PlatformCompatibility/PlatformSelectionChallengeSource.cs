using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.Platform.Contracts.Authentication.SelectionChallenges;

namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.PlatformCompatibility;

/// <summary>
/// Anti-corruption adapter from Platform-owned selection-challenge policy to
/// the existing HR-owned persistence table.
/// </summary>
public sealed class PlatformSelectionChallengeSource(ISelectionChallengePersistenceStore store)
    : ISelectionChallengeSource
{
    public Task StoreAsync(
        SelectionChallengeSnapshot challenge,
        DateTime utcNow,
        CancellationToken cancellationToken = default) =>
        store.StoreAsync(
            new SelectionChallengePersistenceRecord(
                challenge.JwtId,
                challenge.UserId,
                challenge.Scope,
                challenge.TenantId,
                challenge.CreatedOn,
                challenge.ExpiresOn),
            utcNow,
            cancellationToken);

    public Task<bool> ConsumeAsync(
        SelectionChallengeConsumeRequest request,
        DateTime utcNow,
        CancellationToken cancellationToken = default) =>
        store.ConsumeAsync(
            request.JwtId,
            request.UserId,
            request.Scope,
            request.TenantId,
            utcNow,
            cancellationToken);
}
