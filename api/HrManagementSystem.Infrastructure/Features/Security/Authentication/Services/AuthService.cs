using HrManagementSystem.Application.Features.Security.Authentication.Contracts;
using HrManagementSystem.Application.Features.Security.Authentication.Services;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthService(
    AuthLoginService login,
    AuthSessionService sessions,
    AuthAccountService accounts) : IAuthService
{
    public Task<Result<LoginResult>> GetTokenAsync(
        string userName,
        string password,
        CancellationToken cancellationToken) =>
        login.GetTokenAsync(userName, password, cancellationToken);

    public Task<Result<LoginResult>> LoginWithGoogleAsync(
        ExternalLoginUser externalUser,
        CancellationToken cancellationToken = default) =>
        login.LoginWithGoogleAsync(externalUser, cancellationToken);

    public Task<Result<LoginResult>> SelectTenantAsync(
        SelectTenantRequest request,
        CancellationToken cancellationToken) =>
        login.SelectTenantAsync(request, cancellationToken);

    public Task<Result<AuthResponse>> SelectCompanyAsync(
        SelectCompanyRequest request,
        CancellationToken cancellationToken) =>
        login.SelectCompanyAsync(request, cancellationToken);

    public Task<Result> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken) =>
        accounts.RegisterAsync(request, cancellationToken);

    public Task<Result> LogOutAsync(
        string refreshToken,
        CancellationToken cancellationToken) =>
        sessions.LogOutAsync(refreshToken, cancellationToken);

    public Task<Result<AuthResponse>> GetRefreshTokenAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken) =>
        sessions.GetRefreshTokenAsync(request, cancellationToken);

    public Task<Result> RevokeRefreshTokenByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        sessions.RevokeRefreshTokenByUserIdAsync(userId, cancellationToken);

    public Task<Result> ConfirmEmailAsync(
        ConfirmEmailRequest request,
        CancellationToken cancellationToken) =>
        accounts.ConfirmEmailAsync(request, cancellationToken);

    public Task<Result> ResendConfirmationEmailAsync(
        ResendConfirmationEmailRequest request,
        CancellationToken cancellationToken) =>
        accounts.ResendConfirmationEmailAsync(request, cancellationToken);

    public Task<Result> SendResetPasswordCodeAsync(
        string email,
        CancellationToken cancellationToken) =>
        accounts.SendResetPasswordCodeAsync(email, cancellationToken);

    public Task<Result> ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken) =>
        accounts.ResetPasswordAsync(request, cancellationToken);
}
