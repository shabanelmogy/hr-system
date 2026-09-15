using System.Reflection;
using ErpSystem.Api.Modules;
using ErpSystem.BuildingBlocks.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace ErpSystem.IntegrationTests;

public sealed class BusinessControllerAuthorizationTests
{
    [Fact]
    public void BusinessModuleControllers_UseExplicitScopeAndPermissionPolicies()
    {
        var businessModules = ErpModuleRegistry.Create()
            .Where(module => module.Name is not "HR" and not "Platform");

        foreach (var module in businessModules)
        {
            var assembly = Assembly.Load($"ErpSystem.Modules.{module.Name}.Presentation");
            var controllers = assembly.GetTypes()
                .Where(type => !type.IsAbstract && typeof(ControllerBase).IsAssignableFrom(type));

            foreach (var controller in controllers)
            {
                Assert.Empty(controller.GetCustomAttributes<AllowAnonymousAttribute>(inherit: true));
                var tenantScoped = controller.GetCustomAttribute<TenantMemberAttribute>(inherit: true) is not null;
                var globalAdministratorScoped = controller
                    .GetCustomAttributes<AuthorizeAttribute>(inherit: true)
                    .Any(attribute => string.Equals(attribute.Roles, "super_admin", StringComparison.Ordinal));
                Assert.True(
                    tenantScoped || globalAdministratorScoped,
                    $"{controller.FullName} must declare TenantMember or the explicit global super-admin scope.");

                foreach (var action in controller.GetMethods(BindingFlags.Instance | BindingFlags.Public)
                             .Where(method => method.GetCustomAttributes(inherit: true)
                                 .OfType<IActionHttpMethodProvider>().Any()))
                {
                    Assert.Empty(action.GetCustomAttributes<AllowAnonymousAttribute>(inherit: true));
                    Assert.True(
                        action.GetCustomAttribute<HasPermissionAttribute>(inherit: true) is not null
                        || controller.GetCustomAttribute<HasPermissionAttribute>(inherit: true) is not null,
                        $"{controller.FullName}.{action.Name} must declare a module permission.");
                }
            }
        }
    }
}
