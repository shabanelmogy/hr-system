using HrManagementSystem.Features.Security.Authentication.Contracts;
using HrManagementSystem.Infrastructure.Hubs.GeneralHub;

namespace HrManagementSystem.Features.Security.Authentication.Services;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtProvider jwtProvider,
    UserErrors userErrors,
    IHubContext<GeneralHub, IGeneralHubClient> companyHubContext,
    IAuthEmailService emailService,
    ILoginAuditService loginAudit) : IAuthService
{
    private const int RefreshTokenLifetimeDays = 14;
    private static readonly TimeSpan RevokedTokenRetention = TimeSpan.FromDays(30);

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------

    public async Task<Result<AuthResponse>> GetTokenAsync(
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
            return Result.Failure<AuthResponse>(userErrors.InvalidCredentials);

        if (user.IsDisabled)
            return Result.Failure<AuthResponse>(userErrors.DisabledUser);

        var signInResult = await signInManager.PasswordSignInAsync(
            user,
            password,
            isPersistent: false,
            lockoutOnFailure: true);

        if (!signInResult.Succeeded)
        {
            var error = signInResult.IsNotAllowed
                ? userErrors.EmailNotConfirmed
                : signInResult.IsLockedOut
                    ? userErrors.LockedUser
                    : userErrors.InvalidCredentials;

            return Result.Failure<AuthResponse>(error);
        }

        await loginAudit.RecordLoginAsync(user.Id, cancellationToken);
        return await IssueSessionAsync(user, cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Google Login
    // -------------------------------------------------------------------------

    public async Task<Result<AuthResponse>> LoginWithGoogleAsync(
        ClaimsPrincipal? claimsPrincipal,
        CancellationToken cancellationToken = default)
    {
        var email = claimsPrincipal?.FindFirstValue(ClaimTypes.Email);
        var providerKey = claimsPrincipal?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(providerKey))
            return Result.Failure<AuthResponse>(userErrors.InvalidCredentials);

        var user = await FindOrCreateGoogleUserAsync(claimsPrincipal!, email, cancellationToken);
        if (user is null)
            return Result.Failure<AuthResponse>(userErrors.InvalidCredentials);

        if (user.IsDisabled)
            return Result.Failure<AuthResponse>(userErrors.DisabledUser);

        var linkResult = await EnsureGoogleLoginLinkedAsync(user, providerKey);
        if (!linkResult)
            return Result.Failure<AuthResponse>(userErrors.InvalidCredentials);

        await loginAudit.RecordLoginAsync(user.Id, cancellationToken);
        return await IssueSessionAsync(user, cancellationToken);
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
        if (storedToken.IsActive)
            storedToken.Revoke("Signed out");
        else
            RevokeSessionFamily(user, storedToken.SessionId, "Signed out");

        await userManager.UpdateAsync(user);
        await loginAudit.RecordLogoutAsync(user.Id, cancellationToken);

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

        if (user.LockoutEnd > DateTimeOffset.UtcNow)
            return Result.Failure<AuthResponse>(userErrors.LockedUser);

        var tokenHash = RefreshTokenProtector.Hash(request.RefreshToken);
        var storedToken = user.RefreshTokens.SingleOrDefault(t => t.TokenHash == tokenHash);
        if (storedToken is null)
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);

        var claimsMatchSession =
            string.Equals(storedToken.SessionId, validatedAccessToken.SessionId, StringComparison.Ordinal) &&
            string.Equals(storedToken.JwtId, validatedAccessToken.JwtId, StringComparison.Ordinal) &&
            string.Equals(user.SecurityStamp, validatedAccessToken.SecurityStamp, StringComparison.Ordinal);

        if (!claimsMatchSession)
        {
            RevokeSessionFamily(user, storedToken.SessionId, "Token claims mismatch");
            await userManager.UpdateAsync(user);
            await NotifySessionRevokedAsync(user.Id, "Your session was revoked due to security validation failure.");
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);
        }

        if (!storedToken.IsActive)
        {
            if (storedToken.RevokedOn is null)
            {
                storedToken.Revoke("Expired");
                await userManager.UpdateAsync(user);
            }

            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);
        }

        var accessToken = await jwtProvider.GenerateAccessTokenAsync(user, storedToken.SessionId);
        var replacement = RefreshTokenProtector.Rotate(
            storedToken,
            accessToken.JwtId,
            CurrentIpAddress,
            CurrentUserAgent);

        user.RefreshTokens.Add(replacement.Token);
        PruneOldTokens(user);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure<AuthResponse>(userErrors.UpdateFailed);

        return Result.Success(CreateAuthResponse(user, accessToken, replacement.RawToken, replacement.Token.ExpiresOn));
    }

    // -------------------------------------------------------------------------
    // Session Revocation
    // -------------------------------------------------------------------------

    public async Task<Result> RevokeRefreshTokenByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserWithTokensAsync(userId, cancellationToken);
        if (user is null)
            return Result.Failure(userErrors.UserNotFound);

        foreach (var token in user.RefreshTokens.Where(t => t.IsActive))
            token.Revoke("Revoked by an administrator");

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result.Failure(userErrors.UpdateFailed);

        await NotifySessionRevokedAsync(user.Id, "Your session has been revoked by an administrator.");
        return Result.Success();
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    public async Task<Result> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = request.Adapt<ApplicationUser>();
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return Result.Failure(IdentityFailure(result));

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
                StatusCodes.Status400BadRequest));

        RevokeAllSessions(user, "Password was reset");
        await userManager.UpdateAsync(user);
        await NotifySessionRevokedAsync(user.Id, "Your password was reset. Please sign in again.");
        return Result.Success();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private async Task<ApplicationUser?> FindOrCreateGoogleUserAsync(
        ClaimsPrincipal principal,
        string email,
        CancellationToken cancellationToken)
    {
        var user = await userManager.Users
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(u => u.NormalizedEmail == email.ToUpper(), cancellationToken);

        if (user is not null)
            return user;

        user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = principal.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty,
            LastName = principal.FindFirstValue(ClaimTypes.Surname) ?? string.Empty,
            EmailConfirmed = true
        };

        var createResult = await userManager.CreateAsync(user);
        if (!createResult.Succeeded)
            return null;

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
        CancellationToken cancellationToken)
    {
        var sessionId = Guid.NewGuid().ToString("N");
        var accessToken = await jwtProvider.GenerateAccessTokenAsync(user, sessionId);
        var refreshToken = RefreshTokenProtector.Issue(
            sessionId,
            accessToken.JwtId,
            DateTime.UtcNow.AddDays(RefreshTokenLifetimeDays),
            CurrentIpAddress,
            CurrentUserAgent);

        PruneOldTokens(user);
        user.RefreshTokens.Add(refreshToken.Token);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure<AuthResponse>(userErrors.UpdateFailed);

        return Result.Success(CreateAuthResponse(user, accessToken, refreshToken.RawToken, refreshToken.Token.ExpiresOn));
    }

    private async Task<ApplicationUser?> FindUserWithTokensAsync(string userId, CancellationToken cancellationToken) =>
        await userManager.Users
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);

    private static AuthResponse CreateAuthResponse(
        ApplicationUser user,
        AccessTokenResult accessToken,
        string refreshToken,
        DateTime refreshTokenExpiration) =>
        new(user.Id,
            user.UserName ?? string.Empty,
            user.FirstName,
            user.LastName,
            accessToken.Token,
            accessToken.ExpiresAt,
            refreshToken,
            refreshTokenExpiration);

    private static void RevokeSessionFamily(ApplicationUser user, string sessionId, string reason)
    {
        foreach (var token in user.RefreshTokens.Where(t => t.SessionId == sessionId && t.IsActive))
            token.Revoke(reason);
    }

    private static void RevokeAllSessions(ApplicationUser user, string reason)
    {
        foreach (var token in user.RefreshTokens.Where(t => t.IsActive))
            token.Revoke(reason);
    }

    private static void PruneOldTokens(ApplicationUser user)
    {
        var removeBefore = DateTime.UtcNow.Subtract(RevokedTokenRetention);
        user.RefreshTokens.RemoveAll(t =>
            t.RevokedOn < removeBefore ||
            (t.RevokedOn is null && t.ExpiresOn < removeBefore));
    }

    private Task NotifySessionRevokedAsync(string userId, string message) =>
        companyHubContext.Clients.User(userId).ReceiveTokenRevoked(message);

    private static Error IdentityFailure(IdentityResult result)
    {
        var error = result.Errors.First();
        return new Error(error.Code, error.Description, StatusCodes.Status400BadRequest);
    }

    private string? CurrentIpAddress =>
        signInManager.Context?.Connection.RemoteIpAddress?.ToString();

    private string? CurrentUserAgent =>
        signInManager.Context?.Request.Headers.UserAgent.ToString();
}
