using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Presentation.Features.Security.Authentication.V1;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class AuthenticationFlowArchitectureTests
{
    [Fact]
    public void AuthenticationControllers_UseSenderInsteadOfLegacyOrchestrators()
    {
        Assert.Equal(
            [typeof(ISender)],
            Assert.Single(typeof(AuthController).GetConstructors()).GetParameters()
                .Select(parameter => parameter.ParameterType));
        Assert.Equal(
            [typeof(ISender)],
            Assert.Single(typeof(AccountController).GetConstructors()).GetParameters()
                .Select(parameter => parameter.ParameterType));
        Assert.Equal(
            [typeof(ISender)],
            Assert.Single(typeof(GoogleAuthController).GetConstructors()).GetParameters()
                .Select(parameter => parameter.ParameterType));
    }

    [Fact]
    public void AuthenticationContracts_ExposeTransportNeutralResults()
    {
        Assert.Equal(typeof(AuthenticationLoginResult), typeof(AuthenticationOperationResult<AuthenticationLoginResult>).GetProperty(nameof(AuthenticationOperationResult<AuthenticationLoginResult>.Value))!.PropertyType);
        Assert.Equal(typeof(AuthenticationSessionResponse), typeof(AuthenticationOperationResult<AuthenticationSessionResponse>).GetProperty(nameof(AuthenticationOperationResult<AuthenticationSessionResponse>.Value))!.PropertyType);
    }
}
