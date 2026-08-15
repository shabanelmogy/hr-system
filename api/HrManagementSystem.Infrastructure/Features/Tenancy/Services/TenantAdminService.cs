using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Tenancy.Contracts;
using HrManagementSystem.Application.Features.Tenancy.Services;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Domain.Security.Users.Enums;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using System.Data;

namespace HrManagementSystem.Infrastructure.Features.Tenancy.Services;

public sealed class TenantAdminService(
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext context,
    ICurrentActor currentActor,
    ICurrentActorScope currentActorScope,
    IRealtimeChangeDispatcher realtimeChanges,
    ISecurityAuditService securityAudit,
    TimeProvider timeProvider) : ITenantAdminService
{
    public async Task<PageResponse<TenantAdminResponse>> GetPageAsync(
        TenantAdminQuery request,
        CancellationToken cancellationToken = default)
    {
        var adminIds = GetAdminUserIdsQuery(request.IncludeArchived);
        var query = context.Users
            .AsNoTracking()
            .Where(user => adminIds.Contains(user.Id));

        if (!string.IsNullOrWhiteSpace(request.SearchValue))
        {
            var search = request.SearchValue.Trim();
            query = query.Where(user =>
                user.FirstName.Contains(search) ||
                user.LastName.Contains(search) ||
                (user.UserName != null && user.UserName.Contains(search)) ||
                (user.Email != null && user.Email.Contains(search)));
        }

        query = ApplyOrdering(query, request.ColumnName, request.SortDirection);
        var totalCount = await query.CountAsync(cancellationToken);
        var userIds = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(user => user.Id)
            .ToArrayAsync(cancellationToken);
        var responseRows = await BuildResponsesAsync(userIds, cancellationToken);
        var responsesById = responseRows.ToDictionary(item => item.Id, StringComparer.Ordinal);
        var items = userIds
            .Where(responsesById.ContainsKey)
            .Select(id => responsesById[id])
            .ToArray();
        var page = new PagedList<TenantAdminResponse>(
            items.ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);

        return new PageResponse<TenantAdminResponse>(page, page.MetaData);
    }

    public async Task<IReadOnlyList<TenantAdminResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var userIds = await GetAdminUserIdsQuery()
            .OrderBy(id => id)
            .ToArrayAsync(cancellationToken);

        return await BuildResponsesAsync(userIds, cancellationToken);
    }

    public async Task<Result<TenantAdminResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        if (!await GetAdminUserIdsQuery().AnyAsync(userId => userId == id, cancellationToken))
            return Result.Failure<TenantAdminResponse>(NotFound);

        var responses = await BuildResponsesAsync([id], cancellationToken);
        return Result.Success(responses[0]);
    }

    public async Task<Result<TenantAdminResponse>> CreateAsync(
        CreateTenantAdminRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantIds = request.TenantIds.Distinct(StringComparer.Ordinal).ToArray();
        await using var transaction = await context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var tenantsResult = await ResolveTenantsAsync(
            tenantIds,
            request.DefaultTenantId,
            excludedUserId: null,
            cancellationToken);
        if (tenantsResult.IsFailure)
            return Result.Failure<TenantAdminResponse>(tenantsResult.Error);

        if (await userManager.Users.AnyAsync(
                user => user.NormalizedEmail == userManager.NormalizeEmail(request.Email),
                cancellationToken))
        {
            return Result.Failure<TenantAdminResponse>(DuplicateEmail);
        }

        if (await userManager.Users.AnyAsync(
                user => user.NormalizedUserName == userManager.NormalizeName(request.UserName),
                cancellationToken))
        {
            return Result.Failure<TenantAdminResponse>(DuplicateUserName);
        }

        var actorUserId = currentActor.UserId;
        if (string.IsNullOrWhiteSpace(actorUserId))
            return Result.Failure<TenantAdminResponse>(InvalidActor);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = request.DefaultTenantId,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            UserName = request.UserName.Trim(),
            Email = request.Email.Trim(),
            EmailConfirmed = true
        };

        using (currentActorScope.BeginScope(actorUserId, request.DefaultTenantId))
        {
            var createResult = await userManager.CreateAsync(user, request.Password);
            if (!createResult.Succeeded)
                return IdentityFailure<TenantAdminResponse>(createResult);

            var roleResult = await userManager.AddToRoleAsync(user, AppRoles.admin);
            if (!roleResult.Succeeded)
                return IdentityFailure<TenantAdminResponse>(roleResult);
        }

        await AssignTenantAccessesAsync(
            user.Id,
            tenantsResult.Value,
            request.DefaultTenantId,
            actorUserId,
            cancellationToken);

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "TenantAdministratorCreated",
            "ApplicationUser",
            user.Id,
            TenantId: request.DefaultTenantId,
            Metadata: new Dictionary<string, string?>
            {
                ["UserName"] = user.UserName,
                ["DefaultTenantId"] = request.DefaultTenantId,
                ["AssignedTenantIds"] = string.Join(',', tenantIds.OrderBy(id => id, StringComparer.Ordinal))
            }), cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        context.ChangeTracker.Clear();
        DispatchChange("Create", user.Id);

        var responses = await BuildResponsesAsync([user.Id], cancellationToken);
        return Result.Success(responses[0]);
    }

    public async Task<Result<TenantAdminResponse>> UpdateAsync(
        string id,
        UpdateTenantAdminRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (user is null ||
            !await GetAdminUserIdsQuery().AnyAsync(userId => userId == id, cancellationToken))
            return Result.Failure<TenantAdminResponse>(NotFound);

        var tenantIds = request.TenantIds.Distinct(StringComparer.Ordinal).ToArray();
        await using var transaction = await context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var tenantsResult = await ResolveTenantsAsync(
            tenantIds,
            request.DefaultTenantId,
            id,
            cancellationToken);
        if (tenantsResult.IsFailure)
            return Result.Failure<TenantAdminResponse>(tenantsResult.Error);

        if (await userManager.Users.AnyAsync(
                candidate => candidate.Id != id &&
                    candidate.NormalizedEmail == userManager.NormalizeEmail(request.Email),
                cancellationToken))
        {
            return Result.Failure<TenantAdminResponse>(DuplicateEmail);
        }

        if (await userManager.Users.AnyAsync(
                candidate => candidate.Id != id &&
                    candidate.NormalizedUserName == userManager.NormalizeName(request.UserName),
                cancellationToken))
        {
            return Result.Failure<TenantAdminResponse>(DuplicateUserName);
        }

        var actorUserId = currentActor.UserId;
        if (string.IsNullOrWhiteSpace(actorUserId))
            return Result.Failure<TenantAdminResponse>(InvalidActor);

        var previousDefaultTenantId = user.TenantId;
        using (currentActorScope.BeginScope(actorUserId, previousDefaultTenantId))
        {
            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            user.UserName = request.UserName.Trim();
            user.Email = request.Email.Trim();
            if (request.IsDisabled)
                user.Disable();
            else
                user.Enable();

            var updateResult = await userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return IdentityFailure<TenantAdminResponse>(updateResult);

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
                var passwordResult = await userManager.ResetPasswordAsync(user, resetToken, request.Password);
                if (!passwordResult.Succeeded)
                    return IdentityFailure<TenantAdminResponse>(passwordResult);
            }

            var stampResult = await userManager.UpdateSecurityStampAsync(user);
            if (!stampResult.Succeeded)
                return IdentityFailure<TenantAdminResponse>(stampResult);

            RevokeActiveSessions(user, "Tenant administrator access changed");
            var revokeResult = await userManager.UpdateAsync(user);
            if (!revokeResult.Succeeded)
                return IdentityFailure<TenantAdminResponse>(revokeResult);
        }

        await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .Where(access => access.UserId == id)
            .ExecuteDeleteAsync(cancellationToken);
        await context.UserTenantAccesses
            .IgnoreQueryFilters()
            .Where(access => access.UserId == id)
            .ExecuteDeleteAsync(cancellationToken);

        context.ChangeTracker.Clear();
        await AssignTenantAccessesAsync(
            id,
            tenantsResult.Value,
            request.DefaultTenantId,
            actorUserId,
            cancellationToken);

        if (!string.Equals(previousDefaultTenantId, request.DefaultTenantId, StringComparison.Ordinal))
        {
            await context.Users
                .Where(candidate => candidate.Id == id)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(candidate => candidate.TenantId, request.DefaultTenantId),
                    cancellationToken);
        }

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "TenantAdministratorUpdated",
            "ApplicationUser",
            user.Id,
            TenantId: request.DefaultTenantId,
            Metadata: new Dictionary<string, string?>
            {
                ["UserName"] = user.UserName,
                ["PreviousDefaultTenantId"] = previousDefaultTenantId,
                ["DefaultTenantId"] = request.DefaultTenantId,
                ["AssignedTenantIds"] = string.Join(',', tenantIds.OrderBy(tenantId => tenantId, StringComparer.Ordinal)),
                ["IsDisabled"] = request.IsDisabled.ToString(CultureInfo.InvariantCulture)
            }), cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        context.ChangeTracker.Clear();
        DispatchChange("Update", user.Id);

        var responses = await BuildResponsesAsync([id], cancellationToken);
        return Result.Success(responses[0]);
    }

    public async Task<Result> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (user is null ||
            !await GetAdminUserIdsQuery().AnyAsync(userId => userId == id, cancellationToken))
            return Result.Failure(NotFound);

        var assignedTenantIds = await context.UserTenantAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.UserId == id)
            .Select(access => access.TenantId)
            .ToArrayAsync(cancellationToken);

        var actorUserId = currentActor.UserId;
        if (string.IsNullOrWhiteSpace(actorUserId))
            return Result.Failure(InvalidActor);

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        user.Archive("Archived by a platform administrator", timeProvider.GetUtcNow().UtcDateTime);
        RevokeActiveSessions(user, "Tenant administrator archived");

        using (currentActorScope.BeginScope(actorUserId, user.TenantId))
        {
            var stampResult = await userManager.UpdateSecurityStampAsync(user);
            if (!stampResult.Succeeded)
                return IdentityFailure(stampResult);

            var archiveResult = await userManager.UpdateAsync(user);
            if (!archiveResult.Succeeded)
                return IdentityFailure(archiveResult);
        }

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "TenantAdministratorArchived",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId,
            Metadata: new Dictionary<string, string?>
            {
                ["AssignedTenantIds"] = string.Join(',', assignedTenantIds.OrderBy(tenantId => tenantId, StringComparer.Ordinal))
            }), cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        DispatchChange("Archive", user.Id);
        return Result.Success();
    }

    public async Task<Result<TenantAdminResponse>> RestoreAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (user is null ||
            !await GetAdminUserIdsQuery(includeArchived: true)
                .AnyAsync(userId => userId == id, cancellationToken) ||
            user.LifecycleStatus != UserLifecycleStatus.Archived)
        {
            return Result.Failure<TenantAdminResponse>(NotFound);
        }

        var actorUserId = currentActor.UserId;
        if (string.IsNullOrWhiteSpace(actorUserId))
            return Result.Failure<TenantAdminResponse>(InvalidActor);

        await using var transaction = await context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var tenantIds = await context.UserTenantAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.UserId == id)
            .Select(access => access.TenantId)
            .ToArrayAsync(cancellationToken);
        var tenantsResult = await ResolveTenantsAsync(
            tenantIds,
            user.TenantId,
            excludedUserId: id,
            cancellationToken);
        if (tenantsResult.IsFailure)
            return Result.Failure<TenantAdminResponse>(tenantsResult.Error);

        user.Restore();
        using (currentActorScope.BeginScope(actorUserId, user.TenantId))
        {
            var stampResult = await userManager.UpdateSecurityStampAsync(user);
            if (!stampResult.Succeeded)
                return IdentityFailure<TenantAdminResponse>(stampResult);

            var restoreResult = await userManager.UpdateAsync(user);
            if (!restoreResult.Succeeded)
                return IdentityFailure<TenantAdminResponse>(restoreResult);
        }

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "TenantAdministratorRestored",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId,
            Metadata: new Dictionary<string, string?>
            {
                ["AssignedTenantIds"] = string.Join(',', tenantIds.OrderBy(tenantId => tenantId, StringComparer.Ordinal))
            }), cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        DispatchChange("Restore", user.Id);

        var responses = await BuildResponsesAsync([id], cancellationToken);
        return Result.Success(responses[0]);
    }

    private async Task<Result<IReadOnlyList<Tenant>>> ResolveTenantsAsync(
        IReadOnlyCollection<string> tenantIds,
        string defaultTenantId,
        string? excludedUserId,
        CancellationToken cancellationToken)
    {
        if (tenantIds.Count == 0 || !tenantIds.Contains(defaultTenantId, StringComparer.Ordinal))
            return Result.Failure<IReadOnlyList<Tenant>>(InvalidTenants);

        var tenants = await context.Tenants
            .AsNoTracking()
            .Where(tenant => tenantIds.Contains(tenant.Id))
            .ToListAsync(cancellationToken);
        if (tenants.Count != tenantIds.Count)
            return Result.Failure<IReadOnlyList<Tenant>>(InvalidTenants);

        var adminCounts = await (
                from tenantAccess in context.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
                join user in context.Users.IgnoreQueryFilters().AsNoTracking() on tenantAccess.UserId equals user.Id
                join userRole in context.UserRoles.AsNoTracking() on tenantAccess.UserId equals userRole.UserId
                join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                where tenantIds.Contains(tenantAccess.TenantId) &&
                      tenantAccess.UserId != excludedUserId &&
                      user.LifecycleStatus == UserLifecycleStatus.Active &&
                      role.NormalizedName == AppRoles.admin.ToUpper()
                group tenantAccess by tenantAccess.TenantId
                into tenantGroup
                select new
                {
                    TenantId = tenantGroup.Key,
                    Count = tenantGroup.Select(access => access.UserId).Distinct().Count()
                })
            .ToDictionaryAsync(item => item.TenantId, item => item.Count, cancellationToken);

        if (tenants.Any(tenant => adminCounts.GetValueOrDefault(tenant.Id) >= tenant.MaxAdmins))
            return Result.Failure<IReadOnlyList<Tenant>>(AdminSeatLimitReached);

        return Result.Success<IReadOnlyList<Tenant>>(tenants);
    }

    private async Task AssignTenantAccessesAsync(
        string userId,
        IReadOnlyCollection<Tenant> tenants,
        string defaultTenantId,
        string actorUserId,
        CancellationToken cancellationToken)
    {
        foreach (var tenant in tenants.OrderBy(item => item.Id))
        {
            using var scope = currentActorScope.BeginScope(actorUserId, tenant.Id);
            var companies = await context.Companies
                .IgnoreQueryFilters()
                .Where(company => company.TenantId == tenant.Id && company.IsActive)
                .OrderBy(company => company.Id)
                .ToListAsync(cancellationToken);

            if (companies.Count == 0)
            {
                var company = new Company(
                    "DEFAULT",
                    tenant.Name,
                    tenant.Name,
                    "EGP",
                    "Africa/Cairo")
                {
                    TenantId = tenant.Id
                };
                context.Companies.Add(company);
                await context.SaveChangesAsync(cancellationToken);
                await context.UserCompanyAccesses
                    .IgnoreQueryFilters()
                    .Where(access => access.UserId == actorUserId && access.CompanyId == company.Id)
                    .ExecuteDeleteAsync(cancellationToken);

                companies.Add(company);
            }

            context.UserTenantAccesses.Add(new UserTenantAccess
            {
                TenantId = tenant.Id,
                UserId = userId,
                IsDefault = string.Equals(tenant.Id, defaultTenantId, StringComparison.Ordinal)
            });

            var isFirst = true;
            foreach (var company in companies)
            {
                context.UserCompanyAccesses.Add(new UserCompanyAccess
                {
                    TenantId = tenant.Id,
                    UserId = userId,
                    CompanyId = company.Id,
                    IsDefault = isFirst
                });
                isFirst = false;
            }

            await context.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<IReadOnlyList<TenantAdminResponse>> BuildResponsesAsync(
        IReadOnlyCollection<string> userIds,
        CancellationToken cancellationToken)
    {
        if (userIds.Count == 0)
            return [];

        var users = await context.Users
            .AsNoTracking()
            .Where(user => userIds.Contains(user.Id))
            .OrderBy(user => user.FirstName)
            .ThenBy(user => user.LastName)
            .Select(user => new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                user.IsDisabled,
                user.LockoutEnd,
                user.TenantId,
                user.LifecycleStatus,
                user.ArchivedOn,
                user.ArchiveReason
            })
            .ToListAsync(cancellationToken);

        var accesses = await context.UserTenantAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => userIds.Contains(access.UserId))
            .OrderByDescending(access => access.IsDefault)
            .ThenBy(access => access.Tenant.Name)
            .Select(access => new
            {
                access.UserId,
                access.TenantId,
                access.IsDefault,
                access.Tenant.Identifier,
                access.Tenant.Name
            })
            .ToListAsync(cancellationToken);

        var companyRows = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => userIds.Contains(access.UserId))
            .Select(access => new { access.UserId, access.CompanyId })
            .ToListAsync(cancellationToken);

        return users.Select(user =>
        {
            var userAccesses = accesses.Where(access => access.UserId == user.Id).ToArray();
            return new TenantAdminResponse(
                user.Id,
                user.FirstName,
                user.LastName,
                user.UserName,
                user.Email,
                user.IsDisabled,
                user.LockoutEnd.HasValue && user.LockoutEnd > timeProvider.GetUtcNow(),
                userAccesses.FirstOrDefault(access => access.IsDefault)?.TenantId ?? user.TenantId,
                userAccesses.Select(access => new TenantAdminTenantResponse(
                    access.TenantId,
                    access.Identifier,
                    access.Name,
                    access.IsDefault)).ToArray(),
                companyRows
                    .Where(row => row.UserId == user.Id)
                    .Select(row => row.CompanyId)
                    .Distinct()
                    .ToArray(),
                user.LifecycleStatus.ToString().ToLowerInvariant(),
                user.ArchivedOn,
                user.ArchiveReason);
        }).ToArray();
    }

    private IQueryable<string> GetAdminUserIdsQuery(bool includeArchived = false) =>
        from userRole in context.UserRoles.AsNoTracking()
        join user in context.Users.AsNoTracking() on userRole.UserId equals user.Id
        join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
        where role.NormalizedName == AppRoles.admin.ToUpper() &&
              (includeArchived || user.LifecycleStatus == UserLifecycleStatus.Active) &&
              !(from otherUserRole in context.UserRoles.AsNoTracking()
                join otherRole in context.Roles.AsNoTracking()
                    on otherUserRole.RoleId equals otherRole.Id
                where otherUserRole.UserId == userRole.UserId &&
                      otherRole.NormalizedName == AppRoles.super_admin.ToUpper()
                select otherUserRole).Any()
        select userRole.UserId;

    private static IQueryable<ApplicationUser> ApplyOrdering(
        IQueryable<ApplicationUser> query,
        string? columnName,
        string? sortDirection)
    {
        var descending = string.Equals(sortDirection, "DESC", StringComparison.OrdinalIgnoreCase);
        return (columnName?.ToUpperInvariant(), descending) switch
        {
            ("EMAIL", false) => query.OrderBy(user => user.Email).ThenBy(user => user.Id),
            ("EMAIL", true) => query.OrderByDescending(user => user.Email).ThenByDescending(user => user.Id),
            ("USERNAME", false) => query.OrderBy(user => user.UserName).ThenBy(user => user.Id),
            ("USERNAME", true) => query.OrderByDescending(user => user.UserName).ThenByDescending(user => user.Id),
            ("NAME", true) => query.OrderByDescending(user => user.FirstName)
                .ThenByDescending(user => user.LastName)
                .ThenByDescending(user => user.Id),
            _ => query.OrderBy(user => user.FirstName)
                .ThenBy(user => user.LastName)
                .ThenBy(user => user.Id)
        };
    }

    private void RevokeActiveSessions(ApplicationUser user, string reason)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        foreach (var token in user.RefreshTokens.Where(token => token.IsActiveAt(now)))
            token.Revoke(reason, now);
    }

    private void DispatchChange(string action, string userId) =>
        realtimeChanges.Dispatch(RealtimeChangeRequest.For<ApplicationUser>(
            RealtimeAudience.ForRole(AppRoles.super_admin),
            action,
            userId));

    private static Result<T> IdentityFailure<T>(IdentityResult identityResult)
    {
        var error = identityResult.Errors.First();
        return Result.Failure<T>(new Error(error.Code, error.Description, ErrorType.Validation));
    }

    private static Result IdentityFailure(IdentityResult identityResult)
    {
        var error = identityResult.Errors.First();
        return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
    }

    private static readonly Error NotFound =
        new("TenantAdmin.NotFound", "Tenant administrator was not found.", ErrorType.NotFound);

    private static readonly Error InvalidTenants =
        new("TenantAdmin.InvalidTenants", "One or more selected tenants are invalid.", ErrorType.Validation);

    private static readonly Error DuplicateEmail =
        new("TenantAdmin.DuplicateEmail", "Email already exists.", ErrorType.Conflict);

    private static readonly Error DuplicateUserName =
        new("TenantAdmin.DuplicateUserName", "User name already exists.", ErrorType.Conflict);

    private static readonly Error AdminSeatLimitReached =
        new("TenantAdmin.AdminSeatLimitReached", "A selected tenant has reached its administrator limit.", ErrorType.Validation);

    private static readonly Error InvalidActor =
        new("TenantAdmin.InvalidActor", "An authenticated super administrator is required.", ErrorType.Unauthorized);
}
