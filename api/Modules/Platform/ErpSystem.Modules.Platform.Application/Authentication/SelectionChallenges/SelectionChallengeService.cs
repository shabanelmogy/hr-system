using ErpSystem.Modules.Platform.Contracts.Authentication.SelectionChallenges;

namespace ErpSystem.Modules.Platform.Application.Authentication.SelectionChallenges;

internal sealed class SelectionChallengeService(
    ISelectionChallengeSource source,
    TimeProvider timeProvider) : ISelectionChallengeService
{
    public Task StoreAsync(
        SelectionChallengeRegistrationRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        return source.StoreAsync(
            new SelectionChallengeSnapshot(
                request.JwtId,
                request.UserId,
                request.Scope,
                request.TenantId,
                now,
                request.ExpiresOn),
            now,
            cancellationToken);
    }

    public Task<bool> ConsumeAsync(
        SelectionChallengeConsumeRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        return source.ConsumeAsync(
            request,
            timeProvider.GetUtcNow().UtcDateTime,
            cancellationToken);
    }
}
