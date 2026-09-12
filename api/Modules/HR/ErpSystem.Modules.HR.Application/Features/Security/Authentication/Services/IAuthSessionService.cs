using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;

/// <summary>
/// Legacy presentation compatibility contract. Platform owns authentication
/// session orchestration while HR retains the existing wire-facing result types.
/// </summary>
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
