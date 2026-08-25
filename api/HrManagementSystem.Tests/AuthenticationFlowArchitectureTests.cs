using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Application.Features.Security.Invitations.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;
using Microsoft.AspNetCore.Hosting;

namespace HrManagementSystem.Tests;

public sealed class AuthenticationFlowArchitectureTests
{
    [Theory]
    [InlineData(typeof(AuthLoginService), typeof(IAuthLoginService))]
    [InlineData(typeof(AuthSessionService), typeof(IAuthSessionService))]
    [InlineData(typeof(AuthAccountService), typeof(IAuthAccountService))]
    [InlineData(typeof(UserInvitationService), typeof(IUserInvitationService))]
    public void AuthenticationFlows_ImplementFocusedApplicationContracts(
        Type implementation,
        Type contract)
    {
        Assert.True(contract.IsAssignableFrom(implementation));
    }

    [Fact]
    public void AuthenticationContracts_ExposeOnlyTheirOwnFlow()
    {
        Assert.Equal(4, typeof(IAuthLoginService).GetMethods().Length);
        Assert.Equal(4, typeof(IAuthSessionService).GetMethods().Length);
        Assert.Equal(5, typeof(IAuthAccountService).GetMethods().Length);
    }

    [Fact]
    public void SessionFlow_DoesNotDependOnWebHostOrEmailDelivery()
    {
        var dependencies = typeof(AuthSessionService)
            .GetConstructors()
            .Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.DoesNotContain(typeof(IWebHostEnvironment), dependencies);
        Assert.DoesNotContain(typeof(IAuthEmailService), dependencies);
    }
}
