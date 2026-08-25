using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthenticationSelectionChallengeStore(
    ApplicationDbContext context,
    TimeProvider timeProvider)
{
    public async Task StoreAsync(
        string jwtId,
        string userId,
        string scope,
        DateTime expiresOn,
        string? tenantId,
        CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var expiredChallenges = await context.AuthenticationSelectionChallenges
            .Where(challenge => challenge.ExpiresOn <= now)
            .ToListAsync(cancellationToken);
        context.AuthenticationSelectionChallenges.RemoveRange(expiredChallenges);
        context.AuthenticationSelectionChallenges.Add(
            new AuthenticationSelectionChallenge(jwtId, userId, scope, now, expiresOn, tenantId));
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ConsumeAsync(
        string jwtId,
        string userId,
        string scope,
        string? tenantId,
        CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var challenge = await context.AuthenticationSelectionChallenges
            .SingleOrDefaultAsync(candidate =>
                candidate.JwtId == jwtId &&
                candidate.UserId == userId &&
                candidate.Scope == scope &&
                candidate.TenantId == tenantId &&
                candidate.ExpiresOn > now,
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
