using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Application.Authentication.Orchestration;

internal sealed class AuthenticationFeaturePolicy(
    IOptions<AuthenticationFeatureSettings> settings) : IAuthenticationFeaturePolicy
{
    private readonly AuthenticationFeatureSettings _settings = settings.Value;

    public bool CanSelfRegister => _settings.PublicSelfRegistrationEnabled;

    public bool CanAutoProvisionGoogleUsers => _settings.GoogleAutoProvisionEnabled;

    public string? DefaultTenantId => string.IsNullOrWhiteSpace(_settings.DefaultTenantId)
        ? null
        : _settings.DefaultTenantId.Trim();
}
