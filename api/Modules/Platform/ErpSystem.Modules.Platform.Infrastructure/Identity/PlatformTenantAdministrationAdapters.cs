using System.Data;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure.Identity;

public sealed class PlatformTenantManagementAdapter(
    PlatformDbContext db,
    PlatformContractSource entitlements,
    IModuleCatalogPolicy moduleCatalog,
    ITenantAdministrationPolicy policy,
    TimeProvider timeProvider) : ITenantManagementAdapter
{
    public async Task<TenantAdministrationPage<TenantManagementResponse>> GetPageAsync(
        TenantAdministrationPageRequest request,
        CancellationToken cancellationToken = default)
    {
        var pageNumber = Math.Max(request.PageNumber, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 200);
        var query = db.Tenants.AsNoTracking();
        if (!request.IncludeArchived)
            query = query.Where(item => item.LifecycleStatus == (int)PlatformTenantLifecycleStatus.Active);

        if (!string.IsNullOrWhiteSpace(request.SearchValue))
        {
            var search = request.SearchValue.Trim();
            query = query.Where(item => item.Name.Contains(search) ||
                                        item.Identifier.Contains(search) ||
                                        (item.BillingEmail != null && item.BillingEmail.Contains(search)));
        }

        query = Order(query, request.ColumnName, request.SortDirection);
        var total = await query.CountAsync(cancellationToken);
        var tenants = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToArrayAsync(cancellationToken);
        var items = await BuildResponsesAsync(tenants, cancellationToken);
        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);
        return new TenantAdministrationPage<TenantManagementResponse>(items,
            new TenantAdministrationPageMetadata(pageNumber, totalPages, pageSize, pageNumber, total,
                pageNumber > 1, pageNumber < totalPages));
    }

    public async Task<IReadOnlyList<TenantManagementResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tenants = await db.Tenants.AsNoTracking()
            .Where(item => item.LifecycleStatus == (int)PlatformTenantLifecycleStatus.Active)
            .OrderBy(item => item.Name).ToArrayAsync(cancellationToken);
        return await BuildResponsesAsync(tenants, cancellationToken);
    }

    public async Task<TenantAdministrationResult<TenantManagementResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        var tenant = await db.Tenants.AsNoTracking().SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (tenant is null)
            return Failure<TenantManagementResponse>("Tenant.NotFound", "Tenant was not found.", TenantAdministrationErrorType.NotFound);
        return TenantAdministrationResult.Success((await BuildResponsesAsync([tenant], cancellationToken))[0]);
    }

    public async Task<TenantAdministrationResult<TenantManagementResponse>> CreateAsync(
        TenantManagementRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!TryValidate(request, out var identifier, out var status, out var error))
            return TenantAdministrationResult.Failure<TenantManagementResponse>(error!);

        var requestedEntitlements = request.Entitlements ?? moduleCatalog.GetDefaultEntitlements();
        if (!moduleCatalog.IsValidEntitlement(requestedEntitlements, out var invalidCode))
            return Failure<TenantManagementResponse>("Tenant.InvalidEntitlement",
                $"Module or submodule '{invalidCode}' is not assignable to a tenant.", TenantAdministrationErrorType.Validation);

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        if (await db.Tenants.AnyAsync(item => item.Identifier == identifier, cancellationToken))
            return Failure<TenantManagementResponse>("Tenant.DuplicateIdentifier", "Tenant identifier already exists.", TenantAdministrationErrorType.Conflict);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var tenant = new PlatformTenant(Guid.NewGuid().ToString("N"), identifier, request.Name, now);
        tenant.Update(identifier, request.Name, request.IsActive, (int)status, request.SubscriptionStartedOn,
            request.SubscriptionEndsOn, request.PlanName, request.MaxAdmins, request.MaxUsers, request.BillingEmail,
            request.ContactName, request.ContactPhone, request.Notes, now);
        db.Tenants.Add(tenant);
        db.Companies.Add(new PlatformCompany(tenant.Id, "DEFAULT", tenant.Name, tenant.Name,
            "EGP", "Africa/Cairo", now));

        try
        {
            await entitlements.ApplyAsync(tenant.Id, requestedEntitlements, cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Failure<TenantManagementResponse>("Tenant.DuplicateIdentifier", "Tenant identifier already exists.", TenantAdministrationErrorType.Conflict);
        }

        return TenantAdministrationResult.Success((await BuildResponsesAsync([tenant], cancellationToken))[0]);
    }

    public async Task<TenantAdministrationResult<TenantManagementResponse>> UpdateAsync(
        string id,
        TenantManagementRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenant = await db.Tenants.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (tenant is null)
            return Failure<TenantManagementResponse>("Tenant.NotFound", "Tenant was not found.", TenantAdministrationErrorType.NotFound);
        if (tenant.LifecycleStatus != (int)PlatformTenantLifecycleStatus.Active)
            return Failure<TenantManagementResponse>("Tenant.ArchivedTenantRequiresRestore", "Restore the tenant before editing it.", TenantAdministrationErrorType.Conflict);
        if (!ApplyRowVersion(tenant, request.RowVersion))
            return ConcurrencyTokenFailure<TenantManagementResponse>();
        if (!TryValidate(request, out var identifier, out var status, out var error))
            return TenantAdministrationResult.Failure<TenantManagementResponse>(error!);
        if (await db.Tenants.AnyAsync(item => item.Identifier == identifier && item.Id != id, cancellationToken))
            return Failure<TenantManagementResponse>("Tenant.DuplicateIdentifier", "Tenant identifier already exists.", TenantAdministrationErrorType.Conflict);
        if (request.Entitlements is not null && !moduleCatalog.IsValidEntitlement(request.Entitlements, out var invalidCode))
            return Failure<TenantManagementResponse>("Tenant.InvalidEntitlement", $"Module or submodule '{invalidCode}' is not assignable to a tenant.", TenantAdministrationErrorType.Validation);

        var counts = await GetSeatCountsAsync(id, cancellationToken);
        if (!policy.CanSetSeatLimits(request.MaxAdmins, request.MaxUsers, counts.AdminCount, counts.UserCount))
            return Failure<TenantManagementResponse>("Tenant.SeatLimitBelowUsage",
                "Admin and user limits cannot be lower than current usage.", TenantAdministrationErrorType.Validation);

        tenant.Update(identifier, request.Name, request.IsActive, (int)status, request.SubscriptionStartedOn,
            request.SubscriptionEndsOn, request.PlanName, request.MaxAdmins, request.MaxUsers, request.BillingEmail,
            request.ContactName, request.ContactPhone, request.Notes, timeProvider.GetUtcNow().UtcDateTime);

        try
        {
            if (request.Entitlements is null)
                await db.SaveChangesAsync(cancellationToken);
            else
                await entitlements.ApplyAsync(id, request.Entitlements, cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return ConcurrencyFailure<TenantManagementResponse>();
        }

        return TenantAdministrationResult.Success((await BuildResponsesAsync([tenant], cancellationToken))[0]);
    }

    public async Task<TenantAdministrationResult<TenantManagementResponse>> ArchiveAsync(
        string id,
        ArchiveTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenant = await db.Tenants.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (tenant is null)
            return Failure<TenantManagementResponse>("Tenant.NotFound", "Tenant was not found.", TenantAdministrationErrorType.NotFound);
        if (!ApplyRowVersion(tenant, request.RowVersion))
            return ConcurrencyTokenFailure<TenantManagementResponse>();
        if (tenant.LifecycleStatus != (int)PlatformTenantLifecycleStatus.Active)
            return Failure<TenantManagementResponse>("Tenant.LifecycleConflict", "Only an active tenant can be archived.", TenantAdministrationErrorType.Conflict);
        if (string.IsNullOrWhiteSpace(request.Reason))
            return Failure<TenantManagementResponse>("Tenant.ArchiveReasonRequired", "An archive reason is required.", TenantAdministrationErrorType.Validation);

        tenant.Archive(request.Reason, timeProvider.GetUtcNow().UtcDateTime, request.PurgeScheduledOn);
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException) { return ConcurrencyFailure<TenantManagementResponse>(); }
        return TenantAdministrationResult.Success((await BuildResponsesAsync([tenant], cancellationToken))[0]);
    }

    public async Task<TenantAdministrationResult<TenantManagementResponse>> RestoreAsync(
        string id,
        RestoreTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenant = await db.Tenants.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (tenant is null)
            return Failure<TenantManagementResponse>("Tenant.NotFound", "Tenant was not found.", TenantAdministrationErrorType.NotFound);
        if (!ApplyRowVersion(tenant, request.RowVersion))
            return ConcurrencyTokenFailure<TenantManagementResponse>();
        if (tenant.LifecycleStatus == (int)PlatformTenantLifecycleStatus.Active)
            return Failure<TenantManagementResponse>("Tenant.AlreadyActive", "The tenant is already active.", TenantAdministrationErrorType.Conflict);

        tenant.Restore(timeProvider.GetUtcNow().UtcDateTime);
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException) { return ConcurrencyFailure<TenantManagementResponse>(); }
        return TenantAdministrationResult.Success((await BuildResponsesAsync([tenant], cancellationToken))[0]);
    }

    private bool TryValidate(TenantManagementRequest request, out string identifier,
        out TenantSubscriptionStatus status, out TenantAdministrationError? error)
    {
        identifier = policy.NormalizeIdentifier(request.Identifier ?? string.Empty);
        status = default;
        error = null;
        if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(request.Name) ||
            request.MaxAdmins <= 0 || request.MaxUsers <= 0 || request.MaxAdmins > request.MaxUsers)
        {
            error = Error("Tenant.InvalidRequest", "Tenant name, identifier, and valid seat limits are required.", TenantAdministrationErrorType.Validation);
            return false;
        }
        if (!Enum.TryParse(request.SubscriptionStatus, true, out status) || !Enum.IsDefined(status))
        {
            error = Error("Tenant.InvalidSubscriptionStatus", "Subscription status is invalid.", TenantAdministrationErrorType.Validation);
            return false;
        }
        return true;
    }

    private async Task<IReadOnlyList<TenantManagementResponse>> BuildResponsesAsync(
        IReadOnlyCollection<PlatformTenant> tenants,
        CancellationToken cancellationToken)
    {
        if (tenants.Count == 0) return [];
        var ids = tenants.Select(item => item.Id).ToArray();
        var seats = await GetSeatCountsAsync(ids, cancellationToken);
        var memberships = await db.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
            .Where(item => ids.Contains(item.TenantId))
            .GroupBy(item => item.TenantId)
            .Select(group => new { TenantId = group.Key, Count = group.Select(item => item.UserId).Distinct().Count() })
            .ToDictionaryAsync(item => item.TenantId, item => item.Count, cancellationToken);
        var companies = await db.Companies.IgnoreQueryFilters().AsNoTracking().Where(item => ids.Contains(item.TenantId))
            .GroupBy(item => item.TenantId).Select(group => new { TenantId = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.TenantId, item => item.Count, cancellationToken);
        var entitlementRows = await db.TenantModuleEntitlements.IgnoreQueryFilters().AsNoTracking().Where(item => ids.Contains(item.TenantId)).ToArrayAsync(cancellationToken);
        var submoduleRows = await db.TenantSubmoduleEntitlements.IgnoreQueryFilters().AsNoTracking().Where(item => ids.Contains(item.TenantId)).ToArrayAsync(cancellationToken);
        var now = timeProvider.GetUtcNow().UtcDateTime;

        return tenants.Select(tenant =>
        {
            var status = (TenantSubscriptionStatus)tenant.SubscriptionStatus;
            if (tenant.SubscriptionEndsOn.HasValue && tenant.SubscriptionEndsOn.Value < now)
                status = TenantSubscriptionStatus.Expired;
            var count = seats.GetValueOrDefault(tenant.Id, new SeatCounts());
            var tenantEntitlements = entitlementRows.Where(item => item.TenantId == tenant.Id)
                .OrderBy(item => item.ModuleCode)
                .Select(module => new TenantModuleEntitlementResponse(module.ModuleCode,
                    submoduleRows.Where(item => item.TenantId == tenant.Id && item.ModuleCode == module.ModuleCode)
                        .Select(item => item.SubmoduleCode).OrderBy(item => item).ToArray())).ToArray();
            return new TenantManagementResponse(tenant.Id, tenant.Identifier, tenant.Name, tenant.IsActive,
                StatusName(status), tenant.SubscriptionStartedOn, tenant.SubscriptionEndsOn, tenant.PlanName,
                tenant.MaxAdmins, tenant.MaxUsers, count.AdminCount, count.UserCount,
                memberships.GetValueOrDefault(tenant.Id), companies.GetValueOrDefault(tenant.Id), tenant.BillingEmail,
                tenant.ContactName, tenant.ContactPhone, tenant.Notes, tenant.CreatedOn, tenant.UpdatedOn,
                LifecycleName((PlatformTenantLifecycleStatus)tenant.LifecycleStatus), tenant.ArchivedOn,
                tenant.ArchiveReason, tenant.PurgeScheduledOn, Convert.ToBase64String(tenant.RowVersion), tenantEntitlements);
        }).ToArray();
    }

    private async Task<SeatCounts> GetSeatCountsAsync(string tenantId, CancellationToken cancellationToken) =>
        (await GetSeatCountsAsync([tenantId], cancellationToken)).GetValueOrDefault(tenantId, new SeatCounts());

    private async Task<Dictionary<string, SeatCounts>> GetSeatCountsAsync(
        IReadOnlyCollection<string> tenantIds,
        CancellationToken cancellationToken)
    {
        var rows = await (from membership in db.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
                          join user in db.Users.AsNoTracking() on membership.UserId equals user.Id
                          join assignment in db.UserRoles.AsNoTracking() on user.Id equals assignment.UserId
                          join role in db.Roles.AsNoTracking() on assignment.RoleId equals role.Id
                          where tenantIds.Contains(membership.TenantId) &&
                                user.LifecycleStatus == (int)PlatformUserLifecycleStatus.Active &&
                                role.IsSystem && (role.NormalizedName == PlatformRoleNames.Admin.ToUpperInvariant() ||
                                                  role.NormalizedName == PlatformRoleNames.User.ToUpperInvariant())
                          group membership by new { membership.TenantId, role.NormalizedName } into grouped
                          select new { grouped.Key.TenantId, grouped.Key.NormalizedName,
                              Count = grouped.Select(item => item.UserId).Distinct().Count() })
            .ToArrayAsync(cancellationToken);
        return rows.GroupBy(item => item.TenantId).ToDictionary(group => group.Key, group => new SeatCounts(
            group.FirstOrDefault(item => item.NormalizedName == PlatformRoleNames.Admin.ToUpperInvariant())?.Count ?? 0,
            group.FirstOrDefault(item => item.NormalizedName == PlatformRoleNames.User.ToUpperInvariant())?.Count ?? 0));
    }

    private bool ApplyRowVersion(PlatformTenant tenant, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        try { db.Entry(tenant).Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(value); return true; }
        catch (FormatException) { return false; }
    }

    private static IQueryable<PlatformTenant> Order(IQueryable<PlatformTenant> query, string? column, string? direction)
    {
        var desc = string.Equals(direction, "DESC", StringComparison.OrdinalIgnoreCase);
        return (column?.ToUpperInvariant(), desc) switch
        {
            ("IDENTIFIER", false) => query.OrderBy(item => item.Identifier).ThenBy(item => item.Id),
            ("IDENTIFIER", true) => query.OrderByDescending(item => item.Identifier).ThenByDescending(item => item.Id),
            ("CREATEDON", false) => query.OrderBy(item => item.CreatedOn).ThenBy(item => item.Id),
            ("CREATEDON", true) => query.OrderByDescending(item => item.CreatedOn).ThenByDescending(item => item.Id),
            ("NAME", true) => query.OrderByDescending(item => item.Name).ThenByDescending(item => item.Id),
            _ => query.OrderBy(item => item.Name).ThenBy(item => item.Id)
        };
    }

    private static string StatusName(TenantSubscriptionStatus status) =>
        status == TenantSubscriptionStatus.PastDue ? "pastDue" : status.ToString().ToLowerInvariant();
    private static string LifecycleName(PlatformTenantLifecycleStatus status) =>
        status == PlatformTenantLifecycleStatus.PurgeScheduled ? "purgeScheduled" : status.ToString().ToLowerInvariant();
    private static TenantAdministrationError Error(string code, string message, TenantAdministrationErrorType type) => new(code, message, type);
    private static TenantAdministrationResult<T> Failure<T>(string code, string message, TenantAdministrationErrorType type) =>
        TenantAdministrationResult.Failure<T>(Error(code, message, type));
    private static TenantAdministrationResult<T> ConcurrencyTokenFailure<T>() =>
        Failure<T>("Tenant.ConcurrencyTokenRequired", "Reload the tenant and try again.", TenantAdministrationErrorType.Conflict);
    private static TenantAdministrationResult<T> ConcurrencyFailure<T>() =>
        Failure<T>("Tenant.ConcurrencyConflict", "The tenant changed in another request. Reload it and try again.", TenantAdministrationErrorType.Conflict);
    private sealed record SeatCounts(int AdminCount = 0, int UserCount = 0);
}

