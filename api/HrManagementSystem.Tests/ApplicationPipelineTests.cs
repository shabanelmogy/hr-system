using FluentValidation;
using HrManagementSystem.Application;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Behaviors;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace HrManagementSystem.Tests;

public sealed class ApplicationPipelineTests
{
    [Fact]
    public void AddApplication_RegistersMediatorAndPipelineBehaviors()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddApplication();

        using var provider = services.BuildServiceProvider();

        Assert.NotNull(provider.GetRequiredService<ISender>());
        Assert.Same(TimeProvider.System, provider.GetRequiredService<TimeProvider>());
        Assert.Equal(
            2,
            provider.GetServices<IPipelineBehavior<TestCommand, string>>().Count());
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

    private sealed record TestCommand(string Name) : ICommand<string>;

    private sealed class TestCommandValidator : AbstractValidator<TestCommand>
    {
        public TestCommandValidator()
        {
            RuleFor(command => command.Name).NotEmpty();
        }
    }
}
