using System.Security.Cryptography;
using System.Text;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Application.Authentication.SelectionChallenges;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.TenantMembership;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure.Identity;

public sealed class PlatformIdentityLoginAdapter(
    UserManager<PlatformApplicationUser> users,
    SignInManager<PlatformApplicationUser> signIn,
    IAuthenticationTokenService tokens,
    ISelectionChallengeService challenges,
    ITenantMembershipService tenantMemberships,
    ICompanyAccessService companyAccess,
    ITenantModuleEntitlementSource entitlements,
    PlatformIdentitySessionAdapter sessions,
    TimeProvider timeProvider) : IAuthenticationLoginAdapter
{
    public async Task<AuthenticationOperationResult<AuthenticationLoginResult>> PasswordLoginAsync(
        AuthenticationPasswordLoginRequest request,
        CancellationToken cancellationToken)
    {
        var identifier = request.UserName?.Trim();
        if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(request.Password))
            return Failure<AuthenticationLoginResult>("Authentication.InvalidCredentials", "Invalid credentials.");

        var normalized = users.NormalizeName(identifier);
        var normalizedEmail = users.NormalizeEmail(identifier);
        var user = await users.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(candidate =>
                candidate.NormalizedUserName == normalized ||
                candidate.NormalizedEmail == normalizedEmail,
                cancellationToken);

        if (user is null || user.IsDisabled || user.LifecycleStatus != (int)PlatformUserLifecycleStatus.Active)
            return Failure<AuthenticationLoginResult>("Authentication.InvalidCredentials", "Invalid credentials.");

        var result = await signIn.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            var code = result.IsLockedOut
                ? "Authentication.UserLocked"
                : result.IsNotAllowed
                    ? "Authentication.EmailNotConfirmed"
                    : "Authentication.InvalidCredentials";
            return Failure<AuthenticationLoginResult>(code, "Authentication failed.");
        }

        var memberships = await tenantMemberships.GetAvailableTenantsAsync(user.Id, cancellationToken);
        if (memberships.Count == 0)
            return Failure<AuthenticationLoginResult>("Authentication.NoTenantAccess", "The user has no active tenant membership.");

        if (await entitlements.IsSuperAdminAsync(user!.Id, cancellationToken))
            return await IssueSuperAdminSessionAsync(user, memberships, cancellationToken);

        if (memberships.Count == 1)
            return await ResolveTenantScopeAsync(user, memberships[0], cancellationToken);

        return await IssueTenantSelectionAsync(user, memberships, cancellationToken);

    }

    private async Task<AuthenticationOperationResult<AuthenticationLoginResult>> IssueSuperAdminSessionAsync(
        PlatformApplicationUser user,
        IReadOnlyList<TenantMembershipOption> memberships,
        CancellationToken cancellationToken)
    {
        if (memberships.Count == 0)
            return Failure<AuthenticationLoginResult>(
                "Authentication.NoTenantAccess",
                "The user has no active tenant membership.");

        foreach (var tenant in memberships)
        {
            var companies = await companyAccess.GetAvailableCompaniesAsync(user.Id, tenant.Id, cancellationToken);
            if (companies.Count > 0)
                return ToLoginResult(await sessions.IssueAsync(user, tenant.Id, companies[0].Id, cancellationToken));
        }

        return Failure<AuthenticationLoginResult>(
            "Authentication.NoCompanyAccess",
            "The user has no active company access.");
    }

    private async Task<AuthenticationOperationResult<AuthenticationLoginResult>> ResolveTenantScopeAsync(
        PlatformApplicationUser user,
        TenantMembershipOption tenant,
        CancellationToken cancellationToken)
    {
        var companies = await companyAccess.GetAvailableCompaniesAsync(user.Id, tenant.Id, cancellationToken);
        if (companies.Count == 0)
            return Failure<AuthenticationLoginResult>(
                "Authentication.NoCompanyAccess",
                "The user has no active company access.");

        if (companies.Count == 1)
            return ToLoginResult(await sessions.IssueAsync(user, tenant.Id, companies[0].Id, cancellationToken));

        return await IssueCompanySelectionAsync(user, tenant.Id, companies, cancellationToken);
    }

    private async Task<AuthenticationOperationResult<AuthenticationLoginResult>> IssueTenantSelectionAsync(
        PlatformApplicationUser user,
        IReadOnlyList<TenantMembershipOption> memberships,
        CancellationToken cancellationToken)
    {
        var issued = tokens.GenerateTenantSelectionToken(Subject(user));
        await challenges.StoreAsync(new SelectionChallengeRegistrationRequest(
            issued.JwtId,
            user.Id,
            SelectionChallengeScopes.TenantSelection,
            issued.ExpiresAt,
            TenantId: null), cancellationToken);

        return AuthenticationOperationResult.Success<AuthenticationLoginResult>(
            new AuthenticationTenantSelectionLoginResult(
                IsAuthenticated: false,
                RequiresTenantSelection: true,
                issued.Token,
                issued.ExpiresAt,
                memberships.Select(item => new AuthenticationTenantOption(
                    item.Id,
                    item.Identifier,
                    item.Name)).ToArray()));
    }

    public Task<AuthenticationOperationResult<AuthenticationLoginResult>> ExternalLoginAsync(
        AuthenticationExternalLoginRequest request,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(Failure<AuthenticationLoginResult>(
            "Authentication.ExternalLoginDisabled",
            "External login must be enabled through a configured Platform identity provider.",
            AuthenticationErrorType.ServiceUnavailable));

    public async Task<AuthenticationOperationResult<AuthenticationLoginResult>> SelectTenantAsync(
        AuthenticationTenantSelectionRequest request,
        CancellationToken cancellationToken)
    {
        var selection = tokens.ValidateTenantSelectionToken(request.TenantSelectionToken);
        if (selection is null ||
            !await challenges.ConsumeAsync(new SelectionChallengeConsumeRequest(
                selection.JwtId,
                selection.UserId,
                SelectionChallengeScopes.TenantSelection,
                TenantId: null), cancellationToken))
        {
            return Failure<AuthenticationLoginResult>("Authentication.InvalidTenantSelection", "The tenant selection is invalid or expired.");
        }

        var user = await users.Users
            .Include(item => item.RefreshTokens)
            .SingleOrDefaultAsync(item => item.Id == selection.UserId, cancellationToken);
        if (!IsActive(user, selection.SecurityStamp, timeProvider.GetUtcNow()))
            return Failure<AuthenticationLoginResult>("Authentication.InvalidTenantSelection", "The tenant selection is invalid or expired.");

        var memberships = await tenantMemberships.GetAvailableTenantsAsync(user!.Id, cancellationToken);
        if (await entitlements.IsSuperAdminAsync(user.Id, cancellationToken))
        {
            return await IssueSuperAdminSessionAsync(user, memberships, cancellationToken);
        }

        var tenant = memberships
            .FirstOrDefault(item => string.Equals(item.Id, request.TenantId, StringComparison.Ordinal));
        if (tenant is null)
            return Failure<AuthenticationLoginResult>("Authentication.InvalidTenantSelection", "The tenant selection is invalid or expired.");

        return await ResolveTenantScopeAsync(user, tenant, cancellationToken);
    }

    public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SelectCompanyAsync(
        AuthenticationCompanySelectionRequest request,
        CancellationToken cancellationToken)
    {
        var selection = tokens.ValidateCompanySelectionToken(request.CompanySelectionToken);
        if (selection is null ||
            !await challenges.ConsumeAsync(new SelectionChallengeConsumeRequest(
                selection.JwtId,
                selection.UserId,
                SelectionChallengeScopes.CompanySelection,
                selection.TenantId), cancellationToken))
        {
            return Failure<AuthenticationSessionResponse>("Authentication.InvalidCompanySelection", "The company selection is invalid or expired.");
        }

        var user = await users.Users.Include(item => item.RefreshTokens)
            .SingleOrDefaultAsync(item => item.Id == selection.UserId, cancellationToken);
        if (!IsActive(user, selection.SecurityStamp, timeProvider.GetUtcNow()))
            return Failure<AuthenticationSessionResponse>("Authentication.InvalidCompanySelection", "The company selection is invalid or expired.");

        if (await entitlements.IsSuperAdminAsync(user!.Id, cancellationToken))
        {
            var memberships = await tenantMemberships.GetAvailableTenantsAsync(user.Id, cancellationToken);
            var resolved = await IssueSuperAdminSessionAsync(user, memberships, cancellationToken);
            return resolved.IsSuccess
                ? AuthenticationOperationResult.Success<AuthenticationSessionResponse>(
                    ((AuthenticationAuthenticatedLoginResult)resolved.Value).Response)
                : Failure<AuthenticationSessionResponse>(
                    resolved.Error.Code,
                    resolved.Error.Description,
                    resolved.Error.Type);
        }

        return await sessions.IssueAsync(user, selection.TenantId, request.CompanyId, cancellationToken);
    }

    private async Task<AuthenticationOperationResult<AuthenticationLoginResult>> IssueCompanySelectionAsync(
        PlatformApplicationUser user,
        string tenantId,
        IReadOnlyList<CompanyAccessOption> companies,
        CancellationToken cancellationToken)
    {
        var issued = tokens.GenerateCompanySelectionToken(Subject(user), tenantId);
        await challenges.StoreAsync(new SelectionChallengeRegistrationRequest(
            issued.JwtId,
            user.Id,
            SelectionChallengeScopes.CompanySelection,
            issued.ExpiresAt,
            tenantId), cancellationToken);

        return AuthenticationOperationResult.Success<AuthenticationLoginResult>(
            new AuthenticationCompanySelectionLoginResult(
                IsAuthenticated: false,
                RequiresCompanySelection: true,
                issued.Token,
                issued.ExpiresAt,
                companies.Select(item => new AuthenticationCompanyOption(
                    item.Id,
                    item.CompanyCode,
                    item.NameAr,
                    item.NameEn)).ToArray()));
    }

    private static AuthenticationOperationResult<AuthenticationLoginResult> ToLoginResult(
        AuthenticationOperationResult<AuthenticationSessionResponse> result) =>
        result.IsSuccess
            ? AuthenticationOperationResult.Success<AuthenticationLoginResult>(
                new AuthenticationAuthenticatedLoginResult(result.Value))
            : Failure<AuthenticationLoginResult>(result.Error.Code, result.Error.Description, result.Error.Type);

    private static AuthenticationTokenSubjectSnapshot Subject(PlatformApplicationUser user) =>
        new(user.Id, user.SecurityStamp ?? string.Empty);

    private static bool IsActive(
        PlatformApplicationUser? user,
        string securityStamp,
        DateTimeOffset now) =>
        user is not null &&
        !user.IsDisabled &&
        user.LifecycleStatus == (int)PlatformUserLifecycleStatus.Active &&
        (!user.LockoutEnd.HasValue || user.LockoutEnd.Value <= now) &&
        string.Equals(user.SecurityStamp, securityStamp, StringComparison.Ordinal);

    private static AuthenticationOperationResult<T> Failure<T>(
        string code,
        string description,
        AuthenticationErrorType type = AuthenticationErrorType.Unauthorized) =>
        AuthenticationOperationResult.Failure<T>(new AuthenticationError(code, description, type));
}

