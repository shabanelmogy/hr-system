using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class AuthEmailLinkBuilderTests
{
    [Fact]
    public void PlatformApplication_RegistersTheAuthenticationFeaturePolicy()
    {
        var services = new ServiceCollection().AddPlatformApplication();
        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(IAuthenticationFeaturePolicy));
    }
}