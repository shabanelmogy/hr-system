using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Application.Features.Security.Authentication.Contracts;
using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Application.Features.Security.Users.Errors;
using HrManagementSystem.Domain.Platform.SecurityAudits.Enums;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthLoginService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtProvider jwtProvider,
    UserErrors userErrors,
    AuthCompanyAccessService companyAccess,
    AuthSessionService sessions,
    ISecurityAuditService securityAudit,
    IRealtimeChangeDispatcher realtimeChanges,
    ApplicationDbContext context,
    TimeProvider timeProvider,
    AuthenticationFeaturePolicy authenticationFeatures) : IAuthLoginService
{
    public async Task<Result<LoginResult>> GetTokenAsync(
        string userName,
        string password,
        CancellationToken cancellationToken)
    {
        var normalizedIdentifier = userName.ToUpper();
        var user = await userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(
                candidate =>
                    candidate.NormalizedUserName == normalizedIdentifier ||
                    candidate.NormalizedEmail == normalizedIdentifier,
                cancellationToken);

        if (user is null)
        {
            await securityAudit.RecordAsync(new SecurityAuditRequest(
                "Authentication.LoginFailed",
                "ApplicationUser",
                Outcome: SecurityAuditOutcome.Failed,
                Reason: "InvalidCredentials"), cancellationToken);
            return Result.Failure<LoginResult>(userErrors.InvalidCredentials);
        }

        if (user.IsDisabled)
        {
            await securityAudit.RecordAsync(new SecurityAuditRequest(
                "Authentication.LoginDenied",
                "ApplicationUser",
                user.Id,
                SecurityAuditOutcome.Denied,
                "UserDisabled",
                user.TenantId), cancellationToken);
            return Result.Failure<LoginResult>(userErrors.DisabledUser);
        }

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

            await securityAudit.RecordAsync(new SecurityAuditRequest(
                signInResult.IsLockedOut
                    ? "Authentication.LoginDenied"
                    : "Authentication.LoginFailed",
                "ApplicationUser",
                user.Id,
                signInResult.IsLockedOut || signInResult.IsNotAllowed
                    ? SecurityAuditOutcome.Denied
                    : SecurityAuditOutcome.Failed,
                signInResult.IsNotAllowed
                    ? "EmailNotConfirmed"
                    : signInResult.IsLockedOut
                        ? "UserLocked"
                        : "InvalidCredentials",
                user.TenantId), cancellationToken);
            return Result.Failure<LoginResult>(error);
        }

        return await CreateLoginResultAsync(user, cancellationToken);
    }

    public async Task<Result<LoginResult>> LoginWithGoogleAsync(
        ExternalLoginUser externalUser,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(externalUser.Email) ||
            string.IsNullOrWhiteSpace(externalUser.ProviderKey))
        {
            return Result.Failure<LoginResult>(userErrors.InvalidCredentials);
        }

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

    public async Task<Result<LoginResult>> SelectTenantAsync(
        SelectTenantRequest request,
        CancellationToken cancellationToken)
    {
        var selection = jwtProvider.ValidateTenantSelectionToken(request.TenantSelectionToken);
        if (selection is null)
            return Result.Failure<LoginResult>(userErrors.InvalidTenantSelection);

        var user = await userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(candidate => candidate.Id == selection.UserId, cancellationToken);

        if (user is null ||
            user.IsDisabled ||
            user.LockoutEnd > timeProvider.GetUtcNow() ||
            !string.Equals(user.SecurityStamp, selection.SecurityStamp, StringComparison.Ordinal))
        {
            return Result.Failure<LoginResult>(userErrors.InvalidTenantSelection);
        }

        return await companyAccess.HasTenantAccessAsync(user.Id, request.TenantId, cancellationToken)
            ? await CreateTenantLoginResultAsync(user, request.TenantId, cancellationToken)
            : Result.Failure<LoginResult>(userErrors.InvalidTenantSelection);
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
            !string.Equals(user.SecurityStamp, selection.SecurityStamp, StringComparison.Ordinal))
        {
            return Result.Failure<AuthResponse>(userErrors.InvalidCompanySelection);
        }

        var canAccess = await companyAccess.HasCompanyAccessAsync(
            user.Id,
            selection.TenantId,
            request.CompanyId,
            cancellationToken);

        return canAccess
            ? await sessions.IssueSessionAsync(
                user,
                selection.TenantId,
                request.CompanyId,
                cancellationToken)
            : Result.Failure<AuthResponse>(userErrors.InvalidCompanySelection);
    }

    private async Task<ApplicationUser?> FindOrCreateGoogleUserAsync(
        ExternalLoginUser externalUser,
        CancellationToken cancellationToken)
    {
        var externalLogin = await userManager.FindByLoginAsync("Google", externalUser.ProviderKey);
        if (externalLogin is not null)
        {
            return await userManager.Users
                .Include(candidate => candidate.RefreshTokens)
                .SingleOrDefaultAsync(candidate => candidate.Id == externalLogin.Id, cancellationToken);
        }

        var normalizedEmail = externalUser.Email.ToUpper();
        var user = await userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(
                candidate => candidate.NormalizedEmail == normalizedEmail,
                cancellationToken);

        if (user is not null)
            return user;

        if (!authenticationFeatures.CanAutoProvisionGoogleUsers)
            return null;

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

        await companyAccess.AssignDefaultCompanyAsync(user, cancellationToken);

        var roleResult = await userManager.AddToRoleAsync(user, AppRoles.user);
        if (!roleResult.Succeeded)
            return null;

        await DispatchUserChangeAsync(user, "RegisterExternal", cancellationToken);
        return user;
    }

    private async Task<bool> EnsureGoogleLoginLinkedAsync(
        ApplicationUser user,
        string providerKey)
    {
        var existingLogins = await userManager.GetLoginsAsync(user);
        if (existingLogins.Any(login =>
                login.LoginProvider == "Google" &&
                login.ProviderKey == providerKey))
        {
            return true;
        }

        var result = await userManager.AddLoginAsync(
            user,
            new UserLoginInfo("Google", providerKey, "Google"));
        return result.Succeeded;
    }

    private async Task<Result<LoginResult>> CreateLoginResultAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var tenants = await companyAccess.GetAvailableTenantsAsync(user.Id, cancellationToken);
        if (tenants.Count == 0)
            return Result.Failure<LoginResult>(userErrors.NoCompanyAccess);

        if (tenants.Count == 1)
            return await CreateTenantLoginResultAsync(user, tenants[0].Id, cancellationToken);

        var selectionToken = jwtProvider.GenerateTenantSelectionToken(user);
        var response = new TenantSelectionRequiredResponse(
            IsAuthenticated: false,
            RequiresTenantSelection: true,
            selectionToken.Token,
            selectionToken.ExpiresAt,
            tenants);

        return Result.Success<LoginResult>(new TenantSelectionLoginResult(response));
    }

    private async Task<Result<LoginResult>> CreateTenantLoginResultAsync(
        ApplicationUser user,
        string tenantId,
        CancellationToken cancellationToken)
    {
        if (!await companyAccess.HasTenantAccessAsync(user.Id, tenantId, cancellationToken))
            return Result.Failure<LoginResult>(userErrors.NoCompanyAccess);

        var companies = await companyAccess.GetAvailableCompaniesAsync(
            user.Id,
            tenantId,
            cancellationToken);
        if (companies.Count == 0)
            return Result.Failure<LoginResult>(userErrors.NoCompanyAccess);

        if (companies.Count == 1)
        {
            var session = await sessions.IssueSessionAsync(
                user,
                tenantId,
                companies[0].Id,
                cancellationToken);
            return session.IsSuccess
                ? Result.Success<LoginResult>(new AuthenticatedLoginResult(session.Value))
                : Result.Failure<LoginResult>(session.Error);
        }

        var selectionToken = jwtProvider.GenerateCompanySelectionToken(user, tenantId);
        var response = new CompanySelectionRequiredResponse(
            IsAuthenticated: false,
            RequiresCompanySelection: true,
            selectionToken.Token,
            selectionToken.ExpiresAt,
            companies);

        return Result.Success<LoginResult>(new CompanySelectionLoginResult(response));
    }

    private async Task DispatchUserChangeAsync(
        ApplicationUser user,
        string action,
        CancellationToken cancellationToken)
    {
        var companyId = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.UserId == user.Id && access.TenantId == user.TenantId)
            .OrderByDescending(access => access.IsDefault)
            .Select(access => (int?)access.CompanyId)
            .FirstOrDefaultAsync(cancellationToken);
        if (!companyId.HasValue)
            return;

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<ApplicationUser>(
            RealtimeAudience.ForCompanyPermission(
                user.TenantId,
                companyId.Value,
                Permissions.ViewUsers),
            action,
            user.Id));
    }
}