public sealed class PlatformIdentitySessionAdapter(
    UserManager<PlatformApplicationUser> users,
    IAuthenticationTokenService tokens,
    ICompanyAccessService companyAccess,
    ICurrentExecutionContext current,
    IHttpContextAccessor httpContext,
    TimeProvider timeProvider) : IAuthenticationSessionAdapter
{
    public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> IssueAsync(
        PlatformApplicationUser user,
        string tenantId,
        int companyId,
        CancellationToken cancellationToken,
        string? replacedSessionId = null)
    {
        var company = await companyAccess.GetAvailableCompanyAsync(user.Id, tenantId, companyId, cancellationToken);
        if (company is null)
            return Failure<AuthenticationSessionResponse>("Authentication.NoCompanyAccess", "The company is outside the user's active scope.");

        var sessionId = Guid.NewGuid().ToString("N");
        var accessToken = await tokens.GenerateAccessTokenAsync(
            new AccessTokenUserSnapshot(
                user.Id,
                user.UserName ?? string.Empty,
                user.Email ?? string.Empty,
                user.FirstName,
                user.LastName,
                user.SecurityStamp ?? string.Empty),
            sessionId,
            companyId,
            tenantId,
            cancellationToken);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (!string.IsNullOrWhiteSpace(replacedSessionId))
        {
            foreach (var existing in user.RefreshTokens.Where(item =>
                         item.IsActiveAt(now) &&
                         string.Equals(item.SessionId, replacedSessionId, StringComparison.Ordinal)))
            {
                existing.Revoke("Company switched", now);
            }
        }

        var rawRefreshToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(64));
        var refresh = new PlatformRefreshToken
        {
            TokenHash = Hash(rawRefreshToken),
            SessionId = sessionId,
            JwtId = accessToken.JwtId,
            CompanyId = companyId,
            CreatedOn = now,
            ExpiresOn = now.Add(AuthenticationSessionPolicy.RefreshTokenLifetime),
            CreatedByIp = httpContext.HttpContext?.Connection.RemoteIpAddress?.ToString(),
            CreatedByUserAgent = httpContext.HttpContext?.Request.Headers.UserAgent.ToString()
        };
        user.RefreshTokens.Add(refresh);
        Prune(user.RefreshTokens, now);

        var update = await users.UpdateAsync(user);
        if (!update.Succeeded)
            return IdentityFailure<AuthenticationSessionResponse>(update);

        return AuthenticationOperationResult.Success(new AuthenticationSessionResponse(
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
            rawRefreshToken,
            refresh.ExpiresOn));
    }

    public async Task<AuthenticationOperationResult> LogOutAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return AuthenticationOperationResult.Success();

        var hash = Hash(refreshToken);
        var user = await users.Users.Include(item => item.RefreshTokens)
            .SingleOrDefaultAsync(item => item.RefreshTokens.Any(token => token.TokenHash == hash), cancellationToken);
        if (user is null)
            return AuthenticationOperationResult.Success();

        user.RefreshTokens.Single(item => item.TokenHash == hash)
            .Revoke("Signed out", timeProvider.GetUtcNow().UtcDateTime);
        var result = await users.UpdateAsync(user);
        return result.Succeeded ? AuthenticationOperationResult.Success() : IdentityFailure(result);
    }

    public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> RefreshAsync(
        AuthenticationRefreshRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.RefreshToken))
            return Failure<AuthenticationSessionResponse>("Authentication.InvalidRefreshToken", "The refresh token is invalid.");

        var access = tokens.ValidateExpiredAccessToken(request.Token);
        if (access is null)
            return Failure<AuthenticationSessionResponse>("Authentication.InvalidAccessToken", "The access token is invalid.");

        var user = await users.Users.Include(item => item.RefreshTokens)
            .SingleOrDefaultAsync(item => item.Id == access.UserId, cancellationToken);
        if (user is null || user.IsDisabled ||
            !string.Equals(user.SecurityStamp, access.SecurityStamp, StringComparison.Ordinal))
        {
            return Failure<AuthenticationSessionResponse>("Authentication.InvalidRefreshToken", "The refresh token is invalid.");
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var refresh = user.RefreshTokens.SingleOrDefault(item => item.TokenHash == Hash(request.RefreshToken));
        if (refresh is null ||
            !string.Equals(refresh.SessionId, access.SessionId, StringComparison.Ordinal) ||
            !string.Equals(refresh.JwtId, access.JwtId, StringComparison.Ordinal) ||
            refresh.CompanyId != access.CompanyId)
        {
            return Failure<AuthenticationSessionResponse>("Authentication.InvalidRefreshToken", "The refresh token is invalid.");
        }

        if (!refresh.IsActiveAt(now))
        {
            if (refresh.WasRotated && refresh.RevokedOn < now.Subtract(AuthenticationSessionPolicy.RotatedTokenReuseGracePeriod))
            {
                foreach (var active in user.RefreshTokens.Where(item =>
                             item.IsActiveAt(now) && item.SessionId == refresh.SessionId))
                    active.Revoke("Refresh token reuse detected", now);
                await users.UpdateAsync(user);
            }
            return Failure<AuthenticationSessionResponse>("Authentication.InvalidRefreshToken", "The refresh token is inactive.");
        }

        refresh.Revoke(PlatformRefreshToken.RotationReason, now);
        return await IssueAsync(user, access.TenantId, refresh.CompanyId, cancellationToken);
    }

    public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SwitchCompanyAsync(
        int companyId,
        CancellationToken cancellationToken)
    {
        var sessionId = httpContext.HttpContext?.User.FindFirst(AuthenticationTokenClaimNames.SessionId)?.Value;
        if (string.IsNullOrWhiteSpace(current.UserId) || string.IsNullOrWhiteSpace(current.TenantId) ||
            string.IsNullOrWhiteSpace(sessionId) || companyId <= 0)
        {
            return Failure<AuthenticationSessionResponse>("Authentication.InvalidSession", "The active session scope is invalid.");
        }

        var user = await users.Users.Include(item => item.RefreshTokens)
            .SingleOrDefaultAsync(item => item.Id == current.UserId, cancellationToken);
        return user is null
            ? Failure<AuthenticationSessionResponse>("Authentication.InvalidSession", "The active session scope is invalid.")
            : await IssueAsync(user, current.TenantId, companyId, cancellationToken, sessionId);
    }

    public async Task<AuthenticationOperationResult> RevokeUserSessionsAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(userId, current.UserId, StringComparison.Ordinal))
            return Failure("Users.CannotManageOwnAccount", "An administrator cannot revoke the active account through this operation.", AuthenticationErrorType.Forbidden);

        var user = await users.Users.Include(item => item.RefreshTokens)
            .SingleOrDefaultAsync(item => item.Id == userId, cancellationToken);
        if (user is null)
            return Failure("Users.NotFound", "The user was not found.", AuthenticationErrorType.NotFound);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        foreach (var token in user.RefreshTokens.Where(item => item.IsActiveAt(now)))
            token.Revoke("Revoked by an administrator", now);
        var result = await users.UpdateSecurityStampAsync(user);
        return result.Succeeded ? AuthenticationOperationResult.Success() : IdentityFailure(result);
    }

    internal static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();

    private static void Prune(ICollection<PlatformRefreshToken> tokens, DateTime now)
    {
        var removable = tokens
            .Where(item => !item.IsActiveAt(now))
            .OrderByDescending(item => item.RevokedOn ?? item.ExpiresOn)
            .Skip(AuthenticationSessionPolicy.MaxInactiveTokenHistory)
            .ToArray();
        foreach (var item in removable)
            tokens.Remove(item);
    }

    private static AuthenticationOperationResult Failure(
        string code,
        string description,
        AuthenticationErrorType type = AuthenticationErrorType.Unauthorized) =>
        AuthenticationOperationResult.Failure(new AuthenticationError(code, description, type));

    private static AuthenticationOperationResult<T> Failure<T>(string code, string description) =>
        AuthenticationOperationResult.Failure<T>(new AuthenticationError(code, description, AuthenticationErrorType.Unauthorized));

    private static AuthenticationOperationResult IdentityFailure(IdentityResult result) =>
        Failure(result.Errors.First().Code, result.Errors.First().Description, AuthenticationErrorType.Validation);

    private static AuthenticationOperationResult<T> IdentityFailure<T>(IdentityResult result) =>
        AuthenticationOperationResult.Failure<T>(new AuthenticationError(
            result.Errors.First().Code,
            result.Errors.First().Description,
            AuthenticationErrorType.Validation));
}

