using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;

namespace ErpSystem.Modules.Platform.Application.Authentication.Orchestration;

public sealed record PasswordLoginCommand(AuthenticationPasswordLoginRequest Request)
    : ICommand<AuthenticationOperationResult<AuthenticationLoginResult>>;

public sealed record SelectTenantCommand(AuthenticationTenantSelectionRequest Request)
    : ICommand<AuthenticationOperationResult<AuthenticationLoginResult>>;

public sealed record SelectCompanyCommand(AuthenticationCompanySelectionRequest Request)
    : ICommand<AuthenticationOperationResult<AuthenticationSessionResponse>>;

public sealed record SwitchCompanyCommand(int CompanyId)
    : ICommand<AuthenticationOperationResult<AuthenticationSessionResponse>>;

public sealed record RegisterAuthenticationAccountCommand(AuthenticationRegisterRequest Request)
    : ICommand<AuthenticationOperationResult>;

public sealed record LogoutAuthenticationSessionCommand(string RefreshToken)
    : ICommand<AuthenticationOperationResult>;

public sealed record RefreshAuthenticationSessionCommand(AuthenticationRefreshRequest Request)
    : ICommand<AuthenticationOperationResult<AuthenticationSessionResponse>>;

public sealed record RevokeAuthenticationSessionsCommand(string UserId)
    : ICommand<AuthenticationOperationResult>;

public sealed record ConfirmAuthenticationEmailCommand(AuthenticationConfirmEmailRequest Request)
    : ICommand<AuthenticationOperationResult>;

public sealed record ResendAuthenticationConfirmationCommand(AuthenticationResendConfirmationRequest Request)
    : ICommand<AuthenticationOperationResult>;

public sealed record SendAuthenticationResetCodeCommand(string Email)
    : ICommand<AuthenticationOperationResult>;

public sealed record ResetAuthenticationPasswordCommand(AuthenticationResetPasswordRequest Request)
    : ICommand<AuthenticationOperationResult>;

public sealed record ChangeAuthenticationPasswordCommand(
    string UserId,
    AuthenticationChangePasswordRequest Request) : ICommand<AuthenticationOperationResult>;

public sealed record GetAuthenticationSessionContextQuery(AuthenticationSessionContextRequest Request)
    : IQuery<AuthenticationSessionContextResponse?>;

public sealed record GenerateRealtimeAuthenticationTokenQuery(
    IReadOnlyCollection<AccessTokenClaimValue> Claims) : IQuery<string>;

public sealed record GoogleIdentity(
    string ProviderKey,
    string Email,
    string FirstName,
    string LastName);

public interface IGoogleIdentityVerifier
{
    Task<GoogleIdentity?> VerifyAsync(string credential, CancellationToken cancellationToken = default);
}

public sealed record GoogleExternalLoginCommand(string Credential)
    : ICommand<AuthenticationOperationResult<AuthenticationLoginResult>?>;

public sealed class PasswordLoginCommandHandler(IAuthenticationLoginAdapter adapter)
    : ICommandHandler<PasswordLoginCommand, AuthenticationOperationResult<AuthenticationLoginResult>>
{
    public Task<AuthenticationOperationResult<AuthenticationLoginResult>> Handle(
        PasswordLoginCommand command,
        CancellationToken cancellationToken) =>
        adapter.PasswordLoginAsync(command.Request, cancellationToken);
}

public sealed class SelectTenantCommandHandler(IAuthenticationLoginAdapter adapter)
    : ICommandHandler<SelectTenantCommand, AuthenticationOperationResult<AuthenticationLoginResult>>
{
    public Task<AuthenticationOperationResult<AuthenticationLoginResult>> Handle(
        SelectTenantCommand command,
        CancellationToken cancellationToken) =>
        adapter.SelectTenantAsync(command.Request, cancellationToken);
}

public sealed class SelectCompanyCommandHandler(IAuthenticationLoginAdapter adapter)
    : ICommandHandler<SelectCompanyCommand, AuthenticationOperationResult<AuthenticationSessionResponse>>
{
    public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> Handle(
        SelectCompanyCommand command,
        CancellationToken cancellationToken) =>
        adapter.SelectCompanyAsync(command.Request, cancellationToken);
}

public sealed class SwitchCompanyCommandHandler(IAuthenticationSessionAdapter adapter)
    : ICommandHandler<SwitchCompanyCommand, AuthenticationOperationResult<AuthenticationSessionResponse>>
{
    public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> Handle(
        SwitchCompanyCommand command,
        CancellationToken cancellationToken) =>
        adapter.SwitchCompanyAsync(command.CompanyId, cancellationToken);
}

public sealed class RegisterAuthenticationAccountCommandHandler(IAuthenticationAccountAdapter adapter)
    : ICommandHandler<RegisterAuthenticationAccountCommand, AuthenticationOperationResult>
{
    public Task<AuthenticationOperationResult> Handle(
        RegisterAuthenticationAccountCommand command,
        CancellationToken cancellationToken) =>
        adapter.RegisterAsync(command.Request, cancellationToken);
}

public sealed class LogoutAuthenticationSessionCommandHandler(IAuthenticationSessionAdapter adapter)
    : ICommandHandler<LogoutAuthenticationSessionCommand, AuthenticationOperationResult>
{
    public Task<AuthenticationOperationResult> Handle(
        LogoutAuthenticationSessionCommand command,
        CancellationToken cancellationToken) =>
        adapter.LogOutAsync(command.RefreshToken, cancellationToken);
}

