using ErpSystem.Api.Hosting;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.IntegrationTests;

public sealed class ExecutionContextFoundationTests
{
    [Fact]
    public void SharedExecutionContext_IsAdaptedByPlatformCurrentActor()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(local);Database=unused;Trusted_Connection=True;TrustServerCertificate=True"
            })
            .Build();
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddHostSharedRuntime(configuration);
        services.AddPlatformInfrastructure(configuration);

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();

        var shared = scope.ServiceProvider.GetRequiredService<ICurrentExecutionContext>();
        var actor = scope.ServiceProvider.GetRequiredService<ICurrentActor>();
        var sharedScope = scope.ServiceProvider.GetRequiredService<ICurrentExecutionContextScope>();
        var actorScope = scope.ServiceProvider.GetRequiredService<ICurrentActorScope>();

        Assert.NotSame(actor, shared);

        using (actorScope.BeginScope("user-1", "tenant-1", 42))
        {
            Assert.Equal("user-1", shared.UserId);
            Assert.Equal("tenant-1", shared.TenantId);
            Assert.Equal(42, shared.CompanyId);
            Assert.Equal(shared.UserId, actor.UserId);
            Assert.Equal(shared.TenantId, actor.TenantId);
            Assert.Equal(shared.CompanyId, actor.CompanyId);
        }

        Assert.Null(shared.UserId);
        Assert.Null(shared.TenantId);
        Assert.Null(shared.CompanyId);
    }
}

