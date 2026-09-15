using ErpSystem.Modules.Platform.Application.TenantMembership;
using ErpSystem.Modules.Platform.Application.Tenancy;

namespace ErpSystem.Modules.Platform.Application.TenantMembership;

internal sealed class TenantMembershipService(ITenantMembershipSource source)
    : ITenantMembershipService
{
    public async Task<IReadOnlyList<TenantMembershipOption>> GetAvailableTenantsAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var memberships = await source.GetAsync(userId, cancellationToken).ConfigureAwait(false);

        return memberships
            .Where(IsEligible)
            .OrderByDescending(membership => membership.IsDefault)
            .ThenBy(membership => membership.Name)
            .Select(ToOption)
            .ToArray();
    }

    public async Task<bool> HasTenantAccessAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var memberships = await source.GetAsync(userId, cancellationToken).ConfigureAwait(false);
        return memberships.Any(membership =>
            string.Equals(membership.TenantId, tenantId, StringComparison.Ordinal) &&
            IsEligible(membership));
    }

    private static bool IsEligible(TenantMembershipSnapshot membership) =>
        membership.IsActive &&
        membership.SubscriptionStatus != TenantSubscriptionStatus.Suspended &&
        membership.SubscriptionStatus != TenantSubscriptionStatus.Cancelled;

    private static TenantMembershipOption ToOption(TenantMembershipSnapshot membership) =>
        new(membership.TenantId, membership.Identifier, membership.Name);
}
