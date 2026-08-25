using HrManagementSystem.Application.Features.Security.Authentication.Contracts;

namespace HrManagementSystem.Application.Features.Security.Authentication.Services;

public interface IAuthSessionService
{
    Task<Result> LogOutAsync(
        string refreshToken,
        CancellationToken cancellationToken);

    Task<Result<AuthResponse>> GetRefreshTokenAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken);

    Task<Result<AuthResponse>> SwitchCompanyAsync(
        int companyId,
        CancellationToken cancellationToken);

    Task<Result> RevokeRefreshTokenByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default);
}
