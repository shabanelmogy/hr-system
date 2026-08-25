using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Application.Features.Security.Authentication.Contracts;
using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Application.Features.Security.Users.Errors;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthSessionService(
    UserManager<ApplicationUser> userManager,
    IJwtProvider jwtProvider,
    UserErrors userErrors,
    ILoginAuditService loginAudit,
    ISecurityAuditService securityAudit,
    ICurrentActor currentActor,
    AuthCompanyAccessService companyAccess,
    SessionRevocationNotifier revocationNotifier,
    IHttpContextAccessor httpContextAccessor,
    TimeProvider timeProvider) : IAuthSessionService
{
    public async Task<Result<AuthResponse>> IssueSessionAsync(
        ApplicationUser user,
        string tenantId,
        int companyId,
        CancellationToken cancellationToken) =>
        await IssueSessionCoreAsync(
            user,
            tenantId,
            companyId,
            replacedSessionId: null,
            previousCompanyId: null,
            cancellationToken);

    public async Task<Result<AuthResponse>> SwitchCompanyAsync(
        int companyId,
        CancellationToken cancellationToken)
    {
        var userId = currentActor.UserId;
        var tenantId = currentActor.TenantId;
        var previousCompanyId = currentActor.CompanyId;
        var replacedSessionId = httpContextAccessor.HttpContext?.User
            .FindFirstValue(JwtClaimNames.SessionId);

        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            string.IsNullOrWhiteSpace(replacedSessionId) ||
            previousCompanyId is null or <= 0 ||
            companyId <= 0)
        {
            return Result.Failure<AuthResponse>(userErrors.InvalidJwtToken);
        }

        var user = await FindUserWithTokensAsync(userId, cancellationToken);
        if (user is null || user.IsDisabled)
            return Result.Failure<AuthResponse>(userErrors.InvalidJwtToken);

        if (user.LockoutEnd > timeProvider.GetUtcNow())
            return Result.Failure<AuthResponse>(userErrors.LockedUser);

        return await IssueSessionCoreAsync(
            user,
            tenantId,
            companyId,
            replacedSessionId,
            previousCompanyId,
            cancellationToken);
    }

    private async Task<Result<AuthResponse>> IssueSessionCoreAsync(
        ApplicationUser user,
        string tenantId,
        int companyId,
        string? replacedSessionId,
        int? previousCompanyId,
        CancellationToken cancellationToken)
    {
        var company = await companyAccess.GetAvailableCompanyAsync(
            user.Id,
            tenantId,
            companyId,
            cancellationToken);
        if (company is null)
            return Result.Failure<AuthResponse>(userErrors.NoCompanyAccess);

        var sessionId = Guid.NewGuid().ToString("N");
        var accessToken = await jwtProvider.GenerateAccessTokenAsync(user, sessionId, companyId, tenantId);
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var refreshToken = RefreshTokenProtector.Issue(
            sessionId,
            accessToken.JwtId,
            companyId,
            now,
            now.Add(RefreshTokenSessionPolicy.RefreshTokenLifetime),
            CurrentIpAddress,
            CurrentUserAgent);

        if (!string.IsNullOrWhiteSpace(replacedSessionId))
        {
            RefreshTokenSessionPolicy.RevokeSession(
                user.RefreshTokens,
                replacedSessionId,
                "Company switched",
                now);
        }
        RefreshTokenSessionPolicy.Prune(user.RefreshTokens, now);
        user.RefreshTokens.Add(refreshToken.Token);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure<AuthResponse>(userErrors.UpdateFailed);

        if (replacedSessionId is null)
            await loginAudit.RecordLoginAsync(user.Id, companyId, cancellationToken);
        await securityAudit.RecordAsync(new SecurityAuditRequest(
            replacedSessionId is null
                ? "Authentication.LoginSucceeded"
                : "Authentication.CompanySwitched",
            "ApplicationUser",
            user.Id,
            TenantId: tenantId,
            CompanyId: companyId,
            Metadata: new Dictionary<string, string?>
            {
                ["SessionId"] = sessionId,
                ["PreviousSessionId"] = replacedSessionId,
                ["PreviousCompanyId"] = previousCompanyId?.ToString(CultureInfo.InvariantCulture)
            }), cancellationToken);
        return Result.Success(CreateAuthResponse(
            user,
            tenantId,
            company,
            accessToken,
            refreshToken.RawToken,
            refreshToken.Token.ExpiresOn));
    }

    public async Task<Result> LogOutAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return Result.Success();

        var tokenHash = RefreshTokenProtector.Hash(refreshToken);
        var user = await userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(
                candidate => candidate.RefreshTokens.Any(token => token.TokenHash == tokenHash),
                cancellationToken);

        if (user is null)
            return Result.Success();

        var storedToken = user.RefreshTokens.Single(token => token.TokenHash == tokenHash);
        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (storedToken.IsActiveAt(now))
            storedToken.Revoke("Signed out", now);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure(userErrors.SessionRevocationFailed);

        await loginAudit.RecordLogoutAsync(user.Id, storedToken.CompanyId, cancellationToken);
        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "Authentication.Logout",
            "ApplicationUser",
            user.Id,
            CompanyId: storedToken.CompanyId), cancellationToken);
        return Result.Success();
    }

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
        var storedToken = user.RefreshTokens.SingleOrDefault(token => token.TokenHash == tokenHash);
        if (storedToken is null)
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);

        var claimsMatchSession =
            string.Equals(storedToken.SessionId, validatedAccessToken.SessionId, StringComparison.Ordinal) &&
            string.Equals(storedToken.JwtId, validatedAccessToken.JwtId, StringComparison.Ordinal) &&
            storedToken.CompanyId == validatedAccessToken.CompanyId &&
            string.Equals(user.SecurityStamp, validatedAccessToken.SecurityStamp, StringComparison.Ordinal);

        if (!claimsMatchSession)
        {
            storedToken.Revoke("Token claims mismatch", now);
            var updateResult = await userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return Result.Failure<AuthResponse>(userErrors.SessionRevocationFailed);

            revocationNotifier.Queue(
                user.Id,
                "Your session was revoked due to security validation failure.");
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);
        }

        if (!storedToken.IsActiveAt(now))
            return await HandleInactiveRefreshTokenAsync(user, storedToken);

        var company = await companyAccess.GetAvailableCompanyAsync(
            user.Id,
            validatedAccessToken.TenantId,
            storedToken.CompanyId,
            cancellationToken);
        if (company is null)
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);

        var accessToken = await jwtProvider.GenerateAccessTokenAsync(
            user,
            storedToken.SessionId,
            storedToken.CompanyId,
            validatedAccessToken.TenantId);
        var replacement = RefreshTokenProtector.Rotate(
            storedToken,
            accessToken.JwtId,
            now,
            CurrentIpAddress,
            CurrentUserAgent);

        user.RefreshTokens.Add(replacement.Token);
        RefreshTokenSessionPolicy.Prune(user.RefreshTokens, now);

        var rotationResult = await userManager.UpdateAsync(user);
        if (!rotationResult.Succeeded)
            return Result.Failure<AuthResponse>(userErrors.RefreshTokenUpdateConflict);

        return Result.Success(CreateAuthResponse(
            user,
            validatedAccessToken.TenantId,
            company,
            accessToken,
            replacement.RawToken,
            replacement.Token.ExpiresOn));
    }

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

        if (!await companyAccess.IsUserWithinActorCompanyScopeAsync(
                user.Id,
                tenantId!,
                cancellationToken))
        {
            return Result.Failure(userErrors.UserNotFound);
        }

        var result = await RevokeAllSessionsAsync(
            user,
            "Revoked by an administrator",
            "Your session has been revoked by an administrator.");
        if (result.IsFailure)
            return result;

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "UserSessionsRevoked",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId), cancellationToken);
        return Result.Success();
    }

    public async Task<Result> RevokeAllSessionsAsync(
        ApplicationUser user,
        string reason,
        string notificationMessage)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        RefreshTokenSessionPolicy.RevokeAll(user.RefreshTokens, reason, now);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Failure(userErrors.SessionRevocationFailed);

        revocationNotifier.Queue(user.Id, notificationMessage);
        return Result.Success();
    }

    private async Task<ApplicationUser?> FindUserWithTokensAsync(
        string userId,
        CancellationToken cancellationToken) =>
        await userManager.Users
            .Include(user => user.RefreshTokens)
            .SingleOrDefaultAsync(user => user.Id == userId, cancellationToken);

    private async Task<Result<AuthResponse>> HandleInactiveRefreshTokenAsync(
        ApplicationUser user,
        RefreshToken storedToken)
    {
        if (!storedToken.WasRotated)
            return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (RefreshTokenSessionPolicy.IsWithinRotationGracePeriod(storedToken, now))
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
            RefreshTokenSessionPolicy.Prune(user.RefreshTokens, now);
            var updateResult = await userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return Result.Failure<AuthResponse>(userErrors.SessionRevocationFailed);

            revocationNotifier.Queue(
                user.Id,
                "Your session was revoked because a rotated refresh token was reused.");
        }

        return Result.Failure<AuthResponse>(userErrors.InvalidRefreshToken);
    }

    private static AuthResponse CreateAuthResponse(
        ApplicationUser user,
        string tenantId,
        CompanyOptionResponse company,
        AccessTokenResult accessToken,
        string refreshToken,
        DateTime refreshTokenExpiration) =>
        new(
            user.Id,
            user.UserName ?? string.Empty,
            user.FirstName,
            user.LastName,
            tenantId,
            accessToken.TenantName,
            accessToken.TenantPlanName,
            company.Id,
            company.CompanyCode,
            company.NameAr,
            company.NameEn,
            accessToken.Token,
            accessToken.ExpiresAt,
            refreshToken,
            refreshTokenExpiration);

    private string? CurrentIpAddress =>
        httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

    private string? CurrentUserAgent =>
        httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString();
}
