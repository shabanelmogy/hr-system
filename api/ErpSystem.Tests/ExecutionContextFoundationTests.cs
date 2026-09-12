using ErpSystem.Api.Hosting;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Infrastructure.Dependencies;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class ExecutionContextFoundationTests
{
    [Fact]
    public void SharedExecutionContext_UsesCurrentHrCompatibilityImplementation()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddHostSharedRuntime();
        services.AddGlobalService(new ConfigurationBuilder().Build());

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();

        var shared = scope.ServiceProvider.GetRequiredService<ICurrentExecutionContext>();
        var legacy = scope.ServiceProvider.GetRequiredService<ICurrentActor>();
        var sharedScope = scope.ServiceProvider.GetRequiredService<ICurrentExecutionContextScope>();
        var legacyScope = scope.ServiceProvider.GetRequiredService<ICurrentActorScope>();

        Assert.NotSame(legacy, shared);

        using (legacyScope.BeginScope("user-1", "tenant-1", 42))
        {
            Assert.Equal("user-1", shared.UserId);
            Assert.Equal("tenant-1", shared.TenantId);
            Assert.Equal(42, shared.CompanyId);
            Assert.Equal(shared.UserId, legacy.UserId);
            Assert.Equal(shared.TenantId, legacy.TenantId);
            Assert.Equal(shared.CompanyId, legacy.CompanyId);
        }

        Assert.Null(shared.UserId);
        Assert.Null(shared.TenantId);
        Assert.Null(shared.CompanyId);
    }
}
