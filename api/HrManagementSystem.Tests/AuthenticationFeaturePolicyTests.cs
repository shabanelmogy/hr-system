using System.Reflection;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;
using HrManagementSystem.Infrastructure.Security.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.Tests;

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

        var policy = new AuthenticationFeaturePolicy(Options.Create(settings));

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

        var policy = new AuthenticationFeaturePolicy(Options.Create(settings));

        Assert.Equal(selfRegistrationEnabled, policy.CanSelfRegister);
        Assert.Equal(googleAutoProvisionEnabled, policy.CanAutoProvisionGoogleUsers);
    }

    [Theory]
    [InlineData(typeof(AuthAccountService))]
    [InlineData(typeof(AuthLoginService))]
    public void AccountCreationServices_DependsOnAuthenticationFeaturePolicy(Type serviceType)
    {
        var dependencies = serviceType
            .GetConstructors(BindingFlags.Public | BindingFlags.Instance)
            .Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType);

        Assert.Contains(typeof(AuthenticationFeaturePolicy), dependencies);
    }
}
