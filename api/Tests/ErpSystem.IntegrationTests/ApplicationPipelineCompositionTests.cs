using ErpSystem.BuildingBlocks.Application;
using ErpSystem.Modules.Accounting.Application;
using ErpSystem.Modules.Contacts.Application;
using ErpSystem.Modules.HR.Application;
using ErpSystem.Modules.Platform.Application;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.IntegrationTests;

public sealed class ApplicationPipelineCompositionTests
{
    [Fact]
    public void ApplicationModules_RegisterSharedPipelineExactlyOnce()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddApplication();
        services.AddPlatformApplication();
        services.AddAccountingApplication();
        services.AddContactsApplication();
        services.AddApplicationPipeline();

        using var provider = services.BuildServiceProvider();

        Assert.NotNull(provider.GetRequiredService<ISender>());
        Assert.Same(TimeProvider.System, provider.GetRequiredService<TimeProvider>());
        var behaviors = provider.GetServices<IPipelineBehavior<TestCommand, string>>().ToList();

        Assert.Equal(2, behaviors.Count);
        Assert.Collection(
            behaviors,
            behavior => Assert.IsType<RequestLoggingBehavior<TestCommand, string>>(behavior),
            behavior => Assert.IsType<ValidationBehavior<TestCommand, string>>(behavior));
    }

    private sealed record TestCommand(string Name) : IRequest<string>;
}
