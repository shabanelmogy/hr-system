using HrManagementSystem.Application.Features.Tenancy.Contracts;
using HrManagementSystem.Application.Features.Tenancy.Services;
using HrManagementSystem.Domain.Tenancy.Enums;

namespace HrManagementSystem.Infrastructure.Features.Tenancy.Services;

public sealed class TenantAccessService(
    ApplicationDbContext context,
    TimeProvider timeProvider) : ITenantAccessService
{
    public async Task<TenantAccessResponse?> GetAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var tenant = await context.Tenants
            .AsNoTracking()
            .Where(candidate => candidate.Id == tenantId)
            .Select(candidate => new
            {
                candidate.Name,
                candidate.PlanName,
                candidate.SubscriptionStatus,
                candidate.SubscriptionEndsOn
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (tenant is null)
            return null;

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var subscriptionEndsOn = tenant.SubscriptionEndsOn.HasValue
            ? DateTime.SpecifyKind(tenant.SubscriptionEndsOn.Value, DateTimeKind.Utc)
            : (DateTime?)null;
        var hasEnded = subscriptionEndsOn.HasValue && subscriptionEndsOn <= now;
        var effectiveStatus = hasEnded
            ? SubscriptionStatus.Expired
            : tenant.SubscriptionStatus;
        var isReadOnly = effectiveStatus == SubscriptionStatus.Expired;

        return new TenantAccessResponse(
            tenant.Name,
            string.IsNullOrWhiteSpace(tenant.PlanName) ? "Free" : tenant.PlanName.Trim(),
            ToContractStatus(effectiveStatus),
            subscriptionEndsOn,
            isReadOnly);
    }

    private static string ToContractStatus(SubscriptionStatus status) =>
        status == SubscriptionStatus.PastDue
            ? "pastDue"
            : status.ToString().ToLowerInvariant();
}
