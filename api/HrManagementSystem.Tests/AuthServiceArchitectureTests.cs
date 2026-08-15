using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;
using Microsoft.AspNetCore.Hosting;

namespace HrManagementSystem.Tests;

public sealed class AuthServiceArchitectureTests
{
    [Fact]
    public void AuthService_RemainsAThinFacadeOverCohesiveFlows()
    {
        var constructor = Assert.Single(typeof(AuthService).GetConstructors());
        var dependencies = constructor
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.Equal(
            [typeof(AuthLoginService), typeof(AuthSessionService), typeof(AuthAccountService)],
            dependencies);
        Assert.True(typeof(IAuthService).IsAssignableFrom(typeof(AuthService)));
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
