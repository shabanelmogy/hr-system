using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Application.Features.Security.Authentication.Contracts;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Jobs;

using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Application.Features.Security.Users.Errors;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Domain.Tenancy.Enums;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtProvider jwtProvider,
    UserErrors userErrors,
    IAuthEmailService emailService,
    ILoginAuditService loginAudit,
    ICurrentActor currentActor,
    ApplicationDbContext context,
    TimeProvider timeProvider,
    IWebHostEnvironment webHostEnvironment) : IAuthService
{
    private const int RefreshTokenLifetimeDays = 14;
    private const int MaxInactiveTokenHistory = 50;
    private static readonly TimeSpan InactiveTokenRetention = TimeSpan.FromHours(1);
    private static readonly TimeSpan RotatedTokenReuseGracePeriod = TimeSpan.FromSeconds(30);
    private readonly string _profilePicturesPath = Path.Combine(
        webHostEnvironment.WebRootPath ?? Path.Combine(webHostEnvironment.ContentRootPath, "wwwroot"),
        "profile-pictures");

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------

    public async Task<Result<LoginResult>> GetTokenAsync(
        string userName,
        string password,
        CancellationToken cancellationToken)
    {
        // Load user with refresh tokens in one query — avoids the previous double-load
        var user = await userManager.Users
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(
                u => u.NormalizedUserName == userName.ToUpper() || u.NormalizedEmail == userName.ToUpper(),
                cancellationToken);

        if (user is null)
            return Result.Failure<LoginResult>(userErrors.InvalidCredentials);

        if (user.IsDisabled)
            return Result.Failure<LoginResult>(userErrors.DisabledUser);

        var signInResult = await signInManager.CheckPasswordSignInAsync(
            user,
            password,
            lockoutOnFailure: true);

        if (!signInResult.Succeeded)
        {
            var error = signInResult.IsNotAllowed
                ? userErrors.EmailNotConfirmed
                : signInResult.IsLockedOut
                    ? userErrors.LockedUser
                    : userErrors.InvalidCredentials;

            return Result.Failure<LoginResult>(error);
        }

        return await CreateLoginResultAsync(user, cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Google Login
    // -------------------------------------------------------------------------

    public async Task<Result<LoginResult>> LoginWithGoogleAsync(
        ExternalLoginUser externalUser,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(externalUser.Email) ||
            string.IsNullOrWhiteSpace(externalUser.ProviderKey))
            return Result.Failure<LoginResult>(userErrors.InvalidCredentials);

        var user = await FindOrCreateGoogleUserAsync(externalUser, cancellationToken);
        if (user is null)
            return Result.Failure<LoginResult>(userErrors.InvalidCredentials);

        if (user.IsDisabled)
            return Result.Failure<LoginResult>(userErrors.DisabledUser);

        var linkResult = await EnsureGoogleLoginLinkedAsync(user, externalUser.ProviderKey);
        if (!linkResult)
            return Result.Failure<LoginResult>(userErrors.InvalidCredentials);

        return await CreateLoginResultAsync(user, cancellationToken);
    }

    public async Task<Result<AuthResponse>> SelectCompanyAsync(
        SelectCompanyRequest request,
        CancellationToken cancellationToken)
    {
        var selection = jwtProvider.ValidateCompanySelectionToken(request.CompanySelectionToken);
        if (selection is null)
            return Result.Failure<AuthResponse>(userErrors.InvalidCompanySelection);

        var user = await userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(candidate => candidate.Id == selection.UserId, cancellationToken);

        if (user is null ||
            user.IsDisabled ||
            user.LockoutEnd > timeProvider.GetUtcNow() ||
            !string.Equals(user.TenantId, selection.TenantId, StringComparison.Ordinal) ||
            !string.Equals(user.SecurityStamp, selection.SecurityStamp, StringComparison.Ordinal))
        {
            return Result.Failure<AuthResponse>(userErrors.InvalidCompanySelection);
        }

        if (!await CanTenantSignInAsync(user.TenantId, cancellationToken))
            return Result.Failure<AuthResponse>(userErrors.InvalidCompanySelection);

        var canAccess = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AnyAsync(access =>
                access.UserId == user.Id &&
                access.TenantId == user.TenantId &&
                access.CompanyId == request.CompanyId &&
                access.Company.IsActive,
                cancellationToken);

        return canAccess
            ? await IssueSessionAsync(user, request.CompanyId, cancellationToken)
            : Result.Failure<AuthResponse>(userErrors.InvalidCompanySelection);
    }

    // -------------------------------------------------------------------------
    // Logout
    // -------------------------------------------------------------------------

    public async Task<Result> LogOutAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return Result.Success();

        var tokenHash = RefreshTokenProtector.Hash(refreshToken);
        var user = await userManager.Users
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(
                u => u.RefreshTokens.Any(t => t.TokenHash == tokenHash),
                cancellationToken);

        if (user is null)
            return Result.Success();

        var storedToken = user.RefreshTokens.Single(t => t.TokenHash == tokenHash);
        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (storedToken.IsActiveAt(now))
            storedToken.Revoke("Signed out", now);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure(userErrors.SessionRevocationFailed);

        await loginAudit.RecordLogoutAsync(user.Id, storedToken.CompanyId, cancellationToken);

        return Result.Success();
    }

    // -------------------------------------------------------------------------
    // Refresh Token
    // -------------------------------------------------------------------------

    public async Task<Result<AuthResponse>> GetRefreshTokenAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.RefreshToken))
            return Result.Failure<AuthResponse>(userErrors.InvalidJwtToken);

        var validatedAccessToken = jwtProvider.ValidateExpiredAccessToken(request.Token);
        if (validatedAccessToken is null)
            return Result.Failure<AuthResponse>(userErrors.InvalidJwtToken);

        var user = await FindUserWithTokensAsync(validatedAccessToken.UserId, cancellationToken);
        if (user is null)
            return Result.Failure<AuthResponse>(userErrors.InvalidJwtToken);

        if (user.IsDisabled)
            return Result.Failure<AuthResponse>(userErrors.DisabledUser);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (user.LockoutEnd > new DateTimeOffset(now, TimeSpan.Zero))
            return Result.Failure<AuthResponse>(userErrors.LockedUser);

        var tokenHash = RefreshTokenProtector.Hash(request.RefreshToken);
        var storedToken = user.RefreshTokens.SingleOrDefault(t => t.TokenHash == tokenHash);
        if (storedToken is null)
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);

        var claimsMatchSession =
            string.Equals(storedToken.SessionId, validatedAccessToken.SessionId, StringComparison.Ordinal) &&
            string.Equals(storedToken.JwtId, validatedAccessToken.JwtId, StringComparison.Ordinal) &&
            storedToken.CompanyId == validatedAccessToken.CompanyId &&
            string.Equals(user.SecurityStamp, validatedAccessToken.SecurityStamp, StringComparison.Ordinal) &&
            string.Equals(user.TenantId, validatedAccessToken.TenantId, StringComparison.Ordinal);

        if (!claimsMatchSession)
        {
            storedToken.Revoke("Token claims mismatch", now);
            await userManager.UpdateAsync(user);
            QueueSessionRevoked(user.Id, "Your session was revoked due to security validation failure.");
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);
        }

        if (!storedToken.IsActiveAt(now))
            return await HandleInactiveRefreshTokenAsync(user, storedToken);

        var hasCompanyAccess = await HasCompanyAccessAsync(
            user.Id,
            user.TenantId,
            storedToken.CompanyId,
            cancellationToken);
        if (!hasCompanyAccess)
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);

        var accessToken = await jwtProvider.GenerateAccessTokenAsync(
            user,
            storedToken.SessionId,
            storedToken.CompanyId);
        var replacement = RefreshTokenProtector.Rotate(
            storedToken,
            accessToken.JwtId,
            now,
            CurrentIpAddress,
            CurrentUserAgent);

        user.RefreshTokens.Add(replacement.Token);
        PruneOldTokens(user);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure<AuthResponse>(userErrors.RefreshTokenUpdateConflict);

        return Result.Success(CreateAuthResponse(
            user,
            storedToken.CompanyId,
            accessToken,
            replacement.RawToken,
            replacement.Token.ExpiresOn));
    }

    // -------------------------------------------------------------------------
    // Session Revocation
    // -------------------------------------------------------------------------

    public async Task<Result> RevokeRefreshTokenByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(userId, currentActor.UserId, StringComparison.Ordinal))
            return Result.Failure(userErrors.CannotManageOwnAccount);

        var tenantId = currentActor.TenantId;
        var user = string.IsNullOrWhiteSpace(tenantId)
            ? null
            : await userManager.Users
                .Include(candidate => candidate.RefreshTokens)
                .SingleOrDefaultAsync(
                    candidate => candidate.Id == userId && candidate.TenantId == tenantId,
                    cancellationToken);

        if (user is null)
            return Result.Failure(userErrors.UserNotFound);

        if (await userManager.IsInRoleAsync(user, AppRoles.super_admin))
            return Result.Failure(userErrors.UserNotFound);

        if (!await IsUserWithinActorCompanyScopeAsync(user.Id, tenantId!, cancellationToken))
            return Result.Failure(userErrors.UserNotFound);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        foreach (var token in user.RefreshTokens.Where(token => token.IsActiveAt(now)))
            token.Revoke("Revoked by an administrator", now);

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result.Failure(userErrors.UpdateFailed);

        QueueSessionRevoked(user.Id, "Your session has been revoked by an administrator.");
        return Result.Success();
    }

    private async Task<bool> IsUserWithinActorCompanyScopeAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentActor.UserId))
            return false;

        var actorCompanyIds = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.TenantId == tenantId &&
                access.UserId == currentActor.UserId)
            .Select(access => access.CompanyId)
            .ToHashSetAsync(cancellationToken);
        var userCompanyIds = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.TenantId == tenantId && access.UserId == userId)
            .Select(access => access.CompanyId)
            .Distinct()
            .ToArrayAsync(cancellationToken);

        return userCompanyIds.Length > 0 && userCompanyIds.All(actorCompanyIds.Contains);
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    public async Task<Result> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = request.Adapt<ApplicationUser>();
        user.TenantId = TenantDefaults.DefaultId;
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return Result.Failure(IdentityFailure(result));

        await AssignDefaultCompanyAsync(user, cancellationToken);

        if (!string.IsNullOrEmpty(request.ProfilePicture))
            await SaveProfilePictureAsync(user, request.ProfilePicture, cancellationToken);

        var code = await userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        emailService.SendConfirmationEmail(user, code);
        return Result.Success();
    }

    // -------------------------------------------------------------------------
    // Email Confirmation
    // -------------------------------------------------------------------------

    public async Task<Result> ConfirmEmailAsync(
        ConfirmEmailRequest request,
        CancellationToken cancellationToken)
    {
        if (await userManager.FindByIdAsync(request.UserId) is not { } user)
            return Result.Failure(userErrors.InvalidCode);

        if (user.EmailConfirmed)
            return Result.Failure(userErrors.DuplicatedConfirmation);

        string code;
        try
        {
            code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Code));
        }
        catch (FormatException)
        {
            return Result.Failure(userErrors.InvalidCode);
        }

        var result = await userManager.ConfirmEmailAsync(user, code);
        if (!result.Succeeded)
            return Result.Failure(IdentityFailure(result));

        var roleResult = await userManager.AddToRoleAsync(user, AppRoles.user);
        return roleResult.Succeeded
            ? Result.Success()
            : Result.Failure(IdentityFailure(roleResult));
    }

    public async Task<Result> ResendConfirmationEmailAsync(
        ResendConfirmationEmailRequest request,
        CancellationToken cancellationToken)
    {
        if (await userManager.FindByEmailAsync(request.Email) is not { } user)
            return Result.Success();

        if (user.EmailConfirmed)
            return Result.Failure(userErrors.DuplicatedConfirmation);

        var code = await userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        emailService.SendConfirmationEmail(user, code);
        return Result.Success();
    }

    // -------------------------------------------------------------------------
    // Password Reset
    // -------------------------------------------------------------------------

    public async Task<Result> SendResetPasswordCodeAsync(
        string email,
        CancellationToken cancellationToken)
    {
        if (await userManager.FindByEmailAsync(email) is not { } user)
            return Result.Success();

        if (!user.EmailConfirmed)
            return Result.Failure(userErrors.EmailNotConfirmed);

        var code = await userManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        emailService.SendResetPasswordEmail(user, code);
        return Result.Success();
    }

    public async Task<Result> ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.Users
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(u => u.NormalizedEmail == request.Email.ToUpper(), cancellationToken);

        if (user is null || !user.EmailConfirmed)
            return Result.Failure(userErrors.InvalidCode);

        IdentityResult resetResult;
        try
        {
            var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Code));
            resetResult = await userManager.ResetPasswordAsync(user, code, request.NewPassword);
        }
        catch (FormatException)
        {
            resetResult = IdentityResult.Failed(userManager.ErrorDescriber.InvalidToken());
        }

        if (!resetResult.Succeeded)
            return Result.Failure(new Error(
                resetResult.Errors.First().Code,
                resetResult.Errors.First().Description,
                ErrorType.Validation));

        RevokeAllSessions(user, "Password was reset");
        await userManager.UpdateAsync(user);
        QueueSessionRevoked(user.Id, "Your password was reset. Please sign in again.");
        return Result.Success();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private async Task<ApplicationUser?> FindOrCreateGoogleUserAsync(
        ExternalLoginUser externalUser,
        CancellationToken cancellationToken)
    {
        var user = await userManager.Users
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(
                u => u.NormalizedEmail == externalUser.Email.ToUpper(),
                cancellationToken);

        if (user is not null)
            return user;

        user = new ApplicationUser
        {
            TenantId = TenantDefaults.DefaultId,
            UserName = externalUser.Email,
            Email = externalUser.Email,
            FirstName = externalUser.FirstName,
            LastName = externalUser.LastName,
            EmailConfirmed = true
        };

        var createResult = await userManager.CreateAsync(user);
        if (!createResult.Succeeded)
            return null;

        await AssignDefaultCompanyAsync(user, cancellationToken);

        var roleResult = await userManager.AddToRoleAsync(user, AppRoles.user);
        return roleResult.Succeeded ? user : null;
    }

    private async Task<bool> EnsureGoogleLoginLinkedAsync(ApplicationUser user, string providerKey)
    {
        var existingLogins = await userManager.GetLoginsAsync(user);
        if (existingLogins.Any(l => l.LoginProvider == "Google" && l.ProviderKey == providerKey))
            return true;

        var result = await userManager.AddLoginAsync(user, new UserLoginInfo("Google", providerKey, "Google"));
        return result.Succeeded;
    }

    private async Task<Result<AuthResponse>> IssueSessionAsync(
        ApplicationUser user,
        int companyId,
        CancellationToken cancellationToken)
    {
        var sessionId = Guid.NewGuid().ToString("N");
        var accessToken = await jwtProvider.GenerateAccessTokenAsync(user, sessionId, companyId);
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var refreshToken = RefreshTokenProtector.Issue(
            sessionId,
            accessToken.JwtId,
            companyId,
            now,
            now.AddDays(RefreshTokenLifetimeDays),
            CurrentIpAddress,
            CurrentUserAgent);

        PruneOldTokens(user);
        user.RefreshTokens.Add(refreshToken.Token);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure<AuthResponse>(userErrors.UpdateFailed);

        await loginAudit.RecordLoginAsync(user.Id, companyId, cancellationToken);
        return Result.Success(CreateAuthResponse(
            user,
            companyId,
            accessToken,
            refreshToken.RawToken,
            refreshToken.Token.ExpiresOn));
    }

    private async Task<Result<LoginResult>> CreateLoginResultAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        if (!await CanTenantSignInAsync(user.TenantId, cancellationToken))
            return Result.Failure<LoginResult>(userErrors.NoCompanyAccess);

        var companies = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.UserId == user.Id &&
                access.TenantId == user.TenantId &&
                access.Company.IsActive)
            .OrderByDescending(access => access.IsDefault)
            .ThenBy(access => access.Company.NameEn)
            .Select(access => new CompanyOptionResponse(
                access.CompanyId,
                access.Company.NameAr,
                access.Company.NameEn))
            .ToListAsync(cancellationToken);

        if (companies.Count == 0)
            return Result.Failure<LoginResult>(userErrors.NoCompanyAccess);

        if (companies.Count == 1)
        {
            var session = await IssueSessionAsync(user, companies[0].Id, cancellationToken);
            return session.IsSuccess
                ? Result.Success<LoginResult>(new AuthenticatedLoginResult(session.Value))
                : Result.Failure<LoginResult>(session.Error);
        }

        var selectionToken = jwtProvider.GenerateCompanySelectionToken(user);
        var response = new CompanySelectionRequiredResponse(
            IsAuthenticated: false,
            RequiresCompanySelection: true,
            selectionToken.Token,
            selectionToken.ExpiresAt,
            companies);

        return Result.Success<LoginResult>(new CompanySelectionLoginResult(response));
    }

    private async Task<bool> HasCompanyAccessAsync(
        string userId,
        string tenantId,
        int companyId,
        CancellationToken cancellationToken)
    {
        if (!await CanTenantSignInAsync(tenantId, cancellationToken))
            return false;

        return await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AnyAsync(access =>
                access.UserId == userId &&
                access.TenantId == tenantId &&
                access.CompanyId == companyId &&
                access.Company.IsActive,
                cancellationToken);
    }

    private Task<bool> CanTenantSignInAsync(
        string tenantId,
        CancellationToken cancellationToken)
    {
        return context.Tenants
            .AsNoTracking()
            .AnyAsync(
                tenant =>
                    tenant.Id == tenantId &&
                    tenant.IsActive &&
                    tenant.SubscriptionStatus != SubscriptionStatus.Suspended &&
                    tenant.SubscriptionStatus != SubscriptionStatus.Cancelled,
                cancellationToken);
    }

    private async Task AssignDefaultCompanyAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var companyId = await context.Companies
            .IgnoreQueryFilters()
            .Where(company => company.TenantId == user.TenantId && company.IsActive)
            .OrderBy(company => company.Id)
            .Select(company => (int?)company.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (!companyId.HasValue)
            return;

        context.UserCompanyAccesses.Add(new UserCompanyAccess
        {
            TenantId = user.TenantId,
            CompanyId = companyId.Value,
            UserId = user.Id,
            IsDefault = true
        });
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task<ApplicationUser?> FindUserWithTokensAsync(string userId, CancellationToken cancellationToken) =>
        await userManager.Users
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);

    private async Task<Result<AuthResponse>> HandleInactiveRefreshTokenAsync(
        ApplicationUser user,
        RefreshToken storedToken)
    {
        if (!storedToken.WasRotated)
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (storedToken.WasRotatedWithin(RotatedTokenReuseGracePeriod, now))
            return Result.Failure<AuthResponse>(userErrors.RefreshTokenAlreadyRotated);

        var revokedAny = false;
        foreach (var token in user.RefreshTokens.Where(token =>
                     token.IsActiveAt(now) &&
                     string.Equals(token.SessionId, storedToken.SessionId, StringComparison.Ordinal)))
        {
            token.Revoke("Refresh token reuse detected", now);
            revokedAny = true;
        }

        if (revokedAny)
        {
            PruneOldTokens(user);
            var updateResult = await userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return Result.Failure<AuthResponse>(userErrors.SessionRevocationFailed);

            QueueSessionRevoked(
                user.Id,
                "Your session was revoked because a rotated refresh token was reused.");
        }

        return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);
    }

    private static AuthResponse CreateAuthResponse(
        ApplicationUser user,
        int companyId,
        AccessTokenResult accessToken,
        string refreshToken,
        DateTime refreshTokenExpiration) =>
        new(user.Id,
            user.UserName ?? string.Empty,
            user.FirstName,
            user.LastName,
            user.TenantId,
            accessToken.TenantName,
            accessToken.TenantPlanName,
            companyId,
            accessToken.Token,
            accessToken.ExpiresAt,
            refreshToken,
            refreshTokenExpiration);

    private void RevokeAllSessions(ApplicationUser user, string reason)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        foreach (var token in user.RefreshTokens.Where(token => token.IsActiveAt(now)))
            token.Revoke(reason, now);
    }

    private void PruneOldTokens(ApplicationUser user)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var removeBefore = now.Subtract(InactiveTokenRetention);
        user.RefreshTokens.RemoveAll(token =>
            !token.IsActiveAt(now) && (token.RevokedOn ?? token.ExpiresOn) < removeBefore);

        var excessTokens = user.RefreshTokens
            .Where(token => !token.IsActiveAt(now))
            .OrderByDescending(token => token.RevokedOn ?? token.ExpiresOn)
            .Skip(MaxInactiveTokenHistory)
            .ToHashSet();

        user.RefreshTokens.RemoveAll(excessTokens.Contains);
    }

    private static void QueueSessionRevoked(string userId, string message)
    {
        BackgroundJob.Enqueue<SessionRevokedJob>(
            job => job.ExecuteAsync(userId, message));
    }

    private async Task SaveProfilePictureAsync(
        ApplicationUser user,
        string base64Image,
        CancellationToken cancellationToken)
    {
        byte[] imageBytes;
        try
        {
            imageBytes = Convert.FromBase64String(base64Image);
        }
        catch (FormatException)
        {
            return;
        }

        var extension = DetectImageExtension(imageBytes);
        Directory.CreateDirectory(_profilePicturesPath);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(_profilePicturesPath, fileName);

        try
        {
            await File.WriteAllBytesAsync(filePath, imageBytes, cancellationToken);

            await context.Users
                .Where(u => u.Id == user.Id)
                .ExecuteUpdateAsync(
                    s => s.SetProperty(u => u.ProfilePicture, fileName),
                    cancellationToken);
        }
        catch
        {
            if (File.Exists(filePath))
                File.Delete(filePath);
        }
    }

    private static string DetectImageExtension(byte[] bytes)
    {
        if (bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
            return ".jpg";
        if (bytes.Length >= 4 && bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)
            return ".png";
        return ".jpg";
    }

    private static Error IdentityFailure(IdentityResult result)
    {
        var error = result.Errors.First();
        return new Error(error.Code, error.Description, ErrorType.Validation);
    }

    private string? CurrentIpAddress =>
        signInManager.Context?.Connection.RemoteIpAddress?.ToString();

    private string? CurrentUserAgent =>
        signInManager.Context?.Request.Headers.UserAgent.ToString();
}
