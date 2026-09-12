using ErpSystem.Modules.Platform.Contracts.Tenancy;

namespace ErpSystem.Modules.Platform.Application.Tenancy;

internal sealed class TenantAccessService(
    ITenantAccessSource source,
    TimeProvider timeProvider) : ITenantAccessService
{
    public async Task<TenantAccessResponse?> GetAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var tenant = await source.GetAsync(tenantId, cancellationToken).ConfigureAwait(false);
        if (tenant is null)
            return null;

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var subscriptionEndsOn = tenant.SubscriptionEndsOn.HasValue
            ? DateTime.SpecifyKind(tenant.SubscriptionEndsOn.Value, DateTimeKind.Utc)
            : (DateTime?)null;
        var hasEnded = subscriptionEndsOn.HasValue && subscriptionEndsOn <= now;
        var effectiveStatus = hasEnded
            ? TenantSubscriptionStatus.Expired
            : tenant.SubscriptionStatus;

        return new TenantAccessResponse(
            tenant.TenantName,
            string.IsNullOrWhiteSpace(tenant.PlanName) ? "Free" : tenant.PlanName.Trim(),
            ToContractStatus(effectiveStatus),
            subscriptionEndsOn,
            effectiveStatus == TenantSubscriptionStatus.Expired);
    }

    private static string ToContractStatus(TenantSubscriptionStatus status) =>
        status == TenantSubscriptionStatus.PastDue
            ? "pastDue"
            : status.ToString().ToLowerInvariant();
}
