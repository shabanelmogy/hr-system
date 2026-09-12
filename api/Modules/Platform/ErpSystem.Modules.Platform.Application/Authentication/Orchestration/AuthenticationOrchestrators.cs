using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Application.Authentication.Orchestration;

internal sealed class AuthenticationLoginOrchestrator(
    IAuthenticationLoginAdapter adapter) : IAuthenticationLoginOrchestrator
{
    public Task<AuthenticationOperationResult<AuthenticationLoginResult>> PasswordLoginAsync(
        AuthenticationPasswordLoginRequest request,
        CancellationToken cancellationToken) =>
        adapter.PasswordLoginAsync(request, cancellationToken);

    public Task<AuthenticationOperationResult<AuthenticationLoginResult>> ExternalLoginAsync(
        AuthenticationExternalLoginRequest request,
        CancellationToken cancellationToken = default) =>
        adapter.ExternalLoginAsync(request, cancellationToken);

    public Task<AuthenticationOperationResult<AuthenticationLoginResult>> SelectTenantAsync(
        AuthenticationTenantSelectionRequest request,
        CancellationToken cancellationToken) =>
        adapter.SelectTenantAsync(request, cancellationToken);

    public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SelectCompanyAsync(
        AuthenticationCompanySelectionRequest request,
        CancellationToken cancellationToken) =>
        adapter.SelectCompanyAsync(request, cancellationToken);
}

internal sealed class AuthenticationSessionOrchestrator(
    IAuthenticationSessionAdapter adapter) : IAuthenticationSessionOrchestrator
{
    public Task<AuthenticationOperationResult> LogOutAsync(
        string refreshToken,
        CancellationToken cancellationToken) =>
        adapter.LogOutAsync(refreshToken, cancellationToken);

    public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> RefreshAsync(
        AuthenticationRefreshRequest request,
        CancellationToken cancellationToken) =>
        adapter.RefreshAsync(request, cancellationToken);

    public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SwitchCompanyAsync(
        int companyId,
        CancellationToken cancellationToken) =>
        adapter.SwitchCompanyAsync(companyId, cancellationToken);

    public Task<AuthenticationOperationResult> RevokeUserSessionsAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        adapter.RevokeUserSessionsAsync(userId, cancellationToken);
}

internal sealed class AuthenticationSessionContextService(
    ITenantAccessService tenantAccess,
    ICompanyAccessService companyAccess) : IAuthenticationSessionContextService
{
    public async Task<AuthenticationSessionContextResponse?> GetAsync(
        AuthenticationSessionContextRequest request,
        CancellationToken cancellationToken = default)
    {
        // Preserve the legacy controller's lookup order: tenant state first,
        // company access second, then validate the selected company.
        var tenant = await tenantAccess.GetAsync(request.TenantId, cancellationToken);
        var availableCompanies = await companyAccess.GetAvailableCompaniesAsync(
            request.UserId,
            request.TenantId,
            cancellationToken);
        var companies = availableCompanies
            .Select(company => new AuthenticationCompanyOption(
                company.Id,
                company.CompanyCode,
                company.NameAr,
                company.NameEn))
            .ToArray();
        var selectedCompany = companies.SingleOrDefault(company => company.Id == request.CompanyId);

        if (tenant is null || selectedCompany is null)
            return null;

        return new AuthenticationSessionContextResponse(
            request.UserId,
            request.TenantId,
            tenant.TenantName,
            tenant.PlanName,
            request.CompanyId,
            selectedCompany.CompanyCode,
            selectedCompany.NameAr,
            selectedCompany.NameEn,
            companies,
            request.UserName,
            request.Email,
            request.FirstName,
            request.LastName,
            request.Roles,
            request.Permissions,
            tenant.SubscriptionStatus,
            tenant.SubscriptionEndsOn,
            tenant.IsReadOnly,
            request.ExpiresAt);
    }
}

internal sealed class AuthenticationAccountOrchestrator(
    IAuthenticationAccountAdapter adapter) : IAuthenticationAccountOrchestrator
{
    public Task<AuthenticationOperationResult> RegisterAsync(
        AuthenticationRegisterRequest request,
        CancellationToken cancellationToken) =>
        adapter.RegisterAsync(request, cancellationToken);

    public Task<AuthenticationOperationResult> ConfirmEmailAsync(
        AuthenticationConfirmEmailRequest request,
        CancellationToken cancellationToken) =>
        adapter.ConfirmEmailAsync(request, cancellationToken);

    public Task<AuthenticationOperationResult> ResendConfirmationEmailAsync(
        AuthenticationResendConfirmationRequest request,
        CancellationToken cancellationToken) =>
        adapter.ResendConfirmationEmailAsync(request, cancellationToken);

    public Task<AuthenticationOperationResult> SendResetPasswordCodeAsync(
        string email,
        CancellationToken cancellationToken) =>
        adapter.SendResetPasswordCodeAsync(email, cancellationToken);

    public Task<AuthenticationOperationResult> ResetPasswordAsync(
        AuthenticationResetPasswordRequest request,
        CancellationToken cancellationToken) =>
        adapter.ResetPasswordAsync(request, cancellationToken);

    public Task<AuthenticationOperationResult> ChangePasswordAsync(
        string userId,
        AuthenticationChangePasswordRequest request,
        CancellationToken cancellationToken) =>
        adapter.ChangePasswordAsync(userId, request, cancellationToken);
}

internal sealed class AuthenticationFeaturePolicy(
    IOptions<AuthenticationFeatureSettings> settings) : IAuthenticationFeaturePolicy
{
    private readonly AuthenticationFeatureSettings _settings = settings.Value;

    public bool CanSelfRegister => _settings.PublicSelfRegistrationEnabled;

    public bool CanAutoProvisionGoogleUsers => _settings.GoogleAutoProvisionEnabled;
}
