using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Services;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Jobs;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Jobs;

using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Errors;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using ErpSystem.Modules.Platform.Domain.Platform.EntityChangeLogs.Entities;
using ErpSystem.Modules.Platform.Domain.Security.Users.Enums;
using System.Data;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Persistence;

public sealed class UserManagementWriteStore(
    UserManager<PlatformApplicationUser> userManager,
    UserErrors userErrors,
    PlatformDbContext context,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    ILogger<UserManagementWriteStore> logger,
    ISecurityAuditService securityAudit,
    IEntityChangeLogService entityChangeLogs,
    IRealtimeChangeDispatcher realtimeChanges,
    IUserSeatLimitService seatLimits,
    TenantRoleAssignmentService roleAssignments) : IUserManagementWriteStore
{
    private readonly UserManager<PlatformApplicationUser> _userManager = userManager;
    private readonly UserErrors _userErrors = userErrors;
    private readonly PlatformDbContext _context = context;
    private readonly ICurrentActor _currentActor = currentActor;

    public async Task<Result<UserResponse>> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
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

        var user = request.Adapt<PlatformApplicationUser>();

        var result = await _userManager.CreateAsync(user, request.Password);

        if (result.Succeeded)
        {
            roleAssignments.AddAssignments(user.Id, resolvedRoles);

            _context.UserTenantAccesses.Add(new PlatformUserTenantAccess
            {
                TenantId = _currentActor.TenantId!,
                UserId = user.Id,
                IsDefault = true
            });

            foreach (var companyId in companyIds)
            {
                _context.UserCompanyAccesses.Add(new PlatformUserCompanyAccess
                {
                    TenantId = _currentActor.TenantId!,
                    CompanyId = companyId,
                    UserId = user.Id,
                    IsDefault = companyId == request.DefaultCompanyId
                });
            }
            securityAudit.Add(new SecurityAuditRequest(
                "UserCreated",
                "PlatformApplicationUser",
                user.Id,
                TenantId: _currentActor.TenantId!,
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
                companyIds.Select(companyId => new PlatformUserCompanyAccess
                {
                    TenantId = _currentActor.TenantId!,
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
                        _context.UserTenantAccesses.Any(access => access.UserId == candidate.Id && access.TenantId == _currentActor.TenantId) &&
                        candidate.LifecycleStatus == (int)UserLifecycleStatus.Active,
                    cancellationToken) is not { } user)
        {
            return Result.Failure(_userErrors.UserNotFound);
        }

        var existingRoles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, _currentActor.TenantId!, cancellationToken);
        if (existingRoles.Contains(PlatformRoleNames.SuperAdmin, StringComparer.OrdinalIgnoreCase) ||
            !await IsUserWithinActorCompanyScopeAsync(user.Id, _currentActor.TenantId!, cancellationToken))
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
            _currentActor.TenantId!,
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
                "PlatformApplicationUser",
                previousSnapshot,
                updatedSnapshot,
                cancellationToken);

            await securityAudit.RecordAsync(new SecurityAuditRequest(
                "UserUpdated",
                "PlatformApplicationUser",
                user.Id,
                TenantId: _currentActor.TenantId!,
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
                companyIds.Select(companyId => new PlatformUserCompanyAccess
                {
                    TenantId = _currentActor.TenantId!,
                    CompanyId = companyId,
                    UserId = user.Id,
                    IsDefault = companyId == request.DefaultCompanyId
                })), "Update");

            return Result.Success();
        }

        var error = result.Errors.First();

        return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
    }

    public async Task<Result> ChangePasswordAsync(
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
                        _context.UserTenantAccesses.Any(access => access.UserId == candidate.Id && access.TenantId == _currentActor.TenantId) &&
                        candidate.LifecycleStatus == (int)UserLifecycleStatus.Active,
                cancellationToken) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        if (await roleAssignments.IsSuperAdminAsync(user.Id, cancellationToken))
            return Result.Failure(_userErrors.UserNotFound);

        if (!await IsUserWithinActorCompanyScopeAsync(user.Id, _currentActor.TenantId!, cancellationToken))
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
            "PlatformApplicationUser",
            user.Id,
            TenantId: _currentActor.TenantId!), cancellationToken);
        QueueSessionRevoked(user.Id, "Your password was changed. Please sign in again.");

        return Result.Success();
    }

    public async Task<Result> ToggleStatusAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(id, _currentActor.UserId, StringComparison.Ordinal))
            return Result.Failure(_userErrors.CannotManageOwnAccount);

        if (await _userManager.Users
                .Include(candidate => candidate.RefreshTokens)
                .SingleOrDefaultAsync(
                    candidate => candidate.Id == id &&
                        _context.UserTenantAccesses.Any(access => access.UserId == candidate.Id && access.TenantId == _currentActor.TenantId) &&
                        candidate.LifecycleStatus == (int)UserLifecycleStatus.Active,
                    cancellationToken) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        if (await roleAssignments.IsSuperAdminAsync(user.Id, cancellationToken))
            return Result.Failure(_userErrors.UserNotFound);

        if (!await IsUserWithinActorCompanyScopeAsync(user.Id, _currentActor.TenantId!, cancellationToken))
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
                "PlatformApplicationUser",
                user.Id,
                TenantId: _currentActor.TenantId!), cancellationToken);
            if (user.IsDisabled)
            {
                QueueSessionRevoked(user.Id, "Your account has been disabled.");
            }

            var roles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, _currentActor.TenantId!, cancellationToken);
            var accesses = await GetUserCompanyAccessesAsync(user.Id, _currentActor.TenantId!, cancellationToken);
            QueueUserChanged(
                CreateUserResponse(user, roles, accesses),
                user.IsDisabled ? "Disable" : "Enable");

            return Result.Success();
        }

        var error = result.Errors.First();
        return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
    }

    public async Task<Result> UnlockAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(id, _currentActor.UserId, StringComparison.Ordinal))
            return Result.Failure(_userErrors.CannotManageOwnAccount);

        if (await _userManager.Users.SingleOrDefaultAsync(
                candidate => candidate.Id == id &&
                    _context.UserTenantAccesses.Any(access => access.UserId == candidate.Id && access.TenantId == _currentActor.TenantId) &&
                    candidate.LifecycleStatus == (int)UserLifecycleStatus.Active,
                cancellationToken) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        if (await roleAssignments.IsSuperAdminAsync(user.Id, cancellationToken))
            return Result.Failure(_userErrors.UserNotFound);

        if (!await IsUserWithinActorCompanyScopeAsync(user.Id, _currentActor.TenantId!, cancellationToken))
            return Result.Failure(_userErrors.UserNotFound);

        // Clear the lockout end date
        var lockoutResult = await _userManager.SetLockoutEndDateAsync(user, null);
        if (!lockoutResult.Succeeded)
        {
            var error = lockoutResult.Errors.First();
            return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
        }

        var roles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, _currentActor.TenantId!, cancellationToken);
        var accesses = await GetUserCompanyAccessesAsync(user.Id, _currentActor.TenantId!, cancellationToken);
        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "UserUnlocked",
            "PlatformApplicationUser",
            user.Id,
            TenantId: _currentActor.TenantId!), cancellationToken);
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
                    _context.UserTenantAccesses.Any(access => access.UserId == candidate.Id && access.TenantId == _currentActor.TenantId) &&
                    candidate.LifecycleStatus == (int)UserLifecycleStatus.Active,
                cancellationToken);
        if (user is null ||
            await roleAssignments.IsSuperAdminAsync(user.Id, cancellationToken) ||
            !await IsUserWithinActorCompanyScopeAsync(user.Id, _currentActor.TenantId!, cancellationToken))
        {
            return Result.Failure(_userErrors.UserNotFound);
        }

        var roles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, _currentActor.TenantId!, cancellationToken);
        var accesses = await GetUserCompanyAccessesAsync(user.Id, _currentActor.TenantId!, cancellationToken);
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
            "PlatformApplicationUser",
            user.Id,
            TenantId: _currentActor.TenantId!,
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
                    _context.UserTenantAccesses.Any(access => access.UserId == candidate.Id && access.TenantId == _currentActor.TenantId) &&
                    candidate.LifecycleStatus == (int)UserLifecycleStatus.Archived,
                cancellationToken);
        if (user is null ||
            await roleAssignments.IsSuperAdminAsync(user.Id, cancellationToken) ||
            !await IsUserWithinActorCompanyScopeAsync(user.Id, _currentActor.TenantId!, cancellationToken))
        {
            return Result.Failure(_userErrors.UserNotFound);
        }

        var roles = await roleAssignments.GetScopedRoleNamesAsync(user.Id, _currentActor.TenantId!, cancellationToken);
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
            "PlatformApplicationUser",
            user.Id,
            TenantId: _currentActor.TenantId!), cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var accesses = await GetUserCompanyAccessesAsync(user.Id, _currentActor.TenantId!, cancellationToken);
        QueueUserChanged(CreateUserResponse(user, roles, accesses), "Restore");
        return Result.Success();
    }

    private void RevokeActiveSessions(PlatformApplicationUser user, string reason)
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
        PlatformApplicationUser user,
        IReadOnlyCollection<int> companyIds,
        int defaultCompanyId,
        CancellationToken cancellationToken)
    {
        var existing = await _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .Where(access => access.UserId == user.Id && access.TenantId == _currentActor.TenantId)
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

            _context.UserCompanyAccesses.Add(new PlatformUserCompanyAccess
            {
                TenantId = _currentActor.TenantId!,
                CompanyId = companyId,
                UserId = user.Id,
                IsDefault = companyId == defaultCompanyId
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<PlatformUserCompanyAccess>> GetUserCompanyAccessesAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default) =>
        await _context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.UserId == userId && access.TenantId == tenantId)
            .ToArrayAsync(cancellationToken);

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
            UserLifecycleStatusContract.FromStoredValue(user.LifecycleStatus),
            user.ArchivedOn,
            user.ArchiveReason);
    }

    private static UserChangeSnapshot CreateUserChangeSnapshot(
        PlatformApplicationUser user,
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
                PlatformPermissions.ViewChangeLogs),
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

}
