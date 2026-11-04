using System.Reflection;
using ErpSystem.Api.Modules;
using ErpSystem.BuildingBlocks.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports.V1;

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
                // This exact read-only boundary supports either platform permission or
                // tenant module entitlement. Its filter invokes the existing live policy;
                // CQRS then checks trusted company scope and persisted report grants.
                var globalConsumerScoped = controller == typeof(GlobalCrystalReportsController)
                    && controller.GetCustomAttribute<AuthorizeAttribute>(inherit: true) is not null;
                Assert.True(
                    tenantScoped || globalAdministratorScoped || globalConsumerScoped,
                    $"{controller.FullName} must declare an explicit tenant, global administrator, or approved global consumer scope.");

                foreach (var action in controller.GetMethods(BindingFlags.Instance | BindingFlags.Public)
                             .Where(method => method.GetCustomAttributes(inherit: true)
                                 .OfType<IActionHttpMethodProvider>().Any()))
                {
                    Assert.Empty(action.GetCustomAttributes<AllowAnonymousAttribute>(inherit: true));
                    Assert.True(
                        action.GetCustomAttributes<HasPermissionAttribute>(inherit: true).Any()
                        || controller.GetCustomAttributes<HasPermissionAttribute>(inherit: true).Any()
                        || globalConsumerScoped && action.GetCustomAttribute<GlobalCrystalReportAuthorizeAttribute>() is not null,
                        $"{controller.FullName}.{action.Name} must declare a module permission.");
                }
            }
        }
    }

    [Fact]
    public void GlobalReportReplacement_RequiresUploadAndPublishPoliciesTogether()
    {
        var action = typeof(GlobalCrystalReportManagementController)
            .GetMethod(nameof(GlobalCrystalReportManagementController.Replace));
        Assert.NotNull(action);
        var policies = action.GetCustomAttributes<HasPermissionAttribute>(inherit: true)
            .Select(attribute => attribute.Policy).ToArray();
        Assert.Equal(2, policies.Length);
        Assert.Contains("GlobalCrystalReports:Upload", policies);
        Assert.Contains("GlobalCrystalReports:Publish", policies);
    }
}
