using System.Diagnostics;
using ErpSystem.BuildingBlocks.Application;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace ErpSystem.BuildingBlocks.Tests;

public sealed class ApplicationPipelineBehaviorTests
{
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
        Assert.Equal(nameof(TestCommand), stoppedActivity.GetTagItem("erp.application.request.name"));
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
