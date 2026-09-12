namespace ErpSystem.BuildingBlocks.Messaging;

/// <summary>
/// Transport-neutral idempotent consumer boundary. Implementations own the
/// durable receipt and transaction; handlers stage only module-local side effects.
/// </summary>
public interface IIntegrationEventInbox
{
    Task<IntegrationEventConsumeResult> ExecuteOnceAsync(
        string consumerName,
        IntegrationEvent integrationEvent,
        Func<CancellationToken, Task> handler,
        CancellationToken cancellationToken = default);
}

public enum IntegrationEventConsumeResult
{
    Processed = 0,
    Duplicate = 1
}