public sealed class PlatformTenantAdministratorAdapter(
    PlatformDbContext db,
    UserManager<PlatformApplicationUser> users,
    RoleManager<PlatformApplicationRole> roles,
    ITenantAdministrationPolicy policy,
    TimeProvider timeProvider) : ITenantAdministratorAdapter
{
    public async Task<TenantAdministrationPage<TenantAdministratorResponse>> GetPageAsync(
        TenantAdministrationPageRequest request, CancellationToken cancellationToken = default)
    {
        var pageNumber = Math.Max(request.PageNumber, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 200);
        var query = AdminUsers(request.IncludeArchived);
        if (!string.IsNullOrWhiteSpace(request.SearchValue))
        {
            var search = request.SearchValue.Trim();
            query = query.Where(item => item.FirstName.Contains(search) || item.LastName.Contains(search) ||
                                        (item.Email != null && item.Email.Contains(search)) ||
                                        (item.UserName != null && item.UserName.Contains(search)));
        }
        query = Order(query, request.ColumnName, request.SortDirection);
        var total = await query.CountAsync(cancellationToken);
        var ids = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).Select(item => item.Id).ToArrayAsync(cancellationToken);
        var items = await BuildResponsesAsync(ids, cancellationToken);
        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);
        return new TenantAdministrationPage<TenantAdministratorResponse>(items,
            new TenantAdministrationPageMetadata(pageNumber, totalPages, pageSize, pageNumber, total,
                pageNumber > 1, pageNumber < totalPages));
    }

    public async Task<IReadOnlyList<TenantAdministratorResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var ids = await AdminUsers(false).OrderBy(item => item.FirstName).ThenBy(item => item.LastName)
            .Select(item => item.Id).ToArrayAsync(cancellationToken);
        return await BuildResponsesAsync(ids, cancellationToken);
    }

    public async Task<TenantAdministrationResult<TenantAdministratorResponse>> GetAsync(string id, CancellationToken cancellationToken = default)
    {
        if (!await AdminUsers(true).AnyAsync(item => item.Id == id, cancellationToken))
            return Failure<TenantAdministratorResponse>("TenantAdmin.NotFound", "Tenant administrator was not found.", TenantAdministrationErrorType.NotFound);
        return TenantAdministrationResult.Success((await BuildResponsesAsync([id], cancellationToken))[0]);
    }

    public async Task<TenantAdministrationResult<TenantAdministratorResponse>> CreateAsync(
        CreateTenantAdministratorRequest request, CancellationToken cancellationToken = default)
    {
        var resolved = await ResolveTenantsAsync(request.TenantIds, request.DefaultTenantId, null, cancellationToken);
        if (resolved.IsFailure) return TenantAdministrationResult.Failure<TenantAdministratorResponse>(resolved.Error);
        if (await users.FindByEmailAsync(request.Email) is not null)
            return Failure<TenantAdministratorResponse>("TenantAdmin.DuplicateEmail", "Email already exists.", TenantAdministrationErrorType.Conflict);
        if (await users.FindByNameAsync(request.UserName) is not null)
            return Failure<TenantAdministratorResponse>("TenantAdmin.DuplicateUserName", "User name already exists.", TenantAdministrationErrorType.Conflict);

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        var user = new PlatformApplicationUser
        {
            Id = Guid.NewGuid().ToString(), FirstName = request.FirstName.Trim(), LastName = request.LastName.Trim(),
            UserName = request.UserName.Trim(), Email = request.Email.Trim(), EmailConfirmed = true,
            LifecycleStatus = (int)PlatformUserLifecycleStatus.Active
        };
        var created = await users.CreateAsync(user, request.Password);
        if (!created.Succeeded) return IdentityFailure<TenantAdministratorResponse>(created);
        var roleResult = await EnsureAdminRoleAsync();
        if (roleResult.IsFailure) return TenantAdministrationResult.Failure<TenantAdministratorResponse>(roleResult.Error);
        var assigned = await users.AddToRoleAsync(user, PlatformRoleNames.Admin);
        if (!assigned.Succeeded) return IdentityFailure<TenantAdministratorResponse>(assigned);
        await AssignAccessAsync(user.Id, resolved.Value, request.DefaultTenantId, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return TenantAdministrationResult.Success((await BuildResponsesAsync([user.Id], cancellationToken))[0]);
    }

    public async Task<TenantAdministrationResult<TenantAdministratorResponse>> UpdateAsync(
        string id, UpdateTenantAdministratorRequest request, CancellationToken cancellationToken = default)
    {
        var user = await users.Users.Include(item => item.RefreshTokens).SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (user is null || !await AdminUsers(true).AnyAsync(item => item.Id == id, cancellationToken))
            return Failure<TenantAdministratorResponse>("TenantAdmin.NotFound", "Tenant administrator was not found.", TenantAdministrationErrorType.NotFound);
        var resolved = await ResolveTenantsAsync(request.TenantIds, request.DefaultTenantId, id, cancellationToken);
        if (resolved.IsFailure) return TenantAdministrationResult.Failure<TenantAdministratorResponse>(resolved.Error);
        if (await users.Users.AnyAsync(item => item.Id != id && item.NormalizedEmail == users.NormalizeEmail(request.Email), cancellationToken))
            return Failure<TenantAdministratorResponse>("TenantAdmin.DuplicateEmail", "Email already exists.", TenantAdministrationErrorType.Conflict);
        if (await users.Users.AnyAsync(item => item.Id != id && item.NormalizedUserName == users.NormalizeName(request.UserName), cancellationToken))
            return Failure<TenantAdministratorResponse>("TenantAdmin.DuplicateUserName", "User name already exists.", TenantAdministrationErrorType.Conflict);

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        user.FirstName = request.FirstName.Trim(); user.LastName = request.LastName.Trim();
        user.UserName = request.UserName.Trim(); user.Email = request.Email.Trim(); user.IsDisabled = request.IsDisabled;
        var updated = await users.UpdateAsync(user);
        if (!updated.Succeeded) return IdentityFailure<TenantAdministratorResponse>(updated);
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var token = await users.GeneratePasswordResetTokenAsync(user);
            var password = await users.ResetPasswordAsync(user, token, request.Password);
            if (!password.Succeeded) return IdentityFailure<TenantAdministratorResponse>(password);
        }
        await RevokeSessionsAsync(user, "Tenant administrator access changed");
        await db.UserCompanyAccesses.IgnoreQueryFilters().Where(item => item.UserId == id).ExecuteDeleteAsync(cancellationToken);
        await db.UserTenantAccesses.IgnoreQueryFilters().Where(item => item.UserId == id).ExecuteDeleteAsync(cancellationToken);
        db.ChangeTracker.Clear();
        await AssignAccessAsync(id, resolved.Value, request.DefaultTenantId, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return TenantAdministrationResult.Success((await BuildResponsesAsync([id], cancellationToken))[0]);
    }

    public async Task<TenantAdministrationResult> ArchiveAsync(string id, CancellationToken cancellationToken = default)
    {
        var user = await users.Users.Include(item => item.RefreshTokens).SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (user is null || !await AdminUsers(false).AnyAsync(item => item.Id == id, cancellationToken))
            return TenantAdministrationResult.Failure(new TenantAdministrationError("TenantAdmin.NotFound", "Tenant administrator was not found.", TenantAdministrationErrorType.NotFound));
        var now = timeProvider.GetUtcNow().UtcDateTime;
        user.IsDisabled = true; user.LifecycleStatus = (int)PlatformUserLifecycleStatus.Archived;
        user.ArchivedOn = now; user.ArchiveReason = "Archived by a platform administrator";
        await RevokeSessionsAsync(user, "Tenant administrator archived");
        return TenantAdministrationResult.Success();
    }

    public async Task<TenantAdministrationResult<TenantAdministratorResponse>> RestoreAsync(string id, CancellationToken cancellationToken = default)
    {
        var user = await users.Users.Include(item => item.RefreshTokens).SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (user is null || user.LifecycleStatus != (int)PlatformUserLifecycleStatus.Archived ||
            !await AdminUsers(true).AnyAsync(item => item.Id == id, cancellationToken))
            return Failure<TenantAdministratorResponse>("TenantAdmin.NotFound", "Tenant administrator was not found.", TenantAdministrationErrorType.NotFound);
        var tenantIds = await db.UserTenantAccesses.IgnoreQueryFilters().Where(item => item.UserId == id).Select(item => item.TenantId).ToArrayAsync(cancellationToken);
        var defaultTenant = await db.UserTenantAccesses.IgnoreQueryFilters().Where(item => item.UserId == id && item.IsDefault)
            .Select(item => item.TenantId).SingleOrDefaultAsync(cancellationToken);
        var resolved = await ResolveTenantsAsync(tenantIds, defaultTenant ?? string.Empty, id, cancellationToken);
        if (resolved.IsFailure) return TenantAdministrationResult.Failure<TenantAdministratorResponse>(resolved.Error);
        user.IsDisabled = false; user.LifecycleStatus = (int)PlatformUserLifecycleStatus.Active;
        user.ArchivedOn = null; user.ArchiveReason = null;
        var updated = await users.UpdateSecurityStampAsync(user);
        if (!updated.Succeeded) return IdentityFailure<TenantAdministratorResponse>(updated);
        return TenantAdministrationResult.Success((await BuildResponsesAsync([id], cancellationToken))[0]);
    }

    private IQueryable<PlatformApplicationUser> AdminUsers(bool includeArchived)
    {
        var adminIds = from assignment in db.UserRoles.AsNoTracking()
                       join role in db.Roles.AsNoTracking() on assignment.RoleId equals role.Id
                       where role.IsSystem && role.NormalizedName == PlatformRoleNames.Admin.ToUpperInvariant()
                       select assignment.UserId;
        var superAdminIds = from assignment in db.UserRoles.AsNoTracking()
                            join role in db.Roles.AsNoTracking() on assignment.RoleId equals role.Id
                            where role.IsSystem && role.NormalizedName == PlatformRoleNames.SuperAdmin.ToUpperInvariant()
                            select assignment.UserId;
        return users.Users.Where(item => adminIds.Contains(item.Id) && !superAdminIds.Contains(item.Id) &&
            (includeArchived || item.LifecycleStatus == (int)PlatformUserLifecycleStatus.Active));
    }

    private async Task<TenantAdministrationResult<IReadOnlyList<PlatformTenant>>> ResolveTenantsAsync(
        IReadOnlyCollection<string> rawTenantIds, string defaultTenantId, string? excludedUserId,
        CancellationToken cancellationToken)
    {
        var tenantIds = policy.NormalizeTenantIds(rawTenantIds.Where(item => !string.IsNullOrWhiteSpace(item)).Select(item => item.Trim()));
        if (tenantIds.Count == 0 || !tenantIds.Contains(defaultTenantId, StringComparer.Ordinal))
            return Failure<IReadOnlyList<PlatformTenant>>("TenantAdmin.InvalidTenants", "One or more selected tenants are invalid.", TenantAdministrationErrorType.Validation);
        var tenants = await db.Tenants.AsNoTracking().Where(item => tenantIds.Contains(item.Id) && item.IsActive &&
            item.LifecycleStatus == (int)PlatformTenantLifecycleStatus.Active).ToArrayAsync(cancellationToken);
        if (tenants.Length != tenantIds.Count)
            return Failure<IReadOnlyList<PlatformTenant>>("TenantAdmin.InvalidTenants", "One or more selected tenants are invalid.", TenantAdministrationErrorType.Validation);
        var counts = await (from membership in db.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
                            join user in db.Users.AsNoTracking() on membership.UserId equals user.Id
                            join assignment in db.UserRoles.AsNoTracking() on user.Id equals assignment.UserId
                            join role in db.Roles.AsNoTracking() on assignment.RoleId equals role.Id
                            where tenantIds.Contains(membership.TenantId) && membership.UserId != excludedUserId &&
                                  user.LifecycleStatus == (int)PlatformUserLifecycleStatus.Active && role.IsSystem &&
                                  role.NormalizedName == PlatformRoleNames.Admin.ToUpperInvariant()
                            group membership by membership.TenantId into grouped
                            select new { TenantId = grouped.Key, Count = grouped.Select(item => item.UserId).Distinct().Count() })
            .ToDictionaryAsync(item => item.TenantId, item => item.Count, cancellationToken);
        if (tenants.Any(item => !policy.HasAdministratorSeat(item.MaxAdmins, counts.GetValueOrDefault(item.Id))))
            return Failure<IReadOnlyList<PlatformTenant>>("TenantAdmin.AdminSeatLimitReached", "A selected tenant reached its administrator limit.", TenantAdministrationErrorType.Validation);
        return TenantAdministrationResult.Success<IReadOnlyList<PlatformTenant>>(tenants);
    }

    private async Task AssignAccessAsync(string userId, IReadOnlyCollection<PlatformTenant> tenants,
        string defaultTenantId, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        foreach (var tenant in tenants.OrderBy(item => item.Id))
        {
            var companies = await db.Companies.IgnoreQueryFilters().Where(item => item.TenantId == tenant.Id && item.IsActive)
                .OrderBy(item => item.Id).ToArrayAsync(cancellationToken);
            if (companies.Length == 0)
            {
                var company = new PlatformCompany(tenant.Id, "DEFAULT", tenant.Name, tenant.Name, "EGP", "Africa/Cairo", now);
                db.Companies.Add(company);
                await db.SaveChangesAsync(cancellationToken);
                companies = [company];
            }
            db.UserTenantAccesses.Add(new PlatformUserTenantAccess
            {
                UserId = userId, TenantId = tenant.Id,
                IsDefault = string.Equals(tenant.Id, defaultTenantId, StringComparison.Ordinal), CreatedOn = now
            });
            for (var index = 0; index < companies.Length; index++)
                db.UserCompanyAccesses.Add(new PlatformUserCompanyAccess
                {
                    UserId = userId, TenantId = tenant.Id, CompanyId = companies[index].Id,
                    IsDefault = index == 0, CreatedOn = now
                });
        }
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task<IReadOnlyList<TenantAdministratorResponse>> BuildResponsesAsync(
        IReadOnlyCollection<string> ids, CancellationToken cancellationToken)
    {
        if (ids.Count == 0) return [];
        var userRows = await db.Users.AsNoTracking().Where(item => ids.Contains(item.Id)).OrderBy(item => item.FirstName)
            .ThenBy(item => item.LastName).ToArrayAsync(cancellationToken);
        var memberships = await (from access in db.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
                                 join tenant in db.Tenants.AsNoTracking() on access.TenantId equals tenant.Id
                                 where ids.Contains(access.UserId)
                                 select new { access.UserId, access.TenantId, access.IsDefault, tenant.Identifier, tenant.Name })
            .ToArrayAsync(cancellationToken);
        var companies = await db.UserCompanyAccesses.IgnoreQueryFilters().AsNoTracking().Where(item => ids.Contains(item.UserId))
            .Select(item => new { item.UserId, item.CompanyId }).ToArrayAsync(cancellationToken);
        var now = timeProvider.GetUtcNow();
        return userRows.Select(user =>
        {
            var assigned = memberships.Where(item => item.UserId == user.Id).OrderByDescending(item => item.IsDefault).ThenBy(item => item.Name).ToArray();
            return new TenantAdministratorResponse(user.Id, user.FirstName, user.LastName, user.UserName ?? string.Empty,
                user.Email ?? string.Empty, user.IsDisabled, user.LockoutEnd.HasValue && user.LockoutEnd > now,
                assigned.FirstOrDefault(item => item.IsDefault)?.TenantId ?? string.Empty,
                assigned.Select(item => new TenantAdministratorTenantResponse(item.TenantId, item.Identifier, item.Name, item.IsDefault)).ToArray(),
                companies.Where(item => item.UserId == user.Id).Select(item => item.CompanyId).Distinct().ToArray(),
                ((PlatformUserLifecycleStatus)user.LifecycleStatus).ToString().ToLowerInvariant(),
                user.ArchivedOn, user.ArchiveReason);
        }).ToArray();
    }

    private async Task<TenantAdministrationResult> EnsureAdminRoleAsync()
    {
        if (await roles.RoleExistsAsync(PlatformRoleNames.Admin)) return TenantAdministrationResult.Success();
        var created = await roles.CreateAsync(new PlatformApplicationRole
        {
            Name = PlatformRoleNames.Admin, NormalizedName = PlatformRoleNames.Admin.ToUpperInvariant(), IsSystem = true
        });
        return created.Succeeded ? TenantAdministrationResult.Success() :
            TenantAdministrationResult.Failure(ToError(created));
    }

    private async Task RevokeSessionsAsync(PlatformApplicationUser user, string reason)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        foreach (var token in user.RefreshTokens.Where(item => item.IsActiveAt(now))) token.Revoke(reason, now);
        var stamp = await users.UpdateSecurityStampAsync(user);
        if (!stamp.Succeeded) throw new InvalidOperationException(stamp.Errors.First().Description);
    }

    private static IQueryable<PlatformApplicationUser> Order(IQueryable<PlatformApplicationUser> query, string? column, string? direction)
    {
        var desc = string.Equals(direction, "DESC", StringComparison.OrdinalIgnoreCase);
        return (column?.ToUpperInvariant(), desc) switch
        {
            ("EMAIL", false) => query.OrderBy(item => item.Email).ThenBy(item => item.Id),
            ("EMAIL", true) => query.OrderByDescending(item => item.Email).ThenByDescending(item => item.Id),
            ("USERNAME", false) => query.OrderBy(item => item.UserName).ThenBy(item => item.Id),
            ("USERNAME", true) => query.OrderByDescending(item => item.UserName).ThenByDescending(item => item.Id),
            ("NAME", true) => query.OrderByDescending(item => item.FirstName).ThenByDescending(item => item.LastName),
            _ => query.OrderBy(item => item.FirstName).ThenBy(item => item.LastName)
        };
    }

    private static TenantAdministrationError ToError(IdentityResult result)
    {
        var error = result.Errors.First();
        return new TenantAdministrationError(error.Code, error.Description, TenantAdministrationErrorType.Validation);
    }
    private static TenantAdministrationResult<T> IdentityFailure<T>(IdentityResult result) => TenantAdministrationResult.Failure<T>(ToError(result));
    private static TenantAdministrationResult<T> Failure<T>(string code, string message, TenantAdministrationErrorType type) =>
        TenantAdministrationResult.Failure<T>(new TenantAdministrationError(code, message, type));
}
