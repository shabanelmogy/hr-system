using HrManagementSystem.Application.Features.Security.Authentication.Contracts;

namespace HrManagementSystem.Application.Features.Security.Authentication.Services;

public interface IAuthService
{
    Task<Result<LoginResult>> GetTokenAsync(string userName, string password, CancellationToken cancellationToken);
    Task<Result<LoginResult>> LoginWithGoogleAsync(ExternalLoginUser externalUser, CancellationToken cancellationToken = default);
    Task<Result<AuthResponse>> SelectCompanyAsync(SelectCompanyRequest request, CancellationToken cancellationToken);
    Task<Result> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<Result> LogOutAsync(string refreshToken, CancellationToken cancellationToken);
    Task<Result<AuthResponse>> GetRefreshTokenAsync(RefreshTokenRequest refreshTokenRequest, CancellationToken cancellationToken);
    Task<Result> RevokeRefreshTokenByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<Result> ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken);
    Task<Result> ResendConfirmationEmailAsync(ResendConfirmationEmailRequest request, CancellationToken cancellationToken);
    Task<Result> SendResetPasswordCodeAsync(string email, CancellationToken cancellationToken);
    Task<Result> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}
