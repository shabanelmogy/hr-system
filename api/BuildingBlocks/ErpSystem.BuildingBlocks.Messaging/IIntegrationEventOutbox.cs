namespace ErpSystem.BuildingBlocks.Messaging;

/// <summary>
/// Stages an integration event in the current module unit of work.
/// Implementations must not publish directly or commit independently; the caller
/// commits business changes and the outbox row in one transaction.
/// </summary>
public interface IIntegrationEventOutbox
{
    void Enqueue(IntegrationEvent integrationEvent);
}
