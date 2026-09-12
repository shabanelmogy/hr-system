using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.HR.Infrastructure.Common.Storage;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.HR.Infrastructure.Hangfire;
using ErpSystem.Modules.HR.Infrastructure.Hangfire.Filters;
using ErpSystem.Modules.HR.Infrastructure.Hubs.GeneralHub;
using ErpSystem.Modules.HR.Infrastructure.Persistence.Seeds;
using Hangfire;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;

namespace ErpSystem.Modules.HR;

/// <summary>
/// Legacy scheduler-dashboard adapter. The host owns when runtime middleware is
/// composed; the HR bootstrap keeps this adapter only because the current
/// Hangfire authorization policy/session implementation still lives in legacy HR
/// infrastructure.
/// </summary>
internal sealed class LegacyHangfireDashboardRuntimeContributor(
    HangfireAuthorizationFilter authorizationFilter) : IHostRuntimeApplicationContributor
{
    internal const string DashboardPath = HangfireSessionAuthentication.DashboardPath;

    public void ConfigureApplication(WebApplication app) =>
        app.UseHangfireDashboard(DashboardPath, CreateOptions(authorizationFilter));

    internal static DashboardOptions CreateOptions(HangfireAuthorizationFilter authorizationFilter) =>
        new()
        {
            Authorization = [authorizationFilter],
            AppPath = null,
            DisplayStorageConnectionString = false
        };
}

/// <summary>
/// Legacy realtime hub adapter. The host owns technical endpoint mapping while
/// the hub remains in HR infrastructure until its permission/realtime claim
/// model is independently extracted.
/// </summary>
internal sealed class LegacyCompanyRealtimeEndpointContributor : IHostRuntimeEndpointContributor
{
    internal const string HubPath = "/hubs/company";
    internal const string CorsPolicy = "AllowReactApp";

    public void MapEndpoints(IEndpointRouteBuilder endpoints) =>
        endpoints.MapHub<GeneralHub>(HubPath).RequireCors(CorsPolicy);
}

/// <summary>
/// Compatibility startup task for moving the old public uploads/images folders
/// into protected storage. Physical storage intentionally remains with the
/// legacy HR files adapter; only startup ownership is host/platform runtime.
/// </summary>
internal sealed class LegacyProtectedFileStorageStartupTask(
    IWebHostEnvironment environment) : IHostRuntimeStartupTask
{
    public Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ProtectedFileStorage.MigrateLegacyFiles(environment);
        return Task.CompletedTask;
    }
}

/// <summary>
/// Compatibility adapter for the existing ASP.NET Identity-backed system
/// role/permission bootstrap. Platform/host owns startup timing; physical role
/// storage and the current permission catalog remain in legacy HR for now.
/// </summary>
internal sealed class LegacySystemRolePermissionStartupTask(
    RoleManager<ApplicationRole> roleManager,
    ModuleCatalog moduleCatalog) : IHostRuntimeStartupTask
{
    public Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var tenantPermissions = moduleCatalog.TenantEntitlementDefinitions
            .SelectMany(definition => definition.Submodules)
            .SelectMany(submodule => submodule.RequiredPermissions)
            .Where(permission => !string.IsNullOrWhiteSpace(permission))
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        return SeedsRequest.SeedSystemRolesAndPermissionsAsync(roleManager, tenantPermissions)
            .WaitAsync(cancellationToken);
    }
}
