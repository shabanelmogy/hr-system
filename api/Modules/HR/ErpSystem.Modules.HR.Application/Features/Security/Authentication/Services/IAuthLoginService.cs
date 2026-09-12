using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;

/// <summary>
/// Legacy presentation compatibility contract. Platform owns authentication
/// orchestration; HR retains these signatures only to preserve existing route DTOs.
/// </summary>
public interface IAuthLoginService
{
    Task<Result<LoginResult>> GetTokenAsync(
        string userName,
        string password,
        CancellationToken cancellationToken);

    Task<Result<LoginResult>> LoginWithGoogleAsync(
        ExternalLoginUser externalUser,
        CancellationToken cancellationToken = default);

    Task<Result<LoginResult>> SelectTenantAsync(
        SelectTenantRequest request,
        CancellationToken cancellationToken);

    Task<Result<AuthResponse>> SelectCompanyAsync(
        SelectCompanyRequest request,
        CancellationToken cancellationToken);
}
