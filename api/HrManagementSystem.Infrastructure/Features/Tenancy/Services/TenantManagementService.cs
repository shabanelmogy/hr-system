using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Tenancy.Contracts;
using HrManagementSystem.Application.Features.Tenancy.Services;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Domain.Tenancy.Enums;
using HrManagementSystem.Domain.Security.Users.Enums;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using System.Data;

namespace HrManagementSystem.Infrastructure.Features.Tenancy.Services;

public sealed class TenantManagementService(
    ApplicationDbContext context,
    IRealtimeChangeDispatcher realtimeChanges,
    ISecurityAuditService securityAudit,
    TimeProvider timeProvider) : ITenantManagementService
{
    public async Task<PageResponse<TenantManagementResponse>> GetPageAsync(
        TenantManagementQuery request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Tenants.AsNoTracking();
        if (!request.IncludeArchived)
            query = query.Where(tenant => tenant.LifecycleStatus == TenantLifecycleStatus.Active);

        if (!string.IsNullOrWhiteSpace(request.SearchValue))
        {
            var search = request.SearchValue.Trim();
            query = query.Where(tenant =>
                tenant.Name.Contains(search) ||
                tenant.Identifier.Contains(search) ||
                (tenant.BillingEmail != null && tenant.BillingEmail.Contains(search)));
        }

        query = ApplyOrdering(query, request.ColumnName, request.SortDirection);
        var totalCount = await query.CountAsync(cancellationToken);
        var tenants = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToArrayAsync(cancellationToken);
        var items = await BuildResponsesAsync(tenants, cancellationToken);
        var page = new PagedList<TenantManagementResponse>(
            items.ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);

        return new PageResponse<TenantManagementResponse>(page, page.MetaData);
    }

    public async Task<IReadOnlyList<TenantManagementResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var tenants = await context.Tenants
            .AsNoTracking()
            .Where(tenant => tenant.LifecycleStatus == TenantLifecycleStatus.Active)
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
        securityAudit.Add(new SecurityAuditRequest(
            "TenantCreated",
            "Tenant",
            tenant.Id,
            TenantId: tenant.Id,
            Metadata: new Dictionary<string, string?>
            {
                ["Identifier"] = tenant.Identifier,
                ["SubscriptionStatus"] = ToContractStatus(tenant.SubscriptionStatus),
                ["MaxAdmins"] = tenant.MaxAdmins.ToString(CultureInfo.InvariantCulture),
                ["MaxUsers"] = tenant.MaxUsers.ToString(CultureInfo.InvariantCulture)
            }));
        await context.SaveChangesAsync(cancellationToken);
        DispatchChange("Create", tenant.Id);

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

        if (tenant.LifecycleStatus != TenantLifecycleStatus.Active)
            return Result.Failure<TenantManagementResponse>(ArchivedTenantRequiresRestore);

        if (!TryApplyRowVersion(tenant, request.RowVersion))
            return Result.Failure<TenantManagementResponse>(ConcurrencyTokenRequired);

        var identifier = request.Identifier.Trim();
        if (await context.Tenants.AnyAsync(
                candidate => candidate.Identifier == identifier && candidate.Id != id,
                cancellationToken))
        {
            return Result.Failure<TenantManagementResponse>(DuplicateIdentifier);
        }

        if (!TryParseStatus(request.SubscriptionStatus, out var status))
            return Result.Failure<TenantManagementResponse>(InvalidStatus);

        await using var transaction = await context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var roleCounts = await GetRoleCountsAsync([id], cancellationToken);
        var counts = roleCounts.GetValueOrDefault(id, new RoleCounts());
        if (request.MaxAdmins < counts.AdminCount || request.MaxUsers < counts.UserCount)
            return Result.Failure<TenantManagementResponse>(SeatLimitBelowUsage);

        var previousStatus = tenant.SubscriptionStatus;
        var previousIsActive = tenant.IsActive;
        var previousMaxAdmins = tenant.MaxAdmins;
        var previousMaxUsers = tenant.MaxUsers;

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

        securityAudit.Add(new SecurityAuditRequest(
            "TenantUpdated",
            "Tenant",
            tenant.Id,
            TenantId: tenant.Id,
            Metadata: new Dictionary<string, string?>
            {
                ["PreviousSubscriptionStatus"] = ToContractStatus(previousStatus),
                ["SubscriptionStatus"] = ToContractStatus(tenant.SubscriptionStatus),
                ["PreviousIsActive"] = previousIsActive.ToString(CultureInfo.InvariantCulture),
                ["IsActive"] = tenant.IsActive.ToString(CultureInfo.InvariantCulture),
                ["PreviousMaxAdmins"] = previousMaxAdmins.ToString(CultureInfo.InvariantCulture),
                ["MaxAdmins"] = tenant.MaxAdmins.ToString(CultureInfo.InvariantCulture),
                ["PreviousMaxUsers"] = previousMaxUsers.ToString(CultureInfo.InvariantCulture),
                ["MaxUsers"] = tenant.MaxUsers.ToString(CultureInfo.InvariantCulture)
            }));
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result.Failure<TenantManagementResponse>(ConcurrencyConflict);
        }
        await transaction.CommitAsync(cancellationToken);
        DispatchChange("Update", tenant.Id);

        var responses = await BuildResponsesAsync([tenant], cancellationToken);
        return Result.Success(responses[0]);
    }

    public async Task<Result<TenantManagementResponse>> ArchiveAsync(
        string id,
        ArchiveTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenant = await context.Tenants
            .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (tenant is null)
            return Result.Failure<TenantManagementResponse>(NotFound);
        if (!TryApplyRowVersion(tenant, request.RowVersion))
            return Result.Failure<TenantManagementResponse>(ConcurrencyTokenRequired);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (tenant.LifecycleStatus != TenantLifecycleStatus.Active)
            return Result.Failure<TenantManagementResponse>(LifecycleConflict);

        tenant.Archive(request.Reason, now, request.PurgeScheduledOn);
        securityAudit.Add(new SecurityAuditRequest(
            "TenantArchived",
            "Tenant",
            tenant.Id,
            TenantId: tenant.Id,
            Metadata: new Dictionary<string, string?>
            {
                ["Reason"] = request.Reason,
                ["PurgeScheduledOn"] = request.PurgeScheduledOn?.ToString("O", CultureInfo.InvariantCulture)
            }));

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result.Failure<TenantManagementResponse>(ConcurrencyConflict);
        }
        DispatchChange("Archive", tenant.Id);
        var responses = await BuildResponsesAsync([tenant], cancellationToken);
        return Result.Success(responses[0]);
    }

    public async Task<Result<TenantManagementResponse>> RestoreAsync(
        string id,
        RestoreTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenant = await context.Tenants
            .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (tenant is null)
            return Result.Failure<TenantManagementResponse>(NotFound);
        if (!TryApplyRowVersion(tenant, request.RowVersion))
            return Result.Failure<TenantManagementResponse>(ConcurrencyTokenRequired);

        if (tenant.LifecycleStatus == TenantLifecycleStatus.Active)
            return Result.Failure<TenantManagementResponse>(TenantAlreadyActive);

        tenant.Restore(timeProvider.GetUtcNow().UtcDateTime);
        securityAudit.Add(new SecurityAuditRequest(
            "TenantRestored",
            "Tenant",
            tenant.Id,
            TenantId: tenant.Id));

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result.Failure<TenantManagementResponse>(ConcurrencyConflict);
        }
        DispatchChange("Restore", tenant.Id);
        var responses = await BuildResponsesAsync([tenant], cancellationToken);
        return Result.Success(responses[0]);
    }

    private async Task<IReadOnlyList<TenantManagementResponse>> BuildResponsesAsync(
        IReadOnlyCollection<Tenant> tenants,
        CancellationToken cancellationToken)
    {
        var tenantIds = tenants.Select(tenant => tenant.Id).ToArray();
        var roleCounts = await GetRoleCountsAsync(tenantIds, cancellationToken);
        var totalUserCounts = await (
            from access in context.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
            join user in context.Users.IgnoreQueryFilters().AsNoTracking() on access.UserId equals user.Id
            where tenantIds.Contains(access.TenantId) && user.LifecycleStatus == UserLifecycleStatus.Active
            group access by access.TenantId
            into tenantGroup
            select new
            {
                TenantId = tenantGroup.Key,
                Count = tenantGroup.Select(access => access.UserId).Distinct().Count()
            })
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
                tenant.UpdatedOn,
                ToContractLifecycleStatus(tenant.LifecycleStatus),
                tenant.ArchivedOn,
                tenant.ArchiveReason,
                tenant.PurgeScheduledOn,
                Convert.ToBase64String(tenant.RowVersion));
        }).ToArray();
    }

    private async Task<Dictionary<string, RoleCounts>> GetRoleCountsAsync(
        IReadOnlyCollection<string> tenantIds,
        CancellationToken cancellationToken)
    {
        var rows = await (
            from tenantAccess in context.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
            join user in context.Users.IgnoreQueryFilters().AsNoTracking() on tenantAccess.UserId equals user.Id
            join userRole in context.UserRoles.AsNoTracking() on tenantAccess.UserId equals userRole.UserId
            join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            where tenantIds.Contains(tenantAccess.TenantId) &&
                  user.LifecycleStatus == UserLifecycleStatus.Active &&
                  role.IsSystem &&
                  (role.NormalizedName == AppRoles.admin.ToUpper() ||
                   role.NormalizedName == AppRoles.user.ToUpper())
            group tenantAccess by new { tenantAccess.TenantId, role.NormalizedName }
            into roleGroup
            select new
            {
                roleGroup.Key.TenantId,
                roleGroup.Key.NormalizedName,
                Count = roleGroup.Select(access => access.UserId).Distinct().Count()
            }).ToListAsync(cancellationToken);

        return rows
            .GroupBy(row => row.TenantId)
            .ToDictionary(
                group => group.Key,
                group => new RoleCounts(
                    group.FirstOrDefault(row => row.NormalizedName == AppRoles.admin.ToUpper())?.Count ?? 0,
                    group.FirstOrDefault(row => row.NormalizedName == AppRoles.user.ToUpper())?.Count ?? 0));
    }

    private void DispatchChange(string action, string tenantId)
    {
        var eventId = Guid.NewGuid();
        realtimeChanges.Dispatch(RealtimeChangeRequest.For<Tenant>(
            RealtimeAudience.ForRole(AppRoles.super_admin),
            action,
            tenantId,
            eventId));
        realtimeChanges.Dispatch(RealtimeChangeRequest.For<Tenant>(
            RealtimeAudience.ForTenant(tenantId),
            action,
            tenantId,
            eventId));
    }

    private static IQueryable<Tenant> ApplyOrdering(
        IQueryable<Tenant> query,
        string? columnName,
        string? sortDirection)
    {
        var descending = string.Equals(sortDirection, "DESC", StringComparison.OrdinalIgnoreCase);
        return (columnName?.ToUpperInvariant(), descending) switch
        {
            ("IDENTIFIER", false) => query.OrderBy(tenant => tenant.Identifier).ThenBy(tenant => tenant.Id),
            ("IDENTIFIER", true) => query.OrderByDescending(tenant => tenant.Identifier).ThenByDescending(tenant => tenant.Id),
            ("CREATEDON", false) => query.OrderBy(tenant => tenant.CreatedOn).ThenBy(tenant => tenant.Id),
            ("CREATEDON", true) => query.OrderByDescending(tenant => tenant.CreatedOn).ThenByDescending(tenant => tenant.Id),
            ("NAME", true) => query.OrderByDescending(tenant => tenant.Name).ThenByDescending(tenant => tenant.Id),
            _ => query.OrderBy(tenant => tenant.Name).ThenBy(tenant => tenant.Id)
        };
    }

    private static bool TryParseStatus(string value, out SubscriptionStatus status) =>
        Enum.TryParse(value, true, out status) && Enum.IsDefined(status);

    private static string ToContractStatus(SubscriptionStatus status) =>
        status == SubscriptionStatus.PastDue
            ? "pastDue"
            : status.ToString().ToLowerInvariant();

    private static string ToContractLifecycleStatus(TenantLifecycleStatus status) =>
        status == TenantLifecycleStatus.PurgeScheduled
            ? "purgeScheduled"
            : status.ToString().ToLowerInvariant();

    private bool TryApplyRowVersion(Tenant tenant, string? rowVersion)
    {
        if (string.IsNullOrWhiteSpace(rowVersion))
            return false;

        try
        {
            context.Entry(tenant).Property(candidate => candidate.RowVersion).OriginalValue =
                Convert.FromBase64String(rowVersion);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }

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

    private static readonly Error ConcurrencyTokenRequired =
        new(
            "Tenant.ConcurrencyTokenRequired",
            "The tenant row version is missing or invalid. Reload the tenant and try again.",
            ErrorType.Conflict);

    private static readonly Error ConcurrencyConflict =
        new(
            "Tenant.ConcurrencyConflict",
            "The tenant was changed by another request. Reload it and try again.",
            ErrorType.Conflict);

    private static readonly Error LifecycleConflict =
        new(
            "Tenant.LifecycleConflict",
            "Only an active tenant can be archived.",
            ErrorType.Conflict);

    private static readonly Error ArchivedTenantRequiresRestore =
        new(
            "Tenant.ArchivedTenantRequiresRestore",
            "An archived tenant must be restored before it can be edited.",
            ErrorType.Conflict);

    private static readonly Error TenantAlreadyActive =
        new(
            "Tenant.AlreadyActive",
            "The tenant is already active.",
            ErrorType.Conflict);
}
