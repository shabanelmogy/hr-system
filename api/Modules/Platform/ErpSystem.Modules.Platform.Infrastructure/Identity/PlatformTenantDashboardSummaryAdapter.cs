using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure.Identity;

public sealed class PlatformTenantDashboardSummaryAdapter(
    PlatformDbContext db,
    TimeProvider timeProvider) : ITenantDashboardSummaryAdapter
{
    private const int DashboardListSize = 8;

    public async Task<TenantDashboardSummaryResponse> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var expiringThreshold = now.AddDays(30);
        var activeLifecycle = (int)PlatformTenantLifecycleStatus.Active;

        var tenants = db.Tenants.AsNoTracking()
            .Where(tenant => tenant.LifecycleStatus == activeLifecycle);

        var aggregate = await tenants
            .GroupBy(_ => 1)
            .Select(group => new
            {
                TotalTenants = group.Count(),
                EnabledTenants = group.Count(tenant => tenant.IsActive),
                MaxAdmins = group.Sum(tenant => tenant.MaxAdmins),
                MaxUsers = group.Sum(tenant => tenant.MaxUsers),
                Free = group.Count(tenant =>
                    (!tenant.SubscriptionEndsOn.HasValue || tenant.SubscriptionEndsOn.Value >= now) &&
                    tenant.SubscriptionStatus == (int)TenantSubscriptionStatus.Free),
                Trial = group.Count(tenant =>
                    (!tenant.SubscriptionEndsOn.HasValue || tenant.SubscriptionEndsOn.Value >= now) &&
                    tenant.SubscriptionStatus == (int)TenantSubscriptionStatus.Trial),
                Active = group.Count(tenant =>
                    (!tenant.SubscriptionEndsOn.HasValue || tenant.SubscriptionEndsOn.Value >= now) &&
                    tenant.SubscriptionStatus == (int)TenantSubscriptionStatus.Active),
                PastDue = group.Count(tenant =>
                    (!tenant.SubscriptionEndsOn.HasValue || tenant.SubscriptionEndsOn.Value >= now) &&
                    tenant.SubscriptionStatus == (int)TenantSubscriptionStatus.PastDue),
                Suspended = group.Count(tenant =>
                    (!tenant.SubscriptionEndsOn.HasValue || tenant.SubscriptionEndsOn.Value >= now) &&
                    tenant.SubscriptionStatus == (int)TenantSubscriptionStatus.Suspended),
                Expired = group.Count(tenant =>
                    (tenant.SubscriptionEndsOn.HasValue && tenant.SubscriptionEndsOn.Value < now) ||
                    tenant.SubscriptionStatus == (int)TenantSubscriptionStatus.Expired),
                Cancelled = group.Count(tenant =>
                    (!tenant.SubscriptionEndsOn.HasValue || tenant.SubscriptionEndsOn.Value >= now) &&
                    tenant.SubscriptionStatus == (int)TenantSubscriptionStatus.Cancelled),
                ExpiringWithin30Days = group.Count(tenant =>
                    tenant.SubscriptionEndsOn.HasValue &&
                    tenant.SubscriptionEndsOn.Value >= now &&
                    tenant.SubscriptionEndsOn.Value <= expiringThreshold)
            })
            .SingleOrDefaultAsync(cancellationToken);

        var adminRole = PlatformRoleNames.Admin.ToUpperInvariant();
        var userRole = PlatformRoleNames.User.ToUpperInvariant();
        var seatRows = await (
                from membership in db.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
                join tenant in db.Tenants.AsNoTracking() on membership.TenantId equals tenant.Id
                join user in db.Users.AsNoTracking() on membership.UserId equals user.Id
                join assignment in db.UserRoles.AsNoTracking() on user.Id equals assignment.UserId
                join role in db.Roles.AsNoTracking() on assignment.RoleId equals role.Id
                where tenant.LifecycleStatus == activeLifecycle &&
                      user.LifecycleStatus == (int)PlatformUserLifecycleStatus.Active &&
                      role.IsSystem &&
                      (role.NormalizedName == adminRole || role.NormalizedName == userRole)
                group membership by new { membership.TenantId, role.NormalizedName }
                into grouped
                select new
                {
                    grouped.Key.NormalizedName,
                    Count = grouped.Select(item => item.UserId).Distinct().Count()
                })
            .ToArrayAsync(cancellationToken);

        var companies = await (
                from company in db.Companies.IgnoreQueryFilters().AsNoTracking()
                join tenant in db.Tenants.AsNoTracking() on company.TenantId equals tenant.Id
                where tenant.LifecycleStatus == activeLifecycle
                select company.Id)
            .CountAsync(cancellationToken);

        var recentRows = await tenants
            .OrderByDescending(tenant => tenant.CreatedOn)
            .ThenByDescending(tenant => tenant.Id)
            .Take(DashboardListSize)
            .Select(tenant => new
            {
                tenant.Id,
                tenant.Identifier,
                tenant.Name,
                tenant.SubscriptionStatus,
                tenant.SubscriptionEndsOn
            })
            .ToArrayAsync(cancellationToken);

        var expiringRows = await tenants
            .Where(tenant =>
                tenant.SubscriptionEndsOn.HasValue &&
                tenant.SubscriptionEndsOn.Value >= now &&
                tenant.SubscriptionEndsOn.Value <= expiringThreshold)
            .OrderBy(tenant => tenant.SubscriptionEndsOn)
            .ThenBy(tenant => tenant.Id)
            .Take(DashboardListSize)
            .Select(tenant => new
            {
                tenant.Id,
                tenant.Name,
                tenant.PlanName,
                SubscriptionEndsOn = tenant.SubscriptionEndsOn!.Value
            })
            .ToArrayAsync(cancellationToken);

        var statusCounts = aggregate is null
            ? new TenantDashboardSubscriptionStatusCounts(0, 0, 0, 0, 0, 0, 0)
            : new TenantDashboardSubscriptionStatusCounts(
                aggregate.Free,
                aggregate.Trial,
                aggregate.Active,
                aggregate.PastDue,
                aggregate.Suspended,
                aggregate.Expired,
                aggregate.Cancelled);

        return new TenantDashboardSummaryResponse(
            aggregate?.TotalTenants ?? 0,
            aggregate?.EnabledTenants ?? 0,
            seatRows.Where(row => row.NormalizedName == adminRole).Sum(row => row.Count),
            seatRows.Where(row => row.NormalizedName == userRole).Sum(row => row.Count),
            companies,
            aggregate?.MaxAdmins ?? 0,
            aggregate?.MaxUsers ?? 0,
            aggregate?.ExpiringWithin30Days ?? 0,
            statusCounts,
            recentRows.Select(row => new TenantDashboardRecentTenantResponse(
                row.Id,
                row.Identifier,
                row.Name,
                StatusName(EffectiveStatus(row.SubscriptionStatus, row.SubscriptionEndsOn, now)))).ToArray(),
            expiringRows.Select(row => new TenantDashboardExpiringTenantResponse(
                row.Id,
                row.Name,
                row.PlanName,
                row.SubscriptionEndsOn)).ToArray());
    }

    private static TenantSubscriptionStatus EffectiveStatus(
        int subscriptionStatus,
        DateTime? subscriptionEndsOn,
        DateTime now) =>
        subscriptionEndsOn.HasValue && subscriptionEndsOn.Value < now
            ? TenantSubscriptionStatus.Expired
            : (TenantSubscriptionStatus)subscriptionStatus;

    private static string StatusName(TenantSubscriptionStatus status) =>
        status == TenantSubscriptionStatus.PastDue
            ? "pastDue"
            : status.ToString().ToLowerInvariant();
}
