using HrManagementSystem.Application.Features.Security.Users.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Jobs;
using HrManagementSystem.Infrastructure.Features.Security.Users.Jobs;

using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Application.Features.Security.Authorization.Services;
using HrManagementSystem.Application.Features.Security.Users.Contracts;
using HrManagementSystem.Application.Features.Security.Users.Errors;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Files;
using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Features.Security.Users.Services;

public class UserService(
    UserManager<ApplicationUser> userManager,
    IRoleService roleService,
    UserErrors userErrors,
    ApplicationDbContext context,
    ICurrentActor currentActor,
    IWebHostEnvironment webHostEnvironment,
    TimeProvider timeProvider,
    ILogger<UserService> logger,
    IRealtimeChangeDispatcher realtimeChanges) : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly IRoleService _roleService = roleService;
    private readonly UserErrors _userErrors = userErrors;
    private readonly ApplicationDbContext _context = context;
    private readonly ICurrentActor _currentActor = currentActor;
    private readonly string _profilePicturesPath = Path.Combine(
        webHostEnvironment.WebRootPath ?? Path.Combine(webHostEnvironment.ContentRootPath, "wwwroot"),
        "profile-pictures");

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
            .Where(user => user.TenantId == tenantId)
            .Select(user => new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                user.IsDisabled,
                IsLocked = user.LockoutEnd.HasValue && user.LockoutEnd > now,
                user.ProfilePicture
            })
            .ToListAsync(cancellationToken);

        if (users.Count == 0)
            return [];

        var userIds = users.Select(user => user.Id).ToArray();
        var roleRows = await (
                from userRole in _context.UserRoles
                join role in _context.Roles on userRole.RoleId equals role.Id
                where userIds.Contains(userRole.UserId)
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
                    accesses.FirstOrDefault(access => access.IsDefault)?.CompanyId);
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
                candidate => candidate.Id == id && candidate.TenantId == _currentActor.TenantId) is not { } user)
            return Result.Failure<UserResponse>(_userErrors.UserNotFound);

        var userRoles = await _userManager.GetRolesAsync(user);
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

        var allowedRoles = await _roleService.GetAllAsync(cancellationToken);

        if (request.Roles.Except(allowedRoles.Select(x => x.Name)).Any())
            return Result.Failure<UserResponse>(_userErrors.InvalidRoles);

        if (await GetSeatLimitErrorAsync(request.Roles, cancellationToken) is { } seatLimitError)
            return Result.Failure<UserResponse>(seatLimitError);

        var user = request.Adapt<ApplicationUser>();
        user.TenantId = _currentActor.TenantId;

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        var result = await _userManager.CreateAsync(user, request.Password);

        if (result.Succeeded)
        {
            var roleResult = await _userManager.AddToRolesAsync(user, request.Roles);
            if (!roleResult.Succeeded)
            {
                var roleError = roleResult.Errors.First();
                return Result.Failure<UserResponse>(
                    new Error(roleError.Code, roleError.Description, ErrorType.Validation));
            }

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
                    candidate => candidate.Id == id && candidate.TenantId == _currentActor.TenantId,
                    cancellationToken) is not { } user)
        {
            return Result.Failure(_userErrors.UserNotFound);
        }

        var existingRoles = await _userManager.GetRolesAsync(user);
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

        var allowedRoles = await _roleService.GetAllAsync(cancellationToken);

        if (request.Roles.Except(allowedRoles.Select(x => x.Name)).Any())
            return Result.Failure(_userErrors.InvalidRoles);

        var companyIds = await ResolveCompanyIdsAsync(
            request.CompanyIds,
            request.DefaultCompanyId,
            cancellationToken: cancellationToken);
        if (companyIds is null)
            return Result.Failure(_userErrors.InvalidCompanySelection);

        var addedRoles = request.Roles
            .Except(existingRoles, StringComparer.OrdinalIgnoreCase)
            .ToArray();
        if (await GetSeatLimitErrorAsync(addedRoles, cancellationToken) is { } seatLimitError)
            return Result.Failure(seatLimitError);

        user = request.Adapt(user);

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            await _context.UserRoles
                .Where(x => x.UserId == id)
                .ExecuteDeleteAsync(cancellationToken);

            var roleResult = await _userManager.AddToRolesAsync(user, request.Roles);
            if (!roleResult.Succeeded)
            {
                var roleError = roleResult.Errors.First();
                return Result.Failure(
                    new Error(roleError.Code, roleError.Description, ErrorType.Validation));
            }

            await SynchronizeCompanyAccessesAsync(
                user,
                companyIds,
                request.DefaultCompanyId,
                cancellationToken);

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

            await transaction.CommitAsync(cancellationToken);
            QueueSessionRevoked(
                user.Id,
                "Your account permissions changed. Please sign in again.");
            QueueUserChanged(CreateUserResponse(
                user,
                request.Roles,
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
                    candidate => candidate.Id == id && candidate.TenantId == _currentActor.TenantId,
                cancellationToken) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        if (await _userManager.IsInRoleAsync(user, AppRoles.super_admin))
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
                    candidate => candidate.Id == id && candidate.TenantId == _currentActor.TenantId) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        if (await _userManager.IsInRoleAsync(user, AppRoles.super_admin))
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
            if (user.IsDisabled)
            {
                QueueSessionRevoked(user.Id, "Your account has been disabled.");
            }

            var roles = await _userManager.GetRolesAsync(user);
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
                candidate => candidate.Id == id && candidate.TenantId == _currentActor.TenantId) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        if (await _userManager.IsInRoleAsync(user, AppRoles.super_admin))
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

        var roles = await _userManager.GetRolesAsync(user);
        var accesses = await GetUserCompanyAccessesAsync(user.Id, user.TenantId);
        QueueUserChanged(CreateUserResponse(user, roles, accesses), "Unlock");

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
            companyAccesses.FirstOrDefault(access => access.IsDefault)?.CompanyId);
    }

    private async Task<Error?> GetSeatLimitErrorAsync(
        IEnumerable<string> roles,
        CancellationToken cancellationToken)
    {
        var needsAdminSeat = roles.Contains(AppRoles.admin, StringComparer.OrdinalIgnoreCase);
        var needsUserSeat = roles.Contains(AppRoles.user, StringComparer.OrdinalIgnoreCase);
        if (!needsAdminSeat && !needsUserSeat)
            return null;

        var tenantId = _currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(tenantId))
            return _userErrors.InvalidCompanySelection;

        var limits = await _context.Tenants
            .AsNoTracking()
            .Where(tenant => tenant.Id == tenantId)
            .Select(tenant => new { tenant.MaxAdmins, tenant.MaxUsers })
            .SingleOrDefaultAsync(cancellationToken);
        if (limits is null)
            return _userErrors.InvalidCompanySelection;

        var counts = await (
            from user in _context.Users.AsNoTracking()
            join userRole in _context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
            join role in _context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            where user.TenantId == tenantId &&
                  (role.NormalizedName == AppRoles.admin.ToUpper() ||
                   role.NormalizedName == AppRoles.user.ToUpper())
            group user by role.NormalizedName
            into roleGroup
            select new
            {
                Role = roleGroup.Key,
                Count = roleGroup.Select(user => user.Id).Distinct().Count()
            }).ToDictionaryAsync(item => item.Role!, item => item.Count, cancellationToken);

        if (needsAdminSeat &&
            counts.GetValueOrDefault(AppRoles.admin.ToUpper()) >= limits.MaxAdmins)
        {
            return _userErrors.AdminSeatLimitReached;
        }

        if (needsUserSeat &&
            counts.GetValueOrDefault(AppRoles.user.ToUpper()) >= limits.MaxUsers)
        {
            return _userErrors.UserSeatLimitReached;
        }

        return null;
    }

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
