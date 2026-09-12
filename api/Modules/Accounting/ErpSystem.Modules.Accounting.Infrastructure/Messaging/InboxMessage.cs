using ErpSystem.BuildingBlocks.Messaging;

namespace ErpSystem.Modules.Accounting.Infrastructure.Messaging;

public sealed class InboxMessage
{
    private InboxMessage()
    {
    }

    internal static InboxMessage Start(
        string consumerName,
        IntegrationEvent integrationEvent,
        DateTimeOffset receivedOnUtc)
    {
        return new InboxMessage
        {
            ConsumerName = NormalizeConsumerName(consumerName),
            EventId = integrationEvent.EventId,
            EventName = RequiredEventName(integrationEvent),
            EventVersion = RequiredEventVersion(integrationEvent),
            CorrelationId = integrationEvent.CorrelationId,
            CausationId = integrationEvent.CausationId,
            FirstReceivedOnUtc = receivedOnUtc,
            LastAttemptOnUtc = receivedOnUtc,
            Attempts = 1,
            Status = InboxMessageStatus.Processing
        };
    }

    public string ConsumerName { get; private set; } = string.Empty;
    public Guid EventId { get; private set; }
    public string EventName { get; private set; } = string.Empty;
    public int EventVersion { get; private set; }
    public string? CorrelationId { get; private set; }
    public string? CausationId { get; private set; }
    public InboxMessageStatus Status { get; private set; }
    public int Attempts { get; private set; }
    public DateTimeOffset FirstReceivedOnUtc { get; private set; }
    public DateTimeOffset LastAttemptOnUtc { get; private set; }
    public DateTimeOffset? ProcessedOnUtc { get; private set; }
    public string? LastError { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    internal void StartRetry(DateTimeOffset attemptedOnUtc)
    {
        if (Status != InboxMessageStatus.Failed)
            throw new InvalidOperationException($"Cannot retry an inbox message in {Status} status.");

        Status = InboxMessageStatus.Processing;
        Attempts++;
        LastAttemptOnUtc = attemptedOnUtc;
        LastError = null;
    }

    internal void MarkProcessed(DateTimeOffset processedOnUtc)
    {
        if (Status != InboxMessageStatus.Processing)
            throw new InvalidOperationException($"Cannot complete an inbox message in {Status} status.");

        Status = InboxMessageStatus.Processed;
        ProcessedOnUtc = processedOnUtc;
        LastError = null;
    }

    internal void RecordFailedAttempt(DateTimeOffset attemptedOnUtc, string error)
    {
        if (Status == InboxMessageStatus.Processed)
            return;

        if (Status != InboxMessageStatus.Processing)
            Attempts++;

        Status = InboxMessageStatus.Failed;
        LastAttemptOnUtc = attemptedOnUtc;
        LastError = NormalizeError(error);
    }

    internal static string NormalizeConsumerName(string consumerName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(consumerName);
        var normalized = consumerName.Trim();
        if (normalized.Length > 256)
            throw new ArgumentOutOfRangeException(nameof(consumerName), "Consumer name must be 256 characters or fewer.");
        return normalized;
    }

    private static string RequiredEventName(IntegrationEvent integrationEvent)
    {
        ArgumentNullException.ThrowIfNull(integrationEvent);
        if (string.IsNullOrWhiteSpace(integrationEvent.EventName))
            throw new InvalidOperationException("Integration event name must not be empty.");
        return integrationEvent.EventName.Trim();
    }

    private static int RequiredEventVersion(IntegrationEvent integrationEvent)
    {
        if (integrationEvent.EventVersion <= 0)
            throw new InvalidOperationException("Integration event version must be positive.");
        return integrationEvent.EventVersion;
    }

    private static string NormalizeError(string error)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(error);
        var normalized = error.Trim();
        return normalized.Length <= 4000 ? normalized : normalized[..4000];
    }
}
