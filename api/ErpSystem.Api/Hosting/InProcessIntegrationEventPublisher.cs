using System.Collections;
using System.Reflection;
using System.Runtime.ExceptionServices;
using ErpSystem.BuildingBlocks.Messaging;

namespace ErpSystem.Api.Hosting;

/// <summary>
/// Modular-monolith transport for integration events. Durable delivery remains
/// the producer outbox's responsibility; this class only fan-outs one already
/// claimed event to the handlers registered by installed modules.
/// </summary>
internal sealed class InProcessIntegrationEventPublisher(IServiceProvider services)
    : IIntegrationEventPublisher
{
    public async Task PublishAsync(
        IntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(integrationEvent);

        var handlerContract = typeof(IIntegrationEventHandler<>).MakeGenericType(integrationEvent.GetType());
        var enumerableContract = typeof(IEnumerable<>).MakeGenericType(handlerContract);
        if (services.GetService(enumerableContract) is not IEnumerable handlers)
            throw MissingHandler(integrationEvent);

        var resolvedHandlers = handlers.Cast<object>().ToArray();
        if (resolvedHandlers.Length == 0)
            throw MissingHandler(integrationEvent);

        var handleMethod = handlerContract.GetMethod(nameof(IIntegrationEventHandler<IntegrationEvent>.HandleAsync))
            ?? throw new InvalidOperationException($"Handler contract '{handlerContract}' has no HandleAsync method.");

        foreach (var handler in resolvedHandlers)
        {
            cancellationToken.ThrowIfCancellationRequested();

            Task task;
            try
            {
                task = (Task?)handleMethod.Invoke(handler, [integrationEvent, cancellationToken])
                       ?? throw new InvalidOperationException(
                           $"Integration event handler '{handler?.GetType().FullName}' returned no task.");
            }
            catch (TargetInvocationException exception) when (exception.InnerException is not null)
            {
                ExceptionDispatchInfo.Capture(exception.InnerException).Throw();
                throw;
            }

            await task.ConfigureAwait(false);
        }
    }

    private static InvalidOperationException MissingHandler(IntegrationEvent integrationEvent) =>
        new(
            $"No integration-event handler is registered for '{integrationEvent.EventName}' " +
            $"({integrationEvent.GetType().FullName}). The durable producer outbox must retry or dead-letter this fact.");
}
