using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Domain.Security.Users.Enums;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Persistence;

public sealed class UserManagementReadStore(
    PlatformDbContext context,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    TenantRoleAssignmentService roleAssignments) : IUserManagementReadStore
{
    public async Task<PageResponse<UserResponse>> GetPageAsync(
        UserManagementQuery request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = currentActor.TenantId;
        var actorCompanyIds = await GetActorCompanyIdsAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(tenantId) || actorCompanyIds.Count == 0)
            return EmptyPage<UserResponse>(request);

        var companyAccesses = context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.TenantId == tenantId);
        var superAdminRoleName = PlatformRoleNames.SuperAdmin.ToUpper();
        var query = context.Users
            .AsNoTracking()
            .Where(user =>
                context.UserTenantAccesses.Any(access => access.UserId == user.Id && access.TenantId == tenantId) &&
                (request.IncludeArchived || user.LifecycleStatus == (int)UserLifecycleStatus.Active) &&
                companyAccesses.Any(access => access.UserId == user.Id) &&
                !companyAccesses.Any(access =>
                    access.UserId == user.Id && !actorCompanyIds.Contains(access.CompanyId)) &&
                !(from userRole in context.UserRoles.AsNoTracking()
                  join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                  where userRole.UserId == user.Id &&
                        role.IsSystem &&
                        role.NormalizedName == superAdminRoleName
                  select userRole).Any());

        if (!string.IsNullOrWhiteSpace(request.SearchValue))
        {
            var search = request.SearchValue.Trim();
            query = query.Where(user =>
                user.FirstName.Contains(search) ||
                user.LastName.Contains(search) ||
                (user.UserName != null && user.UserName.Contains(search)) ||
                (user.Email != null && user.Email.Contains(search)));
        }

        query = ApplyUserOrdering(query, request.ColumnName, request.SortDirection);
        var totalCount = await query.CountAsync(cancellationToken);
        var users = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToArrayAsync(cancellationToken);
        var items = await BuildUserResponsesAsync(users, tenantId, cancellationToken);
        var page = new PagedList<UserResponse>(
            items.ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);

        return new PageResponse<UserResponse>(page, page.MetaData);
    }

    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow();
        var tenantId = currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(tenantId))
            return [];

        var actorCompanyIds = await GetActorCompanyIdsAsync(cancellationToken);
        if (actorCompanyIds.Count == 0)
            return [];

        var users = await context.Users
            .AsNoTracking()
            .Where(user =>
                context.UserTenantAccesses.Any(access => access.UserId == user.Id && access.TenantId == tenantId) &&
                user.LifecycleStatus == (int)UserLifecycleStatus.Active)
            .Select(user => new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                user.IsDisabled,
                IsLocked = user.LockoutEnd.HasValue && user.LockoutEnd > now,
                user.ProfilePicture,
                user.LifecycleStatus,
                user.ArchivedOn,
                user.ArchiveReason
            })
            .ToListAsync(cancellationToken);

        if (users.Count == 0)
            return [];

        var userIds = users.Select(user => user.Id).ToArray();
        var roleRows = await (
                from userRole in context.UserRoles.AsNoTracking()
                join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                where userIds.Contains(userRole.UserId) &&
                      (role.IsSystem || (!role.IsSystem && role.TenantId == tenantId))
                select new { userRole.UserId, RoleName = role.Name! })
            .ToListAsync(cancellationToken);
        var accessRows = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.TenantId == tenantId && userIds.Contains(access.UserId))
            .Select(access => new { access.UserId, access.CompanyId, access.IsDefault })
            .ToListAsync(cancellationToken);

        var rolesByUser = roleRows
            .GroupBy(row => row.UserId)
            .ToDictionary(group => group.Key, group => group.Select(row => row.RoleName).ToArray());
        var accessByUser = accessRows
            .GroupBy(row => row.UserId)
            .ToDictionary(group => group.Key, group => group.ToArray());

        return users
            .Select(user =>
            {
                var roles = rolesByUser.GetValueOrDefault(user.Id) ?? [];
                var accesses = accessByUser.GetValueOrDefault(user.Id) ?? [];
                return new UserResponse(
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.UserName,
                    user.Email,
                    user.IsDisabled,
                    user.IsLocked,
                    user.ProfilePicture,
                    roles,
                    accesses.Select(access => access.CompanyId).ToArray(),
                    accesses.FirstOrDefault(access => access.IsDefault)?.CompanyId,
                    user.LifecycleStatus.ToString().ToLowerInvariant(),
                    user.ArchivedOn,
                    user.ArchiveReason);
            })
            .Where(user =>
                !user.Roles.Contains(PlatformRoleNames.SuperAdmin, StringComparer.OrdinalIgnoreCase) &&
                IsWithinCompanyScope(user.CompanyIds, actorCompanyIds))
            .ToArray();
    }

    public async Task<IReadOnlyCollection<UserCompanyOptionResponse>> GetCompanyOptionsAsync(
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(currentActor.TenantId) ||
            string.IsNullOrWhiteSpace(currentActor.UserId))
        {
            return [];
        }

        return await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.TenantId == currentActor.TenantId &&
                access.UserId == currentActor.UserId)
            .OrderByDescending(access => access.IsDefault)
            .ThenBy(access => access.Company.NameEn)
            .Select(access => new UserCompanyOptionResponse(
                access.CompanyId,
                access.Company.NameAr,
                access.Company.NameEn,
                access.Company.IsActive))
            .ToArrayAsync(cancellationToken);
    }

    public async Task<UserResponse?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        var tenantId = currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(tenantId))
            return null;

        var user = await context.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(
                candidate => candidate.Id == id &&
                    context.UserTenantAccesses.Any(access =>
                        access.UserId == candidate.Id && access.TenantId == tenantId) &&
                    candidate.LifecycleStatus == (int)UserLifecycleStatus.Active,
                cancellationToken);
        if (user is null)
            return null;

        var userRoles = await roleAssignments.GetScopedRoleNamesAsync(
            user.Id,
            tenantId,
            cancellationToken);
        if (userRoles.Contains(PlatformRoleNames.SuperAdmin, StringComparer.OrdinalIgnoreCase))
            return null;

        var accesses = await GetUserCompanyAccessesAsync(user.Id, tenantId, cancellationToken);
        var actorCompanyIds = await GetActorCompanyIdsAsync(cancellationToken);
        if (!IsWithinCompanyScope(accesses.Select(access => access.CompanyId), actorCompanyIds))
            return null;

        return CreateUserResponse(user, userRoles, accesses);
    }

    private async Task<IReadOnlyList<UserResponse>> BuildUserResponsesAsync(
        IReadOnlyCollection<PlatformApplicationUser> users,
        string tenantId,
        CancellationToken cancellationToken)
    {
        if (users.Count == 0)
            return [];

        var userIds = users.Select(user => user.Id).ToArray();
        var roleRows = await (
                from userRole in context.UserRoles.AsNoTracking()
                join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                where userIds.Contains(userRole.UserId) &&
                      (role.IsSystem || (!role.IsSystem && role.TenantId == tenantId))
                select new { userRole.UserId, RoleName = role.Name! })
            .ToArrayAsync(cancellationToken);
        var accessRows = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.TenantId == tenantId && userIds.Contains(access.UserId))
            .ToArrayAsync(cancellationToken);

        var rolesByUser = roleRows
            .GroupBy(row => row.UserId)
            .ToDictionary(group => group.Key, group => group.Select(row => row.RoleName).ToArray());
        var accessesByUser = accessRows
            .GroupBy(access => access.UserId)
            .ToDictionary(group => group.Key, group => group.ToArray());

        return users.Select(user => CreateUserResponse(
            user,
            rolesByUser.GetValueOrDefault(user.Id) ?? [],
            accessesByUser.GetValueOrDefault(user.Id) ?? [])).ToArray();
    }

    private async Task<IReadOnlyCollection<PlatformUserCompanyAccess>> GetUserCompanyAccessesAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default) =>
        await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.UserId == userId && access.TenantId == tenantId)
            .ToArrayAsync(cancellationToken);

    private async Task<HashSet<int>> GetActorCompanyIdsAsync(
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(currentActor.TenantId) ||
            string.IsNullOrWhiteSpace(currentActor.UserId))
        {
            return [];
        }

        return await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.TenantId == currentActor.TenantId &&
                access.UserId == currentActor.UserId)
            .Select(access => access.CompanyId)
            .ToHashSetAsync(cancellationToken);
    }

    private static bool IsWithinCompanyScope(
        IEnumerable<int> userCompanyIds,
        IReadOnlySet<int> actorCompanyIds)
    {
        var companyIds = userCompanyIds.Distinct().ToArray();
        return companyIds.Length > 0 && companyIds.All(actorCompanyIds.Contains);
    }

    private static IQueryable<PlatformApplicationUser> ApplyUserOrdering(
        IQueryable<PlatformApplicationUser> query,
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

    private static PageResponse<T> EmptyPage<T>(PaginationRequest request)
    {
        var page = new PagedList<T>([], 0, request.PageNumber, request.PageSize);
        return new PageResponse<T>(page, page.MetaData);
    }

    private static UserResponse CreateUserResponse(
        PlatformApplicationUser user,
        IEnumerable<string> roles,
        IEnumerable<PlatformUserCompanyAccess> accesses)
    {
        var companyAccesses = accesses.ToArray();
        return new UserResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.UserName ?? string.Empty,
            user.Email ?? string.Empty,
            user.IsDisabled,
            user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow,
            user.ProfilePicture,
            roles.Distinct(StringComparer.OrdinalIgnoreCase).ToArray(),
            companyAccesses.Select(access => access.CompanyId).Distinct().ToArray(),
            companyAccesses.FirstOrDefault(access => access.IsDefault)?.CompanyId,
            user.LifecycleStatus.ToString().ToLowerInvariant(),
            user.ArchivedOn,
            user.ArchiveReason);
    }
}
