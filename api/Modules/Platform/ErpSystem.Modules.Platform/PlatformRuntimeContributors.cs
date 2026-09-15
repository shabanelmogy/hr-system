using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Infrastructure.Hangfire;
using ErpSystem.Modules.Platform.Infrastructure.Realtime;
using Hangfire;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace ErpSystem.Modules.Platform;

internal sealed class PlatformHangfireDashboardRuntimeContributor(
    PlatformHangfireAuthorizationFilter authorizationFilter) : IHostRuntimeApplicationContributor
{
    public void ConfigureApplication(WebApplication app) =>
        app.UseHangfireDashboard(
            PlatformHangfireSettings.DashboardPath,
            new DashboardOptions
            {
                Authorization = [authorizationFilter],
                AppPath = null,
                DisplayStorageConnectionString = false
            });
}

internal sealed class PlatformRealtimeEndpointContributor : IHostRuntimeEndpointContributor
{
    public void MapEndpoints(IEndpointRouteBuilder endpoints) =>
        endpoints.MapHub<GeneralHub>("/hubs/company").RequireCors("AllowReactApp");
}
