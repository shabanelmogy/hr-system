using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthenticationSelectionChallengeStore(ApplicationDbContext context)
    : ISelectionChallengePersistenceStore
{
    public async Task StoreAsync(
        SelectionChallengePersistenceRecord challenge,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        var expiredChallenges = await context.AuthenticationSelectionChallenges
            .Where(candidate => candidate.ExpiresOn <= utcNow)
            .ToListAsync(cancellationToken);
        context.AuthenticationSelectionChallenges.RemoveRange(expiredChallenges);
        context.AuthenticationSelectionChallenges.Add(
            new AuthenticationSelectionChallenge(
                challenge.JwtId,
                challenge.UserId,
                challenge.Scope,
                challenge.CreatedOn,
                challenge.ExpiresOn,
                challenge.TenantId));
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ConsumeAsync(
        string jwtId,
        string userId,
        string scope,
        string? tenantId,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        var challenge = await context.AuthenticationSelectionChallenges
            .SingleOrDefaultAsync(candidate =>
                candidate.JwtId == jwtId &&
                candidate.UserId == userId &&
                candidate.Scope == scope &&
                candidate.TenantId == tenantId &&
                candidate.ExpiresOn > utcNow,
                cancellationToken);
        if (challenge is null)
            return false;

        context.AuthenticationSelectionChallenges.Remove(challenge);
        try
        {
            await context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;
        }
    }
}
