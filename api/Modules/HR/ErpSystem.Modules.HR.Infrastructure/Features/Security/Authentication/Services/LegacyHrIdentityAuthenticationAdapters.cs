using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Users.Services;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;

/// <summary>
/// Explicit adapter from Platform authentication orchestration into the legacy
/// ASP.NET Identity implementation that still owns the physical hr tables.
/// </summary>
public sealed class LegacyHrIdentityLoginAdapter(
    AuthLoginService legacyService) : IAuthenticationLoginAdapter
{
    public async Task<AuthenticationOperationResult<AuthenticationLoginResult>> PasswordLoginAsync(
        AuthenticationPasswordLoginRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.GetTokenAsync(request.UserName, request.Password, cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToPlatform);

    public async Task<AuthenticationOperationResult<AuthenticationLoginResult>> ExternalLoginAsync(
        AuthenticationExternalLoginRequest request,
        CancellationToken cancellationToken = default) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.LoginWithGoogleAsync(
                new ExternalLoginUser(
                    request.ProviderKey,
                    request.Email,
                    request.FirstName,
                    request.LastName),
                cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToPlatform);

    public async Task<AuthenticationOperationResult<AuthenticationLoginResult>> SelectTenantAsync(
        AuthenticationTenantSelectionRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.SelectTenantAsync(
                new SelectTenantRequest(request.TenantSelectionToken, request.TenantId),
                cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToPlatform);

    public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SelectCompanyAsync(
        AuthenticationCompanySelectionRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.SelectCompanyAsync(
                new SelectCompanyRequest(request.CompanySelectionToken, request.CompanyId),
                cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToPlatform);
}

public sealed class LegacyHrIdentitySessionAdapter(
    AuthSessionService legacyService) : IAuthenticationSessionAdapter
{
    public async Task<AuthenticationOperationResult> LogOutAsync(
        string refreshToken,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.LogOutAsync(refreshToken, cancellationToken));

    public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> RefreshAsync(
        AuthenticationRefreshRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.GetRefreshTokenAsync(
                new RefreshTokenRequest(request.Token, request.RefreshToken),
                cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToPlatform);

    public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SwitchCompanyAsync(
        int companyId,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.SwitchCompanyAsync(companyId, cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToPlatform);

    public async Task<AuthenticationOperationResult> RevokeUserSessionsAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.RevokeRefreshTokenByUserIdAsync(userId, cancellationToken));
}

public sealed class LegacyHrIdentityAccountAdapter(
    AuthAccountService legacyService,
    IUserService legacyUsers) : IAuthenticationAccountAdapter
{
    public async Task<AuthenticationOperationResult> RegisterAsync(
        AuthenticationRegisterRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.RegisterAsync(
                new RegisterRequest(
                    request.FirstName,
                    request.LastName,
                    request.UserName,
                    request.Email,
                    request.Password,
                    request.ProfilePicture),
                cancellationToken));

    public async Task<AuthenticationOperationResult> ConfirmEmailAsync(
        AuthenticationConfirmEmailRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.ConfirmEmailAsync(
                new ConfirmEmailRequest(request.UserId, request.Code),
                cancellationToken));

    public async Task<AuthenticationOperationResult> ResendConfirmationEmailAsync(
        AuthenticationResendConfirmationRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.ResendConfirmationEmailAsync(
                new ResendConfirmationEmailRequest(request.Email),
                cancellationToken));

    public async Task<AuthenticationOperationResult> SendResetPasswordCodeAsync(
        string email,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.SendResetPasswordCodeAsync(email, cancellationToken));

    public async Task<AuthenticationOperationResult> ResetPasswordAsync(
        AuthenticationResetPasswordRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyService.ResetPasswordAsync(
                new ResetPasswordRequest(request.Email, request.Code, request.NewPassword),
                cancellationToken));

    public async Task<AuthenticationOperationResult> ChangePasswordAsync(
        string userId,
        AuthenticationChangePasswordRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToPlatform(
            await legacyUsers.ChangePasswordAsync(
                userId,
                new ChangePasswordRequest(request.CurrentPassword, request.NewPassword),
                cancellationToken));
}