public sealed class RefreshAuthenticationSessionCommandHandler(IAuthenticationSessionAdapter adapter)
    : ICommandHandler<RefreshAuthenticationSessionCommand, AuthenticationOperationResult<AuthenticationSessionResponse>>
{
    public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> Handle(
        RefreshAuthenticationSessionCommand command,
        CancellationToken cancellationToken) =>
        adapter.RefreshAsync(command.Request, cancellationToken);
}

public sealed class RevokeAuthenticationSessionsCommandHandler(IAuthenticationSessionAdapter adapter)
    : ICommandHandler<RevokeAuthenticationSessionsCommand, AuthenticationOperationResult>
{
    public Task<AuthenticationOperationResult> Handle(
        RevokeAuthenticationSessionsCommand command,
        CancellationToken cancellationToken) =>
        adapter.RevokeUserSessionsAsync(command.UserId, cancellationToken);
}

public sealed class ConfirmAuthenticationEmailCommandHandler(IAuthenticationAccountAdapter adapter)
    : ICommandHandler<ConfirmAuthenticationEmailCommand, AuthenticationOperationResult>
{
    public Task<AuthenticationOperationResult> Handle(
        ConfirmAuthenticationEmailCommand command,
        CancellationToken cancellationToken) =>
        adapter.ConfirmEmailAsync(command.Request, cancellationToken);
}

public sealed class ResendAuthenticationConfirmationCommandHandler(IAuthenticationAccountAdapter adapter)
    : ICommandHandler<ResendAuthenticationConfirmationCommand, AuthenticationOperationResult>
{
    public Task<AuthenticationOperationResult> Handle(
        ResendAuthenticationConfirmationCommand command,
        CancellationToken cancellationToken) =>
        adapter.ResendConfirmationEmailAsync(command.Request, cancellationToken);
}

public sealed class SendAuthenticationResetCodeCommandHandler(IAuthenticationAccountAdapter adapter)
    : ICommandHandler<SendAuthenticationResetCodeCommand, AuthenticationOperationResult>
{
    public Task<AuthenticationOperationResult> Handle(
        SendAuthenticationResetCodeCommand command,
        CancellationToken cancellationToken) =>
        adapter.SendResetPasswordCodeAsync(command.Email, cancellationToken);
}

public sealed class ResetAuthenticationPasswordCommandHandler(IAuthenticationAccountAdapter adapter)
    : ICommandHandler<ResetAuthenticationPasswordCommand, AuthenticationOperationResult>
{
    public Task<AuthenticationOperationResult> Handle(
        ResetAuthenticationPasswordCommand command,
        CancellationToken cancellationToken) =>
        adapter.ResetPasswordAsync(command.Request, cancellationToken);
}

public sealed class ChangeAuthenticationPasswordCommandHandler(IAuthenticationAccountAdapter adapter)
    : ICommandHandler<ChangeAuthenticationPasswordCommand, AuthenticationOperationResult>
{
    public Task<AuthenticationOperationResult> Handle(
        ChangeAuthenticationPasswordCommand command,
        CancellationToken cancellationToken) =>
        adapter.ChangePasswordAsync(command.UserId, command.Request, cancellationToken);
}

public sealed class GenerateRealtimeAuthenticationTokenQueryHandler(IAuthenticationTokenService tokenService)
    : IQueryHandler<GenerateRealtimeAuthenticationTokenQuery, string>
{
    public Task<string> Handle(
        GenerateRealtimeAuthenticationTokenQuery query,
        CancellationToken cancellationToken) =>
        Task.FromResult(tokenService.GenerateRealtimeToken(query.Claims));
}

public sealed class GoogleExternalLoginCommandHandler(
    IGoogleIdentityVerifier verifier,
    IAuthenticationLoginAdapter adapter)
    : ICommandHandler<GoogleExternalLoginCommand, AuthenticationOperationResult<AuthenticationLoginResult>?>
{
    public async Task<AuthenticationOperationResult<AuthenticationLoginResult>?> Handle(
        GoogleExternalLoginCommand command,
        CancellationToken cancellationToken)
    {
        var identity = await verifier.VerifyAsync(command.Credential, cancellationToken).ConfigureAwait(false);
        if (identity is null)
            return null;

        return await adapter.ExternalLoginAsync(
            new AuthenticationExternalLoginRequest(
                identity.ProviderKey,
                identity.Email,
                identity.FirstName,
                identity.LastName),
            cancellationToken).ConfigureAwait(false);
    }
}

public sealed class GetAuthenticationSessionContextQueryHandler(
    ITenantAccessService tenantAccess,
    ICompanyAccessService companyAccess)
    : IQueryHandler<GetAuthenticationSessionContextQuery, AuthenticationSessionContextResponse?>
{
    public async Task<AuthenticationSessionContextResponse?> Handle(
        GetAuthenticationSessionContextQuery query,
        CancellationToken cancellationToken)
    {
        var request = query.Request;
        var tenant = await tenantAccess.GetAsync(request.TenantId, cancellationToken).ConfigureAwait(false);
        var availableCompanies = await companyAccess.GetAvailableCompaniesAsync(
            request.UserId,
            request.TenantId,
            cancellationToken).ConfigureAwait(false);
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
