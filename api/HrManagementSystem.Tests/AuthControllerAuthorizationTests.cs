using System.Reflection;
using HrManagementSystem.Features.Security.Authentication.Controllers.V1;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using HrManagementSystem.Shared.Consts;
using Microsoft.AspNetCore.Authorization;

namespace HrManagementSystem.Tests;

public sealed class AuthControllerAuthorizationTests
{
    [Fact]
    public void RevokeByUserId_RequiresEditUsersPermission()
    {
        var method = GetAction(nameof(AuthController.RevokeRefreshTokenByUserId));
        var attribute = method.GetCustomAttribute<HasPermissionAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal(Permissions.EditUsers, attribute.Policy);
    }

    [Theory]
    [InlineData(nameof(AuthController.Login))]
    [InlineData(nameof(AuthController.Register))]
    [InlineData(nameof(AuthController.LogOut))]
    [InlineData(nameof(AuthController.RefreshToken))]
    public void PublicAuthenticationActions_AreExplicitlyAnonymous(string actionName)
    {
        Assert.NotNull(GetAction(actionName).GetCustomAttribute<AllowAnonymousAttribute>());
    }

    [Theory]
    [InlineData(nameof(AuthController.Session))]
    [InlineData(nameof(AuthController.RealtimeToken))]
    public void SessionTokenActions_RequireAuthorization(string actionName)
    {
        Assert.NotNull(GetAction(actionName).GetCustomAttribute<AuthorizeAttribute>());
    }

    private static MethodInfo GetAction(string name) =>
        typeof(AuthController).GetMethod(name)
        ?? throw new InvalidOperationException($"Action {name} was not found.");
}
