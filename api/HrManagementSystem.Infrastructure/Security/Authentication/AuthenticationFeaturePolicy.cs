namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed class AuthenticationFeaturePolicy(
    IOptions<AuthenticationFeatureSettings> settings)
{
    private readonly AuthenticationFeatureSettings _settings = settings.Value;

    public bool CanSelfRegister => _settings.PublicSelfRegistrationEnabled;

    public bool CanAutoProvisionGoogleUsers => _settings.GoogleAutoProvisionEnabled;
}
