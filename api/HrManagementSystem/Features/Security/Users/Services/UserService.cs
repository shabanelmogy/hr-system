using HrManagementSystem.Infrastructure.Hubs.GeneralHub;

namespace HrManagementSystem.Features.Security.Users.Services;

public class UserService(
    UserManager<ApplicationUser> userManager,
    IRoleService roleService,
    UserErrors userErrors,
    IDashboardService dashboardService,
    IHubContext<GeneralHub, IGeneralHubClient> companyHubContext,
    ApplicationDbContext context,
    IWebHostEnvironment webHostEnvironment) : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly IRoleService _roleService = roleService;
    private readonly UserErrors _userErrors = userErrors;
    private readonly IDashboardService _dashboardService = dashboardService;
    private readonly IHubContext<GeneralHub, IGeneralHubClient> _companyHubContext = companyHubContext;
    private readonly ApplicationDbContext _context = context;
    private readonly string _profilePicturesPath = Path.Combine(
        webHostEnvironment.WebRootPath ?? Path.Combine(webHostEnvironment.ContentRootPath, "wwwroot"),
        "profile-pictures");

    public async Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await (from u in _context.Users
               join ur in _context.UserRoles
               on u.Id equals ur.UserId
               join r in _context.Roles
               on ur.RoleId equals r.Id into roles
               select new
               {
                   u.Id,
                   u.FirstName,
                   u.LastName,
                   u.UserName,
                   u.Email,
                   u.IsDisabled,
                   IsLocked = u.LockoutEnd.HasValue && u.LockoutEnd > DateTimeOffset.UtcNow,
                   u.ProfilePicture,
                   Roles = roles.Select(x => x.Name!).ToList()
               }
               ).GroupBy(u => new { u.Id, u.FirstName, u.LastName, u.UserName, u.Email, u.IsDisabled, u.IsLocked, u.ProfilePicture })
                .Select(u => new UserResponse(
                    u.Key.Id,
                    u.Key.FirstName,
                    u.Key.LastName,
                    u.Key.UserName,
                    u.Key.Email,
                    u.Key.IsDisabled,
                    u.Key.IsLocked,
                    u.Key.ProfilePicture,
                    u.SelectMany(x => x.Roles)
                )).ToListAsync(cancellationToken);

    public async Task<Result<UserResponse>> GetAsync(string id)
    {
        if (await _userManager.FindByIdAsync(id) is not { } user)
            return Result.Failure<UserResponse>(_userErrors.UserNotFound);

        var userRoles = await _userManager.GetRolesAsync(user);

        var response = (user, userRoles).Adapt<UserResponse>();

        return Result.Success(response);
    }

    public async Task<Result<UserResponse>> AddAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        var emailIsExists = await _userManager.Users.AnyAsync(x => x.Email == request.Email, cancellationToken);

        if (emailIsExists)
            return Result.Failure<UserResponse>(_userErrors.DuplicatedEmail);

        var userNameIsExists = await _userManager.Users.AnyAsync(x => x.UserName == request.UserName, cancellationToken);

        if (userNameIsExists)
            return Result.Failure<UserResponse>(_userErrors.DuplicatedUserName);

        var allowedRoles = await _roleService.GetAllAsync(cancellationToken);

        if (request.Roles.Except(allowedRoles.Select(x => x.Name)).Any())
            return Result.Failure<UserResponse>(_userErrors.InvalidRoles);

        var user = request.Adapt<ApplicationUser>();

        var result = await _userManager.CreateAsync(user, request.Password);

        if (result.Succeeded)
        {
            await _userManager.AddToRolesAsync(user, request.Roles);

            var response = (user, request.Roles).Adapt<UserResponse>();

            var usersCount = await _dashboardService.GetUsersCountAsync(cancellationToken);

            await _companyHubContext.Clients.All.ReceiveUserUpdate(usersCount);

            return Result.Success(response);
        }

        var error = result.Errors.First();

        return Result.Failure<UserResponse>(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }

    public async Task<Result> UpdateAsync(string id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var emailIsExists = await _userManager.Users.AnyAsync(x => x.Email == request.Email && x.Id != id, cancellationToken);

        if (emailIsExists)
            return Result.Failure(_userErrors.DuplicatedEmail);

        var userNameIsExists = await _userManager.Users.AnyAsync(x => x.UserName == request.UserName && x.Id != id, cancellationToken);

        if (userNameIsExists)
            return Result.Failure<UserResponse>(_userErrors.DuplicatedUserName);

        var allowedRoles = await _roleService.GetAllAsync(cancellationToken);

        if (request.Roles.Except(allowedRoles.Select(x => x.Name)).Any())
            return Result.Failure(_userErrors.InvalidRoles);

        if (await _userManager.Users
                .Include(candidate => candidate.RefreshTokens)
                .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        user = request.Adapt(user);

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            await _context.UserRoles
                .Where(x => x.UserId == id)
                .ExecuteDeleteAsync(cancellationToken);

            await _userManager.AddToRolesAsync(user, request.Roles);

            await _userManager.UpdateSecurityStampAsync(user);
            RevokeActiveSessions(user, "Account permissions changed");
            await _userManager.UpdateAsync(user);
            await _companyHubContext.Clients.User(user.Id)
                .ReceiveTokenRevoked("Your account permissions changed. Please sign in again.");

            return Result.Success();
        }

        var error = result.Errors.First();

        return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }

    public async Task<Result> ChangeUserPasswordAsync(
        string id,
        ChangeUserPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        if (await _userManager.Users
                .Include(candidate => candidate.RefreshTokens)
                .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);

        if (!result.Succeeded)
        {
            var error = result.Errors.First();
            return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
        }

        RevokeActiveSessions(user, "Password changed by an administrator");
        await _companyHubContext.Clients.User(user.Id)
            .ReceiveTokenRevoked("Your password was changed. Please sign in again.");

        return Result.Success();
    }

    public async Task<Result> ToggleStatus(string id)
    {
        if (await _userManager.Users
                .Include(candidate => candidate.RefreshTokens)
                .SingleOrDefaultAsync(candidate => candidate.Id == id) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        user.IsDisabled = !user.IsDisabled;

        if (user.IsDisabled)
            RevokeActiveSessions(user, "Account disabled");

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            if (user.IsDisabled)
            {
                await _companyHubContext.Clients.User(user.Id)
                    .ReceiveTokenRevoked("Your account has been disabled.");
            }

            return Result.Success();
        }

        var error = result.Errors.First();
        return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }

    public async Task<Result> Unlock(string id)
    {
        if (await _userManager.FindByIdAsync(id) is not { } user)
            return Result.Failure(_userErrors.UserNotFound);

        // Clear the lockout end date
        var lockoutResult = await _userManager.SetLockoutEndDateAsync(user, null);
        if (!lockoutResult.Succeeded)
        {
            var error = lockoutResult.Errors.First();
            return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
        }

        // Set IsLocked to false
        user.IsLocked = false;
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var error = updateResult.Errors.First();
            return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
        }

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
            await using var stream = File.Create(filePath);
            await request.ProfilePicture.CopyToAsync(stream, cancellationToken);

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
            await _companyHubContext.Clients.User(user.Id)
                .ReceiveTokenRevoked("Your password changed. Please sign in again.");
            return Result.Success();
        }

        var error = result.Errors.First();

        return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }

    private static void RevokeActiveSessions(ApplicationUser user, string reason)
    {
        foreach (var token in user.RefreshTokens.Where(token => token.IsActive))
            token.Revoke(reason);
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
