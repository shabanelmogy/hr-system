using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.Tenancy.Contracts;
using HrManagementSystem.Application.Features.Tenancy.Services;
using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Domain.Tenancy.Enums;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Tenancy.Services;

public sealed class TenantManagementService(
    ApplicationDbContext context,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext,
    TimeProvider timeProvider) : ITenantManagementService
{
    public async Task<IReadOnlyList<TenantManagementResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var tenants = await context.Tenants
            .AsNoTracking()
            .OrderBy(tenant => tenant.Name)
            .ToListAsync(cancellationToken);

        return await BuildResponsesAsync(tenants, cancellationToken);
    }

    public async Task<Result<TenantManagementResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        var tenant = await context.Tenants
            .AsNoTracking()
            .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);

        if (tenant is null)
            return Result.Failure<TenantManagementResponse>(NotFound);

        var responses = await BuildResponsesAsync([tenant], cancellationToken);
        return Result.Success(responses[0]);
    }

    public async Task<Result<TenantManagementResponse>> CreateAsync(
        TenantManagementRequest request,
        CancellationToken cancellationToken = default)
    {
        var identifier = request.Identifier.Trim();
        if (await context.Tenants.AnyAsync(
                tenant => tenant.Identifier == identifier,
                cancellationToken))
        {
            return Result.Failure<TenantManagementResponse>(DuplicateIdentifier);
        }

        if (!TryParseStatus(request.SubscriptionStatus, out var status))
            return Result.Failure<TenantManagementResponse>(InvalidStatus);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var tenant = new Tenant(
            Guid.NewGuid().ToString("N"),
            identifier,
            request.Name,
            now);

        tenant.UpdateSubscription(
            request.Name,
            request.IsActive,
            status,
            request.SubscriptionStartedOn,
            request.SubscriptionEndsOn,
            request.PlanName,
            request.MaxAdmins,
            request.MaxUsers,
            request.BillingEmail,
            request.ContactName,
            request.ContactPhone,
            request.Notes,
            now);

        context.Tenants.Add(tenant);
        await context.SaveChangesAsync(cancellationToken);
        await PublishChangeAsync("Create", tenant.Id);

        var responses = await BuildResponsesAsync([tenant], cancellationToken);
        return Result.Success(responses[0]);
    }

    public async Task<Result<TenantManagementResponse>> UpdateAsync(
        string id,
        TenantManagementRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenant = await context.Tenants
            .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (tenant is null)
            return Result.Failure<TenantManagementResponse>(NotFound);

        var identifier = request.Identifier.Trim();
        if (await context.Tenants.AnyAsync(
                candidate => candidate.Identifier == identifier && candidate.Id != id,
                cancellationToken))
        {
            return Result.Failure<TenantManagementResponse>(DuplicateIdentifier);
        }

        if (!TryParseStatus(request.SubscriptionStatus, out var status))
            return Result.Failure<TenantManagementResponse>(InvalidStatus);

        var roleCounts = await GetRoleCountsAsync([id], cancellationToken);
        var counts = roleCounts.GetValueOrDefault(id, new RoleCounts());
        if (request.MaxAdmins < counts.AdminCount || request.MaxUsers < counts.UserCount)
            return Result.Failure<TenantManagementResponse>(SeatLimitBelowUsage);

        tenant.ChangeIdentifier(identifier);
        tenant.UpdateSubscription(
            request.Name,
            request.IsActive,
            status,
            request.SubscriptionStartedOn,
            request.SubscriptionEndsOn,
            request.PlanName,
            request.MaxAdmins,
            request.MaxUsers,
            request.BillingEmail,
            request.ContactName,
            request.ContactPhone,
            request.Notes,
            timeProvider.GetUtcNow().UtcDateTime);

        await context.SaveChangesAsync(cancellationToken);
        await PublishChangeAsync("Update", tenant.Id);

        var responses = await BuildResponsesAsync([tenant], cancellationToken);
        return Result.Success(responses[0]);
    }

    private async Task<IReadOnlyList<TenantManagementResponse>> BuildResponsesAsync(
        IReadOnlyCollection<Tenant> tenants,
        CancellationToken cancellationToken)
    {
        var tenantIds = tenants.Select(tenant => tenant.Id).ToArray();
        var roleCounts = await GetRoleCountsAsync(tenantIds, cancellationToken);
        var totalUserCounts = await context.Users
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(user => tenantIds.Contains(user.TenantId))
            .GroupBy(user => user.TenantId)
            .Select(group => new { TenantId = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.TenantId, item => item.Count, cancellationToken);
        var companyCounts = await context.Companies
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(company => tenantIds.Contains(company.TenantId))
            .GroupBy(company => company.TenantId)
            .Select(group => new { TenantId = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.TenantId, item => item.Count, cancellationToken);
        var now = timeProvider.GetUtcNow().UtcDateTime;

        return tenants.Select(tenant =>
        {
            var counts = roleCounts.GetValueOrDefault(tenant.Id, new RoleCounts());
            var effectiveStatus = tenant.SubscriptionEndsOn.HasValue && tenant.SubscriptionEndsOn < now
                ? SubscriptionStatus.Expired
                : tenant.SubscriptionStatus;

            return new TenantManagementResponse(
                tenant.Id,
                tenant.Identifier,
                tenant.Name,
                tenant.IsActive,
                ToContractStatus(effectiveStatus),
                tenant.SubscriptionStartedOn,
                tenant.SubscriptionEndsOn,
                tenant.PlanName,
                tenant.MaxAdmins,
                tenant.MaxUsers,
                counts.AdminCount,
                counts.UserCount,
                totalUserCounts.GetValueOrDefault(tenant.Id),
                companyCounts.GetValueOrDefault(tenant.Id),
                tenant.BillingEmail,
                tenant.ContactName,
                tenant.ContactPhone,
                tenant.Notes,
                tenant.CreatedOn,
                tenant.UpdatedOn);
        }).ToArray();
    }

    private async Task<Dictionary<string, RoleCounts>> GetRoleCountsAsync(
        IReadOnlyCollection<string> tenantIds,
        CancellationToken cancellationToken)
    {
        var rows = await (
            from user in context.Users.IgnoreQueryFilters().AsNoTracking()
            join userRole in context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
            join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            where tenantIds.Contains(user.TenantId) &&
                  (role.NormalizedName == AppRoles.admin.ToUpper() ||
                   role.NormalizedName == AppRoles.user.ToUpper())
            group user by new { user.TenantId, role.NormalizedName }
            into roleGroup
            select new
            {
                roleGroup.Key.TenantId,
                roleGroup.Key.NormalizedName,
                Count = roleGroup.Select(user => user.Id).Distinct().Count()
            }).ToListAsync(cancellationToken);

        return rows
            .GroupBy(row => row.TenantId)
            .ToDictionary(
                group => group.Key,
                group => new RoleCounts(
                    group.FirstOrDefault(row => row.NormalizedName == AppRoles.admin.ToUpper())?.Count ?? 0,
                    group.FirstOrDefault(row => row.NormalizedName == AppRoles.user.ToUpper())?.Count ?? 0));
    }

    private Task PublishChangeAsync(string action, string tenantId) =>
        hubContext.Clients
            .Group(GeneralHubGroups.ForRole(AppRoles.super_admin))
            .ReceiveEntityChanged(new RealtimeEntityChanged(
                Guid.NewGuid(),
                timeProvider.GetUtcNow().UtcDateTime,
                RealtimeResource.For<Tenant>(),
                action,
                tenantId));

    private static bool TryParseStatus(string value, out SubscriptionStatus status) =>
        Enum.TryParse(value, true, out status) && Enum.IsDefined(status);

    private static string ToContractStatus(SubscriptionStatus status) =>
        status == SubscriptionStatus.PastDue
            ? "pastDue"
            : status.ToString().ToLowerInvariant();

    private sealed record RoleCounts(int AdminCount = 0, int UserCount = 0);

    private static readonly Error NotFound =
        new("Tenant.NotFound", "Tenant was not found.", ErrorType.NotFound);

    private static readonly Error DuplicateIdentifier =
        new("Tenant.DuplicateIdentifier", "Tenant identifier already exists.", ErrorType.Conflict);

    private static readonly Error InvalidStatus =
        new("Tenant.InvalidSubscriptionStatus", "Subscription status is invalid.", ErrorType.Validation);

    private static readonly Error SeatLimitBelowUsage =
        new(
            "Tenant.SeatLimitBelowUsage",
            "Admin and user limits cannot be lower than current usage.",
            ErrorType.Validation);
}
