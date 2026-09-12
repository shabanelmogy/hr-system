using System.Reflection;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class AuthenticationFeaturePolicyTests
{
    [Fact]
    public void MissingConfiguration_LeavesPublicAccountCreationDisabled()
    {
        var settings = new ConfigurationBuilder()
            .Build()
            .GetSection(AuthenticationFeatureSettings.SectionName)
            .Get<AuthenticationFeatureSettings>()
            ?? new AuthenticationFeatureSettings();

        var policy = CreatePolicy(settings);

        Assert.False(policy.CanSelfRegister);
        Assert.False(policy.CanAutoProvisionGoogleUsers);
    }

    [Theory]
    [InlineData(true, false)]
    [InlineData(false, true)]
    [InlineData(true, true)]
    public void ExplicitConfiguration_EnablesOnlyConfiguredAccountCreationPaths(
        bool selfRegistrationEnabled,
        bool googleAutoProvisionEnabled)
    {
        var settings = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                [$"{AuthenticationFeatureSettings.SectionName}:PublicSelfRegistrationEnabled"] =
                    selfRegistrationEnabled.ToString(),
                [$"{AuthenticationFeatureSettings.SectionName}:GoogleAutoProvisionEnabled"] =
                    googleAutoProvisionEnabled.ToString()
            })
            .Build()
            .GetSection(AuthenticationFeatureSettings.SectionName)
            .Get<AuthenticationFeatureSettings>()
            ?? new AuthenticationFeatureSettings();

        var policy = CreatePolicy(settings);

        Assert.Equal(selfRegistrationEnabled, policy.CanSelfRegister);
        Assert.Equal(googleAutoProvisionEnabled, policy.CanAutoProvisionGoogleUsers);
    }

    [Theory]
    [InlineData(typeof(AuthAccountService))]
    [InlineData(typeof(AuthLoginService))]
    public void LegacyIdentityAccountCreationAdapters_DependOnPlatformAuthenticationFeaturePolicy(Type serviceType)
    {
        var dependencies = serviceType
            .GetConstructors(BindingFlags.Public | BindingFlags.Instance)
            .Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType);

        Assert.Contains(typeof(IAuthenticationFeaturePolicy), dependencies);
    }

    private static IAuthenticationFeaturePolicy CreatePolicy(AuthenticationFeatureSettings settings)
    {
        var services = new ServiceCollection();
        services.AddOptions<AuthenticationFeatureSettings>()
            .Configure(options =>
            {
                options.PublicSelfRegistrationEnabled = settings.PublicSelfRegistrationEnabled;
                options.GoogleAutoProvisionEnabled = settings.GoogleAutoProvisionEnabled;
            });
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        return provider.GetRequiredService<IAuthenticationFeaturePolicy>();
    }
}
