using ErpSystem.Modules.HR.Application.Common.Errors;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;

/// <summary>
/// Wire-compatible HR presentation facade. Runtime orchestration is owned by
/// Platform and returns through the explicit legacy Identity adapter port.
/// </summary>
public sealed class PlatformAuthenticationLoginCompatibilityService(
    IAuthenticationLoginOrchestrator orchestrator) : IAuthLoginService
{
    public async Task<Result<LoginResult>> GetTokenAsync(
        string userName,
        string password,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.PasswordLoginAsync(
                new AuthenticationPasswordLoginRequest(userName, password),
                cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToHr);

    public async Task<Result<LoginResult>> LoginWithGoogleAsync(
        ExternalLoginUser externalUser,
        CancellationToken cancellationToken = default) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.ExternalLoginAsync(
                new AuthenticationExternalLoginRequest(
                    externalUser.ProviderKey,
                    externalUser.Email,
                    externalUser.FirstName,
                    externalUser.LastName),
                cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToHr);

    public async Task<Result<LoginResult>> SelectTenantAsync(
        SelectTenantRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.SelectTenantAsync(
                new AuthenticationTenantSelectionRequest(
                    request.TenantSelectionToken,
                    request.TenantId),
                cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToHr);

    public async Task<Result<AuthResponse>> SelectCompanyAsync(
        SelectCompanyRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.SelectCompanyAsync(
                new AuthenticationCompanySelectionRequest(
                    request.CompanySelectionToken,
                    request.CompanyId),
                cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToHr);
}

public sealed class PlatformAuthenticationSessionCompatibilityService(
    IAuthenticationSessionOrchestrator orchestrator) : IAuthSessionService
{
    public async Task<Result> LogOutAsync(
        string refreshToken,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.LogOutAsync(refreshToken, cancellationToken));

    public async Task<Result<AuthResponse>> GetRefreshTokenAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.RefreshAsync(
                new AuthenticationRefreshRequest(request.Token, request.RefreshToken),
                cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToHr);

    public async Task<Result<AuthResponse>> SwitchCompanyAsync(
        int companyId,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.SwitchCompanyAsync(companyId, cancellationToken),
            AuthenticationOrchestrationBoundaryMapper.ToHr);

    public async Task<Result> RevokeRefreshTokenByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.RevokeUserSessionsAsync(userId, cancellationToken));
}

public sealed class PlatformAuthenticationAccountCompatibilityService(
    IAuthenticationAccountOrchestrator orchestrator) : IAuthAccountService
{
    public async Task<Result> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.RegisterAsync(
                new AuthenticationRegisterRequest(
                    request.FirstName,
                    request.LastName,
                    request.UserName,
                    request.Email,
                    request.Password,
                    request.ProfilePicture),
                cancellationToken));

    public async Task<Result> ConfirmEmailAsync(
        ConfirmEmailRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.ConfirmEmailAsync(
                new AuthenticationConfirmEmailRequest(request.UserId, request.Code),
                cancellationToken));

    public async Task<Result> ResendConfirmationEmailAsync(
        ResendConfirmationEmailRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.ResendConfirmationEmailAsync(
                new AuthenticationResendConfirmationRequest(request.Email),
                cancellationToken));

    public async Task<Result> SendResetPasswordCodeAsync(
        string email,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.SendResetPasswordCodeAsync(email, cancellationToken));

    public async Task<Result> ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.ResetPasswordAsync(
                new AuthenticationResetPasswordRequest(
                    request.Email,
                    request.Code,
                    request.NewPassword),
                cancellationToken));

    public async Task<Result> ChangePasswordAsync(
        string userId,
        string currentPassword,
        string newPassword,
        CancellationToken cancellationToken) =>
        AuthenticationOrchestrationBoundaryMapper.ToHr(
            await orchestrator.ChangePasswordAsync(
                userId,
                new AuthenticationChangePasswordRequest(currentPassword, newPassword),
                cancellationToken));
}
