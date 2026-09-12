namespace ErpSystem.BuildingBlocks.Messaging;

/// <summary>
/// Transport-neutral publication boundary used by durable outbox dispatchers.
/// The publisher is deliberately unaware of persistence/retry semantics; those
/// remain owned by the producing module's outbox.
/// </summary>
public interface IIntegrationEventPublisher
{
    Task PublishAsync(
        IntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Strongly typed cross-module integration event handler. Implementations must
/// remain idempotent at the module boundary, normally through an inbox receipt.
/// </summary>
public interface IIntegrationEventHandler<in TIntegrationEvent>
    where TIntegrationEvent : IntegrationEvent
{
    Task HandleAsync(
        TIntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default);
}
