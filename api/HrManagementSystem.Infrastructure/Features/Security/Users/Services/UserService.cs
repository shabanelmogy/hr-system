using HrManagementSystem.Application.Features.Security.Users.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Jobs;
using HrManagementSystem.Infrastructure.Features.Security.Users.Jobs;

using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Application.Features.Security.Users.Contracts;
using HrManagementSystem.Application.Features.Security.Users.Errors;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Files;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Infrastructure.Features.Security.Authorization.Services;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Services;
using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;
using HrManagementSystem.Domain.Security.Users.Enums;
using System.Data;

namespace HrManagementSystem.Infrastructure.Features.Security.Users.Services;

public class UserService(
    UserManager<ApplicationUser> userManager,
    UserErrors userErrors,
    ApplicationDbContext context,
    ICurrentActor currentActor,
    IWebHostEnvironment webHostEnvironment,
    TimeProvider timeProvider,
    ILogger<UserService> logger,
    ISecurityAuditService securityAudit,
    IEntityChangeLogService entityChangeLogs,
    IRealtimeChangeDispatcher realtimeChanges,
    IUserSeatLimitService seatLimits,
    TenantRoleAssignmentService roleAssignments) : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly UserErrors _userErrors = userErrors;
    private readonly ApplicationDbContext _context = context;
    private readonly ICurrentActor _currentActor = currentActor;
    private readonly string _profilePicturesPath = Path.Combine(
        webHostEnvironment.WebRootPath ?? Path.Combine(webHostEnvironment.ContentRootPath, "wwwroot"),
        "profile-pictures");

    public async Task<PageResponse<UserResponse>> GetPageAsync(
        UserManagementQuery request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = _currentActor.TenantId;
        var actorCompanyIds = await GetActorCompanyIdsAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(tenantId) || actorCompanyIds.Count == 0)
            return EmptyPage<UserResponse>(request);

        var companyAccesses = _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.TenantId == tenantId);
        var superAdminRoleName = AppRoles.super_admin.ToUpper();
        var query = _context.Users
            .AsNoTracking()
            .Where(user =>
                user.TenantId == tenantId &&
                (request.IncludeArchived || user.LifecycleStatus == UserLifecycleStatus.Active) &&
                companyAccesses.Any(access => access.UserId == user.Id) &&
                !companyAccesses.Any(access =>
                    access.UserId == user.Id && !actorCompanyIds.Contains(access.CompanyId)) &&
                !(from userRole in _context.UserRoles.AsNoTracking()
                  join role in _context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
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
        var items = await BuildUserResponsesAsync(users, cancellationToken);
        var page = new PagedList<UserResponse>(
            items.ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);

        return new PageResponse<UserResponse>(page, page.MetaData);
    }

    public async Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow();
        var tenantId = _currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(tenantId))
            return [];

        var actorCompanyIds = await GetActorCompanyIdsAsync(cancellationToken);
        if (actorCompanyIds.Count == 0)
            return [];

        var users = await _context.Users
            .AsNoTracking()
            .Where(user =>
                user.TenantId == tenantId &&
                user.LifecycleStatus == UserLifecycleStatus.Active)
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
                from userRole in _context.UserRoles
                join role in _context.Roles on userRole.RoleId equals role.Id
                where userIds.Contains(userRole.UserId) &&
                      (role.IsSystem || (!role.IsSystem && role.TenantId == tenantId))
                select new { userRole.UserId, RoleName = role.Name! })
            .ToListAsync(cancellationToken);
        var accessRows = await _context.UserCompanyAccesses
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
                !user.Roles.Contains(AppRoles.super_admin, StringComparer.OrdinalIgnoreCase) &&
                IsWithinCompanyScope(user.CompanyIds, actorCompanyIds))
            .ToArray();
    }

    public async Task<IReadOnlyCollection<UserCompanyOptionResponse>> GetCompanyOptionsAsync(
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_currentActor.TenantId) ||
            string.IsNullOrWhiteSpace(_currentActor.UserId))
        {
            return [];
        }

        return await _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.TenantId == _currentActor.TenantId &&
                access.UserId == _currentActor.UserId)
            .OrderByDescending(access => access.IsDefault)
            .ThenBy(access => access.Company.NameEn)
            .Select(access => new UserCompanyOptionResponse(
                access.CompanyId,
                access.Company.NameAr,
                access.Company.NameEn,
                access.Company.IsActive))
            .ToArrayAsync(cancellationToken);
    }

    public async Task<Result<UserResponse>> GetAsync(string id)
    {
        if (await _userManager.Users.SingleOrDefaultAsync(
                candidate => candidate.Id == id &&
                    candidate.TenantId == _currentActor.TenantId &&
                    candidate.LifecycleStatus == UserLifecycleStatus.Active) is not { } user)
            return Result.Failure<UserResponse>(_userErrors.UserNotFound);

        var userRoles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, user.TenantId);
        if (userRoles.Contains(AppRoles.super_admin, StringComparer.OrdinalIgnoreCase))
            return Result.Failure<UserResponse>(_userErrors.UserNotFound);

        var accesses = await GetUserCompanyAccessesAsync(user.Id, user.TenantId);
        var actorCompanyIds = await GetActorCompanyIdsAsync();
        if (!IsWithinCompanyScope(
                accesses.Select(access => access.CompanyId),
                actorCompanyIds))
        {
            return Result.Failure<UserResponse>(_userErrors.UserNotFound);
        }

        var response = CreateUserResponse(user, userRoles, accesses);

        return Result.Success(response);
    }

    public async Task<Result<UserResponse>> AddAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_currentActor.TenantId) || !_currentActor.CompanyId.HasValue)
            return Result.Failure<UserResponse>(_userErrors.InvalidCompanySelection);

        var companyIds = await ResolveCompanyIdsAsync(
            request.CompanyIds,
            request.DefaultCompanyId,
            cancellationToken: cancellationToken);
        if (companyIds is null)
            return Result.Failure<UserResponse>(_userErrors.InvalidCompanySelection);

        var emailIsExists = await _userManager.Users.AnyAsync(x => x.Email == request.Email, cancellationToken);

        if (emailIsExists)
            return Result.Failure<UserResponse>(_userErrors.DuplicatedEmail);

        var userNameIsExists = await _userManager.Users.AnyAsync(x => x.UserName == request.UserName, cancellationToken);

        if (userNameIsExists)
            return Result.Failure<UserResponse>(_userErrors.DuplicatedUserName);

        var resolvedRoles = await roleAssignments.ResolveAssignableRolesAsync(
            _currentActor.TenantId,
            request.Roles,
            cancellationToken);
        if (resolvedRoles is null)
            return Result.Failure<UserResponse>(_userErrors.InvalidRoles);

        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        if (await seatLimits.GetLimitErrorAsync(_currentActor.TenantId!, request.Roles, cancellationToken) is { } seatLimitError)
            return Result.Failure<UserResponse>(seatLimitError);

        var user = request.Adapt<ApplicationUser>();
        user.TenantId = _currentActor.TenantId;

        var result = await _userManager.CreateAsync(user, request.Password);

        if (result.Succeeded)
        {
            roleAssignments.AddAssignments(user.Id, resolvedRoles);

            _context.UserTenantAccesses.Add(new UserTenantAccess
            {
                TenantId = user.TenantId,
                UserId = user.Id,
                IsDefault = true
            });

            foreach (var companyId in companyIds)
            {
                _context.UserCompanyAccesses.Add(new UserCompanyAccess
                {
                    TenantId = user.TenantId,
                    CompanyId = companyId,
                    UserId = user.Id,
                    IsDefault = companyId == request.DefaultCompanyId
                });
            }
            securityAudit.Add(new SecurityAuditRequest(
                "UserCreated",
                "ApplicationUser",
                user.Id,
                TenantId: user.TenantId,
                CompanyId: request.DefaultCompanyId,
                Metadata: new Dictionary<string, string?>
                {
                    ["UserName"] = user.UserName,
                    ["Roles"] = string.Join(',', request.Roles.OrderBy(role => role, StringComparer.OrdinalIgnoreCase)),
                    ["CompanyIds"] = string.Join(',', companyIds.OrderBy(companyId => companyId))
                }));
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            var response = CreateUserResponse(
                user,
                request.Roles,
                companyIds.Select(companyId => new UserCompanyAccess
                {
                    TenantId = user.TenantId,
                    CompanyId = companyId,
                    UserId = user.Id,
                    IsDefault = companyId == request.DefaultCompanyId
                }));

            QueueUserChanged(response, "Add");

            return Result.Success(response);
        }

        var error = result.Errors.First();

        return Result.Failure<UserResponse>(new Error(error.Code, error.Description, ErrorType.Validation));
    }

    public async Task<Result> UpdateAsync(string id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        if (string.Equals(id, _currentActor.UserId, StringComparison.Ordinal))
            return Result.Failure(_userErrors.CannotManageOwnAccount);

        if (await _userManager.Users
                .Include(candidate => candidate.RefreshTokens)
                .SingleOrDefaultAsync(
                    candidate => candidate.Id == id &&
                        candidate.TenantId == _currentActor.TenantId &&
                        candidate.LifecycleStatus == UserLifecycleStatus.Active,
                    cancellationToken) is not { } user)
        {
            return Result.Failure(_userErrors.UserNotFound);
        }

        var existingRoles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, user.TenantId, cancellationToken);
        if (existingRoles.Contains(AppRoles.super_admin, StringComparer.OrdinalIgnoreCase) ||
            !await IsUserWithinActorCompanyScopeAsync(user.Id, user.TenantId, cancellationToken))
        {
            return Result.Failure(_userErrors.UserNotFound);
        }

        var emailIsExists = await _userManager.Users.AnyAsync(x => x.Email == request.Email && x.Id != id, cancellationToken);

        if (emailIsExists)
            return Result.Failure(_userErrors.DuplicatedEmail);

        var userNameIsExists = await _userManager.Users.AnyAsync(x => x.UserName == request.UserName && x.Id != id, cancellationToken);

        if (userNameIsExists)
            return Result.Failure<UserResponse>(_userErrors.DuplicatedUserName);

        var resolvedRoles = await roleAssignments.ResolveAssignableRolesAsync(
            _currentActor.TenantId!,
            request.Roles,
            cancellationToken);
        if (resolvedRoles is null)
            return Result.Failure(_userErrors.InvalidRoles);

        var companyIds = await ResolveCompanyIdsAsync(
            request.CompanyIds,
            request.DefaultCompanyId,
            cancellationToken: cancellationToken);
        if (companyIds is null)
            return Result.Failure(_userErrors.InvalidCompanySelection);

        var existingAccesses = await GetUserCompanyAccessesAsync(
            user.Id,
            user.TenantId,
            cancellationToken);
        var previousSnapshot = CreateUserChangeSnapshot(
            user,
            existingRoles,
            existingAccesses.Select(access => access.CompanyId),
            existingAccesses.FirstOrDefault(access => access.IsDefault)?.CompanyId);

        var addedRoles = request.Roles
            .Except(existingRoles, StringComparer.OrdinalIgnoreCase)
            .ToArray();
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        if (await seatLimits.GetLimitErrorAsync(_currentActor.TenantId!, addedRoles, cancellationToken) is { } seatLimitError)
            return Result.Failure(seatLimitError);

        user = request.Adapt(user);

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            await roleAssignments.SynchronizeAssignmentsAsync(
                user.Id,
                _currentActor.TenantId!,
                resolvedRoles,
                cancellationToken);

            await SynchronizeCompanyAccessesAsync(
                user,
                companyIds,
                request.DefaultCompanyId,
                cancellationToken);
            var effectiveRoles = await roleAssignments.GetScopedRoleNamesAsync(
                user.Id,
                _currentActor.TenantId!,
                cancellationToken);
            var updatedSnapshot = CreateUserChangeSnapshot(
                user,
                effectiveRoles,
                companyIds,
                request.DefaultCompanyId);

            var stampResult = await _userManager.UpdateSecurityStampAsync(user);
            if (!stampResult.Succeeded)
            {
                var stampError = stampResult.Errors.First();
                return Result.Failure(
                    new Error(stampError.Code, stampError.Description, ErrorType.Validation));
            }

            RevokeActiveSessions(user, "Account permissions changed");
            var revokeResult = await _userManager.UpdateAsync(user);
            if (!revokeResult.Succeeded)
            {
                var revokeError = revokeResult.Errors.First();
                return Result.Failure(
                    new Error(revokeError.Code, revokeError.Description, ErrorType.Validation));
            }

            var entityChangeLog = await entityChangeLogs.CreateChangeLogAsync(
                user.Id,
                "ApplicationUser",
                previousSnapshot,
                updatedSnapshot,
                cancellationToken);

            await securityAudit.RecordAsync(new SecurityAuditRequest(
                "UserUpdated",
                "ApplicationUser",
                user.Id,
                TenantId: user.TenantId,
                CompanyId: request.DefaultCompanyId,
                Metadata: new Dictionary<string, string?>
                {
                    ["UserName"] = user.UserName,
                    ["PreviousRoles"] = string.Join(',', existingRoles.OrderBy(role => role, StringComparer.OrdinalIgnoreCase)),
                    ["Roles"] = string.Join(',', effectiveRoles.OrderBy(role => role, StringComparer.OrdinalIgnoreCase)),
                    ["CompanyIds"] = string.Join(',', companyIds.OrderBy(companyId => companyId))
                }), cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            if (entityChangeLog is not null)
                DispatchEntityChangeLogChange(user.Id);
            QueueSessionRevoked(
                user.Id,
                "Your account permissions changed. Please sign in again.");
            QueueUserChanged(CreateUserResponse(
                user,
                effectiveRoles,
                companyIds.Select(companyId => new UserCompanyAccess
                {
                    TenantId = user.TenantId,
                    CompanyId = companyId,
                    UserId = user.Id,
                    IsDefault = companyId == request.DefaultCompanyId
                })), "Update");

            return Result.Success();
        }

        var error = result.Errors.First();

        return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
    }

    public async Task<Result> ChangeUserPasswordAsync(
        string id,
        ChangeUserPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(id, _currentActor.UserId, StringComparison.Ordinal))
            return Result.Failure(_userErrors.CannotManageOwnAccount);

        if (await _userManager.Users
                .Include(candidate => candidate.RefreshTokens)
                .SingleOrDefaultAsync(
                    candidate => candidate.Id == id &&
                        candidate.TenantId == _currentActor.TenantId &&
                        candidate.LifecycleStatus == UserLifecycleStatus.Active,
                cancellationToken) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        if (await roleAssignments.IsSuperAdminAsync(user.Id, cancellationToken))
            return Result.Failure(_userErrors.UserNotFound);

        if (!await IsUserWithinActorCompanyScopeAsync(user.Id, user.TenantId, cancellationToken))
            return Result.Failure(_userErrors.UserNotFound);

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);

        if (!result.Succeeded)
        {
            var error = result.Errors.First();
            return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
        }

        RevokeActiveSessions(user, "Password changed by an administrator");
        var revokeResult = await _userManager.UpdateAsync(user);
        if (!revokeResult.Succeeded)
            return Result.Failure(_userErrors.SessionRevocationFailed);

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "UserPasswordChangedByAdministrator",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId), cancellationToken);
        QueueSessionRevoked(user.Id, "Your password was changed. Please sign in again.");

        return Result.Success();
    }

    public async Task<Result> ToggleStatus(string id)
    {
        if (string.Equals(id, _currentActor.UserId, StringComparison.Ordinal))
            return Result.Failure(_userErrors.CannotManageOwnAccount);

        if (await _userManager.Users
                .Include(candidate => candidate.RefreshTokens)
                .SingleOrDefaultAsync(
                    candidate => candidate.Id == id &&
                        candidate.TenantId == _currentActor.TenantId &&
                        candidate.LifecycleStatus == UserLifecycleStatus.Active) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        if (await roleAssignments.IsSuperAdminAsync(user.Id))
            return Result.Failure(_userErrors.UserNotFound);

        if (!await IsUserWithinActorCompanyScopeAsync(user.Id, user.TenantId))
            return Result.Failure(_userErrors.UserNotFound);

        if (user.IsDisabled)
            user.Enable();
        else
            user.Disable();

        if (user.IsDisabled)
            RevokeActiveSessions(user, "Account disabled");

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            await securityAudit.RecordAsync(new SecurityAuditRequest(
                user.IsDisabled ? "UserDisabled" : "UserEnabled",
                "ApplicationUser",
                user.Id,
                TenantId: user.TenantId));
            if (user.IsDisabled)
            {
                QueueSessionRevoked(user.Id, "Your account has been disabled.");
            }

            var roles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, user.TenantId);
            var accesses = await GetUserCompanyAccessesAsync(user.Id, user.TenantId);
            QueueUserChanged(
                CreateUserResponse(user, roles, accesses),
                user.IsDisabled ? "Disable" : "Enable");

            return Result.Success();
        }

        var error = result.Errors.First();
        return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
    }

    public async Task<Result> Unlock(string id)
    {
        if (string.Equals(id, _currentActor.UserId, StringComparison.Ordinal))
            return Result.Failure(_userErrors.CannotManageOwnAccount);

        if (await _userManager.Users.SingleOrDefaultAsync(
                candidate => candidate.Id == id &&
                    candidate.TenantId == _currentActor.TenantId &&
                    candidate.LifecycleStatus == UserLifecycleStatus.Active) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        if (await roleAssignments.IsSuperAdminAsync(user.Id))
            return Result.Failure(_userErrors.UserNotFound);

        if (!await IsUserWithinActorCompanyScopeAsync(user.Id, user.TenantId))
            return Result.Failure(_userErrors.UserNotFound);

        // Clear the lockout end date
        var lockoutResult = await _userManager.SetLockoutEndDateAsync(user, null);
        if (!lockoutResult.Succeeded)
        {
            var error = lockoutResult.Errors.First();
            return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
        }

        var roles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, user.TenantId);
        var accesses = await GetUserCompanyAccessesAsync(user.Id, user.TenantId);
        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "UserUnlocked",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId));
        QueueUserChanged(CreateUserResponse(user, roles, accesses), "Unlock");

        return Result.Success();
    }

    public async Task<Result> ArchiveAsync(
        string id,
        ArchiveUserRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(id, _currentActor.UserId, StringComparison.Ordinal))
            return Result.Failure(_userErrors.CannotManageOwnAccount);

        var user = await _userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(
                candidate => candidate.Id == id &&
                    candidate.TenantId == _currentActor.TenantId &&
                    candidate.LifecycleStatus == UserLifecycleStatus.Active,
                cancellationToken);
        if (user is null ||
            await roleAssignments.IsSuperAdminAsync(user.Id, cancellationToken) ||
            !await IsUserWithinActorCompanyScopeAsync(user.Id, user.TenantId, cancellationToken))
        {
            return Result.Failure(_userErrors.UserNotFound);
        }

        var roles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, user.TenantId, cancellationToken);
        var accesses = await GetUserCompanyAccessesAsync(user.Id, user.TenantId, cancellationToken);
        user.Archive(request.Reason, timeProvider.GetUtcNow().UtcDateTime);
        RevokeActiveSessions(user, "Account archived");

        var stampResult = await _userManager.UpdateSecurityStampAsync(user);
        if (!stampResult.Succeeded)
            return Result.Failure(_userErrors.SessionRevocationFailed);
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure(_userErrors.UpdateFailed);

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "UserArchived",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId,
            Metadata: new Dictionary<string, string?>
            {
                ["Reason"] = request.Reason
            }), cancellationToken);
        QueueSessionRevoked(user.Id, "Your account has been archived.");
        QueueUserChanged(CreateUserResponse(user, roles, accesses), "Archive");
        return Result.Success();
    }

    public async Task<Result> RestoreAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.Users
            .SingleOrDefaultAsync(
                candidate => candidate.Id == id &&
                    candidate.TenantId == _currentActor.TenantId &&
                    candidate.LifecycleStatus == UserLifecycleStatus.Archived,
                cancellationToken);
        if (user is null ||
            await roleAssignments.IsSuperAdminAsync(user.Id, cancellationToken) ||
            !await IsUserWithinActorCompanyScopeAsync(user.Id, user.TenantId, cancellationToken))
        {
            return Result.Failure(_userErrors.UserNotFound);
        }

        var roles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, user.TenantId, cancellationToken);
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        if (await seatLimits.GetLimitErrorAsync(_currentActor.TenantId!, roles, cancellationToken) is { } seatLimitError)
            return Result.Failure(seatLimitError);

        user.Restore();
        var stampResult = await _userManager.UpdateSecurityStampAsync(user);
        if (!stampResult.Succeeded)
            return Result.Failure(_userErrors.SessionRevocationFailed);
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure(_userErrors.UpdateFailed);

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "UserRestored",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId), cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var accesses = await GetUserCompanyAccessesAsync(user.Id, user.TenantId, cancellationToken);
        QueueUserChanged(CreateUserResponse(user, roles, accesses), "Restore");
        return Result.Success();
    }

    public async Task<Result<UserProfileResponse>> GetProfileAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users
                                .Where(x => x.Id == userId)
                                .ProjectToType<UserProfileResponse>()
                                .SingleAsync(cancellationToken);

        return Result.Success(user);
    }

    public async Task<Result<UserPhoto>> GetUserPhotoAsync(string userId, CancellationToken cancellationToken)
    {
        var fileName = await _userManager.Users
            .Where(u => u.Id == userId)
            .Select(u => u.ProfilePicture)
            .SingleOrDefaultAsync(cancellationToken);

        var filePath = GetProfilePicturePath(fileName);
        if (filePath is null || !File.Exists(filePath))
            return Result.Success(new UserPhoto());

        var bytes = await File.ReadAllBytesAsync(filePath, cancellationToken);
        return Result.Success(new UserPhoto
        {
            ProfilePicture = Convert.ToBase64String(bytes),
            ContentType = GetImageContentType(fileName),
        });
    }
    public async Task<Result> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        await _userManager.Users
            .Where(x => x.Id == userId)
            .ExecuteUpdateAsync(setters =>
                setters
                    .SetProperty(x => x.UserName, request.UserName)
                    .SetProperty(x => x.NormalizedUserName, request.UserName.ToUpper())
                    .SetProperty(x => x.FirstName, request.FirstName)
                    .SetProperty(x => x.LastName, request.LastName), cancellationToken);

        DispatchOwnUserChange(userId, "ProfileUpdated");

        return Result.Success();
    }

    public async Task<Result> UpdateProfilePictureAsync(string userId, UpdateProfilePictureRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return Result.Failure(_userErrors.UserNotFound);

        var oldPath = GetProfilePicturePath(user.ProfilePicture);

        if (request.Remove)
        {
            await _userManager.Users
                .Where(u => u.Id == userId)
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.ProfilePicture, (string?)null), cancellationToken);

            DeleteFileIfExists(oldPath);
            DispatchOwnUserChange(userId, "ProfilePictureUpdated");
            return Result.Success();
        }

        if (request.ProfilePicture is null)
            return Result.Failure(_userErrors.ProfilePictureRequired);

        var extension = Path.GetExtension(request.ProfilePicture.FileName).ToLowerInvariant();
        if (!FileSettings.AllowedImagesExtensions.Contains(extension))
            return Result.Failure(_userErrors.InvalidProfilePicture);

        Directory.CreateDirectory(_profilePicturesPath);
        var newFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = GetProfilePicturePath(newFileName)!;

        try
        {
            await using var input = request.ProfilePicture.OpenReadStream();
            await using var stream = File.Create(filePath);
            await input.CopyToAsync(stream, cancellationToken);

            await _userManager.Users
                .Where(u => u.Id == userId)
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.ProfilePicture, newFileName), cancellationToken);
        }
        catch
        {
            DeleteFileIfExists(filePath);
            throw;
        }

        DeleteFileIfExists(oldPath);

        DispatchOwnUserChange(userId, "ProfilePictureUpdated");

        return Result.Success();
    }

    public async Task<Result> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(candidate => candidate.Id == userId, cancellationToken);

        if (user is null)
            return Result.Failure(_userErrors.UserNotFound);

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

        if (result.Succeeded)
        {
            RevokeActiveSessions(user, "Password changed");
            await _userManager.UpdateAsync(user);
            QueueSessionRevoked(user.Id, "Your password changed. Please sign in again.");
            return Result.Success();
        }

        var error = result.Errors.First();

        return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
    }

    private void RevokeActiveSessions(ApplicationUser user, string reason)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        foreach (var token in user.RefreshTokens.Where(token => token.IsActiveAt(now)))
            token.Revoke(reason, now);
    }

    private async Task<IReadOnlyCollection<int>?> ResolveCompanyIdsAsync(
        IReadOnlyCollection<int> requestedCompanyIds,
        int defaultCompanyId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_currentActor.TenantId) ||
            string.IsNullOrWhiteSpace(_currentActor.UserId) ||
            requestedCompanyIds.Count == 0 ||
            !requestedCompanyIds.Contains(defaultCompanyId))
        {
            return null;
        }

        var companyIds = requestedCompanyIds.Distinct().ToArray();
        var assignableCompanyIds = await _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.TenantId == _currentActor.TenantId &&
                access.UserId == _currentActor.UserId &&
                access.Company.IsActive &&
                companyIds.Contains(access.CompanyId))
            .Select(access => access.CompanyId)
            .ToListAsync(cancellationToken);

        return assignableCompanyIds.Distinct().Count() == companyIds.Length
            ? companyIds
            : null;
    }

    private async Task SynchronizeCompanyAccessesAsync(
        ApplicationUser user,
        IReadOnlyCollection<int> companyIds,
        int defaultCompanyId,
        CancellationToken cancellationToken)
    {
        var existing = await _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .Where(access => access.UserId == user.Id && access.TenantId == user.TenantId)
            .ToListAsync(cancellationToken);

        var requestedIds = companyIds.ToHashSet();
        _context.UserCompanyAccesses.RemoveRange(
            existing.Where(access => !requestedIds.Contains(access.CompanyId)));

        foreach (var companyId in companyIds)
        {
            var existingAccess = existing.FirstOrDefault(access => access.CompanyId == companyId);
            if (existingAccess is not null)
            {
                existingAccess.IsDefault = companyId == defaultCompanyId;
                continue;
            }

            _context.UserCompanyAccesses.Add(new UserCompanyAccess
            {
                TenantId = user.TenantId,
                CompanyId = companyId,
                UserId = user.Id,
                IsDefault = companyId == defaultCompanyId
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<UserCompanyAccess>> GetUserCompanyAccessesAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default) =>
        await _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.UserId == userId && access.TenantId == tenantId)
            .ToArrayAsync(cancellationToken);

    private async Task<IReadOnlyList<UserResponse>> BuildUserResponsesAsync(
        IReadOnlyCollection<ApplicationUser> users,
        CancellationToken cancellationToken)
    {
        if (users.Count == 0)
            return [];

        var userIds = users.Select(user => user.Id).ToArray();
        var tenantId = _currentActor.TenantId;
        var roleRows = await (
                from userRole in _context.UserRoles.AsNoTracking()
                join role in _context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                where userIds.Contains(userRole.UserId) &&
                      (role.IsSystem || (!role.IsSystem && role.TenantId == tenantId))
                select new { userRole.UserId, RoleName = role.Name! })
            .ToArrayAsync(cancellationToken);
        var accessRows = await _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => userIds.Contains(access.UserId))
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

    private async Task<HashSet<int>> GetActorCompanyIdsAsync(
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_currentActor.TenantId) ||
            string.IsNullOrWhiteSpace(_currentActor.UserId))
        {
            return [];
        }

        return await _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.TenantId == _currentActor.TenantId &&
                access.UserId == _currentActor.UserId)
            .Select(access => access.CompanyId)
            .ToHashSetAsync(cancellationToken);
    }

    private async Task<bool> IsUserWithinActorCompanyScopeAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var actorCompanyIds = await GetActorCompanyIdsAsync(cancellationToken);
        var userCompanyIds = await _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.UserId == userId && access.TenantId == tenantId)
            .Select(access => access.CompanyId)
            .ToArrayAsync(cancellationToken);

        return IsWithinCompanyScope(userCompanyIds, actorCompanyIds);
    }

    private static bool IsWithinCompanyScope(
        IEnumerable<int> userCompanyIds,
        IReadOnlySet<int> actorCompanyIds)
    {
        var companyIds = userCompanyIds.Distinct().ToArray();
        return companyIds.Length > 0 && companyIds.All(actorCompanyIds.Contains);
    }

    private static IQueryable<ApplicationUser> ApplyUserOrdering(
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

    private static PageResponse<T> EmptyPage<T>(PaginationRequest request)
    {
        var page = new PagedList<T>([], 0, request.PageNumber, request.PageSize);
        return new PageResponse<T>(page, page.MetaData);
    }

    private static UserResponse CreateUserResponse(
        ApplicationUser user,
        IEnumerable<string> roles,
        IEnumerable<UserCompanyAccess> accesses)
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

    private static UserChangeSnapshot CreateUserChangeSnapshot(
        ApplicationUser user,
        IEnumerable<string> roles,
        IEnumerable<int> companyIds,
        int? defaultCompanyId) =>
        new(
            user.FirstName,
            user.LastName,
            user.UserName ?? string.Empty,
            user.Email ?? string.Empty,
            string.Join(',', roles.Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(role => role, StringComparer.OrdinalIgnoreCase)),
            string.Join(',', companyIds.Distinct().OrderBy(companyId => companyId)),
            defaultCompanyId);

    private sealed record UserChangeSnapshot(
        string FirstName,
        string LastName,
        string UserName,
        string Email,
        string Roles,
        string CompanyIds,
        int? DefaultCompanyId);

    private void QueueSessionRevoked(string userId, string message)
    {
        try
        {
            BackgroundJob.Enqueue<SessionRevokedJob>(
                job => job.ExecuteAsync(userId, message));
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Unable to enqueue session revocation for user {UserId}.",
                userId);
        }
    }

    private void DispatchEntityChangeLogChange(string entityId)
    {
        var tenantId = _currentActor.TenantId
            ?? throw new InvalidOperationException("A tenant is required to publish change-log updates.");
        var companyId = _currentActor.CompanyId
            ?? throw new InvalidOperationException("A company is required to publish change-log updates.");

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<EntityChangeLog>(
            RealtimeAudience.ForCompanyPermission(
                tenantId,
                companyId,
                Permissions.ViewChangeLogs),
            "Add",
            entityId));
    }

    private void QueueUserChanged(UserResponse user, string action)
    {
        var request = new UserChangedJobRequest(
            user,
            action,
            _currentActor.UserId,
            _currentActor.TenantId ?? throw new InvalidOperationException("A tenant is required to publish user changes."),
            _currentActor.CompanyId ?? throw new InvalidOperationException("A company is required to publish user changes."),
            Guid.NewGuid());

        try
        {
            BackgroundJob.Enqueue<UserChangedJob>(
                job => job.ExecuteAsync(request, CancellationToken.None));
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Unable to enqueue user change notification for user {UserId}.",
                user.Id);
        }
    }

    private void DispatchOwnUserChange(string userId, string action)
    {
        var tenantId = _currentActor.TenantId
            ?? throw new InvalidOperationException("A tenant is required to publish user changes.");
        var companyId = _currentActor.CompanyId
            ?? throw new InvalidOperationException("A company is required to publish user changes.");
        var eventId = Guid.NewGuid();

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<ApplicationUser>(
            RealtimeAudience.ForUserCompany(tenantId, companyId, userId),
            action,
            userId,
            eventId));
        realtimeChanges.Dispatch(RealtimeChangeRequest.For<ApplicationUser>(
            RealtimeAudience.ForCompanyPermission(tenantId, companyId, Permissions.ViewUsers),
            action,
            userId,
            eventId));
    }

    private string? GetProfilePicturePath(string? fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return null;

        var safeFileName = Path.GetFileName(fileName);
        if (!string.Equals(safeFileName, fileName, StringComparison.Ordinal))
            return null;

        var rootPath = Path.GetFullPath(_profilePicturesPath);
        var filePath = Path.GetFullPath(Path.Combine(rootPath, safeFileName));
        var rootPrefix = rootPath.EndsWith(Path.DirectorySeparatorChar)
            ? rootPath
            : rootPath + Path.DirectorySeparatorChar;

        return filePath.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase)
            ? filePath
            : null;
    }

    private static void DeleteFileIfExists(string? filePath)
    {
        if (filePath is not null && File.Exists(filePath))
            File.Delete(filePath);
    }

    private static string GetImageContentType(string? fileName) =>
        Path.GetExtension(fileName ?? string.Empty).ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream",
        };
}
