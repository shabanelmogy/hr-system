namespace HrManagementSystem.Infrastructure.Security.Authentication;

/// <summary>
/// Controls public account-creation behavior. Both switches are intentionally
/// opt-in so an omitted configuration section remains secure by default.
/// </summary>
public sealed class AuthenticationFeatureSettings
{
    public const string SectionName = "AuthenticationFeatureSettings";

    public bool PublicSelfRegistrationEnabled { get; set; }

    public bool GoogleAutoProvisionEnabled { get; set; }
}
