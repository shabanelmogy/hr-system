using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Contracts;
using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Services;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Application.Features.Security.Users.Errors;
using ErpSystem.Modules.HR.Domain.Platform.SecurityAudits.Enums;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.Platform.Contracts.Authentication.SelectionChallenges;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.TenantMembership;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;

/// <summary>
/// Legacy ASP.NET Identity login implementation. Runtime callers reach this
/// implementation only through the Platform authentication adapter port.
/// </summary>
public sealed class AuthLoginService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtProvider jwtProvider,
    UserErrors userErrors,
    AuthCompanyAccessService companyAccessWriter,
    ITenantMembershipService tenantMemberships,
    ICompanyAccessService companyAccess,
    AuthSessionService sessions,
    ISecurityAuditService securityAudit,
    IRealtimeChangeDispatcher realtimeChanges,
    ApplicationDbContext context,
    ISelectionChallengeService selectionChallenges,
    TimeProvider timeProvider,
    IAuthenticationFeaturePolicy authenticationFeatures)
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

        if (!await selectionChallenges.ConsumeAsync(
                new SelectionChallengeConsumeRequest(
                    selection.JwtId,
                    selection.UserId,
                    SelectionChallengeScopes.TenantSelection,
                    TenantId: null),
                cancellationToken))
        {
            return Result.Failure<LoginResult>(userErrors.InvalidTenantSelection);
        }

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

        return await tenantMemberships.HasTenantAccessAsync(user.Id, request.TenantId, cancellationToken)
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

        if (!await selectionChallenges.ConsumeAsync(
                new SelectionChallengeConsumeRequest(
                    selection.JwtId,
                    selection.UserId,
                    SelectionChallengeScopes.CompanySelection,
                    selection.TenantId),
                cancellationToken))
        {
            return Result.Failure<AuthResponse>(userErrors.InvalidCompanySelection);
        }

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

        var canAccess = await companyAccess.GetAvailableCompanyAsync(
            user.Id,
            selection.TenantId,
            request.CompanyId,
            cancellationToken) is not null;

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

        await companyAccessWriter.AssignDefaultCompanyAsync(user, cancellationToken);

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
        var availableTenants = await tenantMemberships.GetAvailableTenantsAsync(user.Id, cancellationToken);
        var tenants = availableTenants
            .Select(tenant => new TenantOptionResponse(tenant.Id, tenant.Identifier, tenant.Name))
            .ToArray();
        if (tenants.Length == 0)
            return Result.Failure<LoginResult>(userErrors.NoCompanyAccess);

        var selectionToken = jwtProvider.GenerateTenantSelectionToken(user);
        await selectionChallenges.StoreAsync(
            new SelectionChallengeRegistrationRequest(
                selectionToken.JwtId,
                user.Id,
                SelectionChallengeScopes.TenantSelection,
                selectionToken.ExpiresAt,
                TenantId: null),
            cancellationToken);
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
        if (!await tenantMemberships.HasTenantAccessAsync(user.Id, tenantId, cancellationToken))
            return Result.Failure<LoginResult>(userErrors.NoCompanyAccess);

        var availableCompanies = await companyAccess.GetAvailableCompaniesAsync(
            user.Id,
            tenantId,
            cancellationToken);
        var companies = availableCompanies
            .Select(company => new CompanyOptionResponse(
                company.Id,
                company.CompanyCode,
                company.NameAr,
                company.NameEn))
            .ToArray();
        if (companies.Length == 0)
            return Result.Failure<LoginResult>(userErrors.NoCompanyAccess);

        var selectionToken = jwtProvider.GenerateCompanySelectionToken(user, tenantId);
        await selectionChallenges.StoreAsync(
            new SelectionChallengeRegistrationRequest(
                selectionToken.JwtId,
                user.Id,
                SelectionChallengeScopes.CompanySelection,
                selectionToken.ExpiresAt,
                tenantId),
            cancellationToken);
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