public sealed class PlatformIdentityAccountAdapter(
    PlatformDbContext db,
    UserManager<PlatformApplicationUser> users,
    IAuthenticationFeaturePolicy features,
    IPlatformIdentityEmailSender email,
    PlatformIdentitySessionAdapter sessions,
    TimeProvider timeProvider) : IAuthenticationAccountAdapter
{
    public async Task<AuthenticationOperationResult> RegisterAsync(
        AuthenticationRegisterRequest request,
        CancellationToken cancellationToken)
    {
        if (!features.CanSelfRegister)
            return Failure("Authentication.SelfRegistrationDisabled", "Public self-registration is disabled.", AuthenticationErrorType.Forbidden);

        if (string.IsNullOrWhiteSpace(features.DefaultTenantId))
            return Failure("Authentication.ProvisioningNotConfigured", "A default tenant is required for public self-registration.", AuthenticationErrorType.ServiceUnavailable);

        var tenant = await db.Tenants.SingleOrDefaultAsync(item => item.Id == features.DefaultTenantId, cancellationToken);
        var company = await db.Companies.IgnoreQueryFilters().Where(item => item.TenantId == features.DefaultTenantId && item.IsActive)
            .OrderBy(item => item.Id).FirstOrDefaultAsync(cancellationToken);
        if (tenant?.IsActive != true || company is null)
            return Failure("Authentication.ProvisioningNotConfigured", "The default tenant/company is unavailable.", AuthenticationErrorType.ServiceUnavailable);

        var user = new PlatformApplicationUser
        {
            UserName = request.UserName.Trim(),
            Email = request.Email.Trim(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            ProfilePicture = string.IsNullOrWhiteSpace(request.ProfilePicture) ? null : request.ProfilePicture.Trim(),
            LifecycleStatus = (int)PlatformUserLifecycleStatus.Active
        };
        var result = await users.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return IdentityFailure(result);

        db.UserTenantAccesses.Add(new PlatformUserTenantAccess
        {
            UserId = user.Id,
            TenantId = tenant.Id,
            IsDefault = true,
            CreatedOn = timeProvider.GetUtcNow().UtcDateTime
        });
        db.UserCompanyAccesses.Add(new PlatformUserCompanyAccess
        {
            UserId = user.Id,
            TenantId = tenant.Id,
            CompanyId = company.Id,
            IsDefault = true,
            CreatedOn = timeProvider.GetUtcNow().UtcDateTime
        });
        await AssignDefaultRoleAsync(user.Id, tenant.Id, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

        var code = await users.GenerateEmailConfirmationTokenAsync(user);
        await email.SendConfirmationAsync(user, WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code)), cancellationToken);
        return AuthenticationOperationResult.Success();
    }

    public async Task<AuthenticationOperationResult> ConfirmEmailAsync(
        AuthenticationConfirmEmailRequest request,
        CancellationToken cancellationToken)
    {
        var user = await users.FindByIdAsync(request.UserId);
        if (user is null)
            return Failure("Authentication.InvalidCode", "The confirmation code is invalid.", AuthenticationErrorType.Validation);
        if (user.EmailConfirmed)
            return Failure("Authentication.EmailAlreadyConfirmed", "The email is already confirmed.", AuthenticationErrorType.Conflict);

        try
        {
            var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Code));
            var result = await users.ConfirmEmailAsync(user, code);
            return result.Succeeded ? AuthenticationOperationResult.Success() : IdentityFailure(result);
        }
        catch (FormatException)
        {
            return Failure("Authentication.InvalidCode", "The confirmation code is invalid.", AuthenticationErrorType.Validation);
        }
    }

    public async Task<AuthenticationOperationResult> ResendConfirmationEmailAsync(
        AuthenticationResendConfirmationRequest request,
        CancellationToken cancellationToken)
    {
        var user = await users.FindByEmailAsync(request.Email);
        if (user is null)
            return AuthenticationOperationResult.Success();
        if (user.EmailConfirmed)
            return Failure("Authentication.EmailAlreadyConfirmed", "The email is already confirmed.", AuthenticationErrorType.Conflict);
        var code = await users.GenerateEmailConfirmationTokenAsync(user);
        await email.SendConfirmationAsync(user, WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code)), cancellationToken);
        return AuthenticationOperationResult.Success();
    }

    public async Task<AuthenticationOperationResult> SendResetPasswordCodeAsync(
        string emailAddress,
        CancellationToken cancellationToken)
    {
        var user = await users.FindByEmailAsync(emailAddress);
        if (user is null || !user.EmailConfirmed)
            return AuthenticationOperationResult.Success();
        var code = await users.GeneratePasswordResetTokenAsync(user);
        await email.SendPasswordResetAsync(user, WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code)), cancellationToken);
        return AuthenticationOperationResult.Success();
    }

    public async Task<AuthenticationOperationResult> ResetPasswordAsync(
        AuthenticationResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var user = await users.FindByEmailAsync(request.Email);
        if (user is null || !user.EmailConfirmed)
            return Failure("Authentication.InvalidCode", "The password reset code is invalid.", AuthenticationErrorType.Validation);
        try
        {
            var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Code));
            var result = await users.ResetPasswordAsync(user, code, request.NewPassword);
            if (!result.Succeeded)
                return IdentityFailure(result);
            await sessions.RevokeUserSessionsAsync(user.Id, cancellationToken);
            return AuthenticationOperationResult.Success();
        }
        catch (FormatException)
        {
            return Failure("Authentication.InvalidCode", "The password reset code is invalid.", AuthenticationErrorType.Validation);
        }
    }

    public async Task<AuthenticationOperationResult> ChangePasswordAsync(
        string userId,
        AuthenticationChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var user = await users.FindByIdAsync(userId);
        if (user is null)
            return Failure("Users.NotFound", "The user was not found.", AuthenticationErrorType.NotFound);
        var result = await users.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        return result.Succeeded ? AuthenticationOperationResult.Success() : IdentityFailure(result);
    }

    private async Task AssignDefaultRoleAsync(string userId, string tenantId, CancellationToken token)
    {
        var roleId = await db.Roles
            .Where(role => !role.IsDeleted &&
                           role.NormalizedName == "USER" &&
                           (role.IsSystem || role.TenantId == tenantId))
            .OrderByDescending(role => role.IsSystem)
            .Select(role => role.Id)
            .FirstOrDefaultAsync(token);
        if (!string.IsNullOrWhiteSpace(roleId))
            db.UserRoles.Add(new IdentityUserRole<string> { UserId = userId, RoleId = roleId });
    }

    private static AuthenticationOperationResult Failure(string code, string description, AuthenticationErrorType type) =>
        AuthenticationOperationResult.Failure(new AuthenticationError(code, description, type));

    private static AuthenticationOperationResult IdentityFailure(IdentityResult result) =>
        Failure(result.Errors.First().Code, result.Errors.First().Description, AuthenticationErrorType.Validation);
}

public enum PlatformUserLifecycleStatus
{
    Active = 0,
    Archived = 1
}
