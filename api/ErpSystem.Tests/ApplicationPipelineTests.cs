using FluentValidation;
using System.Diagnostics;
using ErpSystem.BuildingBlocks.Application;
using ErpSystem.Modules.Accounting.Application;
using ErpSystem.Modules.Contacts.Application;
using ErpSystem.Modules.HR.Application;
using ErpSystem.Modules.Platform.Application;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace ErpSystem.Tests;

public sealed class ApplicationPipelineTests
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

    [Fact]
    public async Task ValidationBehavior_StopsInvalidRequestBeforeHandler()
    {
        var behavior = new ValidationBehavior<TestCommand, string>([new TestCommandValidator()]);
        var handlerWasCalled = false;

        await Assert.ThrowsAsync<ValidationException>(() =>
            behavior.Handle(
                new TestCommand(string.Empty),
                _ =>
                {
                    handlerWasCalled = true;
                    return Task.FromResult("handled");
                },
                CancellationToken.None));

        Assert.False(handlerWasCalled);
    }

    [Fact]
    public async Task Pipeline_AllowsValidRequestAndReturnsHandlerResponse()
    {
        var validation = new ValidationBehavior<TestCommand, string>([new TestCommandValidator()]);
        var logging = new RequestLoggingBehavior<TestCommand, string>(
            NullLogger<RequestLoggingBehavior<TestCommand, string>>.Instance);

        var response = await logging.Handle(
            new TestCommand("valid"),
            cancellationToken => validation.Handle(
                new TestCommand("valid"),
                _ => Task.FromResult("handled"),
                cancellationToken),
            CancellationToken.None);

        Assert.Equal("handled", response);
    }

    [Fact]
    public async Task RequestLoggingBehavior_EmitsBoundedApplicationActivityWithoutPayload()
    {
        Activity? stoppedActivity = null;
        using var listener = new ActivityListener
        {
            ShouldListenTo = source => source.Name == ApplicationTelemetry.ActivitySourceName,
            Sample = static (ref ActivityCreationOptions<ActivityContext> _) =>
                ActivitySamplingResult.AllDataAndRecorded,
            ActivityStopped = activity => stoppedActivity = activity
        };
        ActivitySource.AddActivityListener(listener);
        var behavior = new RequestLoggingBehavior<TestCommand, string>(
            NullLogger<RequestLoggingBehavior<TestCommand, string>>.Instance);

        await behavior.Handle(
            new TestCommand("sensitive-payload-must-not-be-recorded"),
            _ => Task.FromResult("handled"),
            CancellationToken.None);

        Assert.NotNull(stoppedActivity);
        Assert.Equal(nameof(TestCommand), stoppedActivity!.OperationName);
        Assert.Equal(ActivityStatusCode.Ok, stoppedActivity.Status);
        Assert.Equal(
            nameof(TestCommand),
            stoppedActivity.GetTagItem("erp.application.request.name"));
        Assert.Equal(
            typeof(TestCommand).Assembly.GetName().Name,
            stoppedActivity.GetTagItem("erp.application.module.name"));
        Assert.DoesNotContain(
            stoppedActivity.TagObjects,
            tag => string.Equals(
                tag.Value?.ToString(),
                "sensitive-payload-must-not-be-recorded",
                StringComparison.Ordinal));
    }

    private sealed record TestCommand(string Name) : IRequest<string>;

    private sealed class TestCommandValidator : AbstractValidator<TestCommand>
    {
        public TestCommandValidator()
        {
            RuleFor(command => command.Name).NotEmpty();
        }
    }
}
