using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class AuthenticationFeaturePolicyTests
{
    [Fact]
    public void MissingConfiguration_LeavesPublicAccountCreationDisabled()
    {
        using var provider = CreateProvider(new AuthenticationFeatureSettings());
        var policy = provider.GetRequiredService<IAuthenticationFeaturePolicy>();
        Assert.False(policy.CanSelfRegister);
        Assert.False(policy.CanAutoProvisionGoogleUsers);
    }

    private static ServiceProvider CreateProvider(AuthenticationFeatureSettings settings) =>
        new ServiceCollection()
            .AddOptions<AuthenticationFeatureSettings>()
            .Configure(options =>
            {
                options.PublicSelfRegistrationEnabled = settings.PublicSelfRegistrationEnabled;
                options.GoogleAutoProvisionEnabled = settings.GoogleAutoProvisionEnabled;
                options.DefaultTenantId = settings.DefaultTenantId;
            })
            .Services
            .AddPlatformApplication()
            .BuildServiceProvider();
}