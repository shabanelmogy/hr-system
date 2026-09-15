using System.Reflection;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Presentation.Features.Platform.BackgroundJobs.V1;
using ErpSystem.Modules.Platform.Application.BackgroundJobs;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.BuildingBlocks.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class BackgroundJobsControllerTests
{
    private static readonly DateTimeOffset TestNow = new(2026, 9, 14, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void BackgroundJobContracts_AreOwnedByPlatform()
    {
        Assert.Equal(
            "ErpSystem.Modules.Platform.Application",
            typeof(IBackgroundJobDashboardReader).Assembly.GetName().Name);
        Assert.Equal(
            "ErpSystem.Modules.Platform.Application",
            typeof(GetBackgroundJobDashboardQuery).Assembly.GetName().Name);

        var constructorParameters = Assert.Single(typeof(BackgroundJobsController).GetConstructors()).GetParameters();
        Assert.Equal(
            [typeof(ISender)],
            constructorParameters.Select(parameter => parameter.ParameterType));

        var contractsAssembly = typeof(ErpSystem.Modules.Platform.Contracts.AssemblyReference).Assembly;
        Assert.DoesNotContain(
            contractsAssembly.GetTypes(),
            type => string.Equals(
                type.Namespace,
                "ErpSystem.Modules.Platform.Contracts.BackgroundJobs",
                StringComparison.Ordinal));
    }

    [Fact]
    public void Action_RequiresAuthenticationAndHangfireViewPermission()
    {
        var controllerAuthorize = typeof(BackgroundJobsController)
            .GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(controllerAuthorize);

        var action = typeof(BackgroundJobsController).GetMethod(nameof(BackgroundJobsController.GetDashboard));
        var permission = action?.GetCustomAttribute<HasPermissionAttribute>();

        Assert.NotNull(permission);
        Assert.Equal(PlatformPermissions.ViewHangfireDashboard, permission.Policy);
    }

    [Fact]
    public async Task GetDashboard_ReturnsApplicationQuerySnapshot()
    {
        var expected = new BackgroundJobDashboardResponse(
            Servers: 2,
            Queues: 1,
            Enqueued: 3,
            Scheduled: 4,
            Processing: 5,
            Succeeded: 6,
            Failed: 7,
            GeneratedAt: TestNow);
        using var provider = BuildProvider(expected);
        var controller = new BackgroundJobsController(provider.GetRequiredService<ISender>());

        var result = Assert.IsType<OkObjectResult>(
            await controller.GetDashboard(CancellationToken.None));

        Assert.Same(expected, result.Value);
    }

    private static ServiceProvider BuildProvider(BackgroundJobDashboardResponse response)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<IBackgroundJobDashboardReader>(new StubDashboardReader(response));
        services.AddPlatformApplication();
        return services.BuildServiceProvider();
    }

    private sealed class StubDashboardReader(BackgroundJobDashboardResponse response)
        : IBackgroundJobDashboardReader
    {
        public BackgroundJobDashboardResponse GetDashboard() => response;
    }
}

