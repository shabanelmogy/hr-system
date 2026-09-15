using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformAuthenticationOrchestrationOwnershipTests
{
    [Fact]
    public void PlatformApplicationOwnsAuthenticationCqrsAndAdapterPorts()
    {
        var applicationAssembly = typeof(PasswordLoginCommand).Assembly;

        Assert.Equal("ErpSystem.Modules.Platform.Application", applicationAssembly.GetName().Name);
        Assert.Same(applicationAssembly, typeof(IAuthenticationLoginAdapter).Assembly);
        Assert.Same(applicationAssembly, typeof(IAuthenticationSessionAdapter).Assembly);
        Assert.Same(applicationAssembly, typeof(IAuthenticationAccountAdapter).Assembly);
        Assert.Same(applicationAssembly, typeof(IGoogleIdentityVerifier).Assembly);
        Assert.IsAssignableFrom<ICommand<AuthenticationOperationResult<AuthenticationLoginResult>>>(
            new PasswordLoginCommand(new AuthenticationPasswordLoginRequest("user", "password")));
    }
}
