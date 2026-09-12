using ErpSystem.BuildingBlocks.Messaging;

namespace ErpSystem.Modules.Contacts.Infrastructure.Messaging;

public sealed class OutboxMessage
{
    private OutboxMessage()
    {
    }

    internal static OutboxMessage Create(IntegrationEvent integrationEvent, string payload)
    {
        ArgumentNullException.ThrowIfNull(integrationEvent);
        ArgumentException.ThrowIfNullOrWhiteSpace(payload);
        if (string.IsNullOrWhiteSpace(integrationEvent.EventName))
            throw new InvalidOperationException("Integration event name must not be empty.");
        if (integrationEvent.EventVersion <= 0)
            throw new InvalidOperationException("Integration event version must be positive.");

        return new OutboxMessage
        {
            EventId = integrationEvent.EventId,
            EventName = integrationEvent.EventName.Trim(),
            EventVersion = integrationEvent.EventVersion,
            OccurredOnUtc = integrationEvent.OccurredOnUtc,
            CorrelationId = integrationEvent.CorrelationId,
            CausationId = integrationEvent.CausationId,
            Payload = payload,
            ContentType = "application/json",
            Status = OutboxMessageStatus.Pending
        };
    }

    public Guid EventId { get; private set; }
    public string EventName { get; private set; } = string.Empty;
    public int EventVersion { get; private set; }
    public DateTimeOffset OccurredOnUtc { get; private set; }
    public string? CorrelationId { get; private set; }
    public string? CausationId { get; private set; }
    public string Payload { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public OutboxMessageStatus Status { get; private set; }
    public int Attempts { get; private set; }
    public DateTimeOffset? LastAttemptOnUtc { get; private set; }
    public DateTimeOffset? NextAttemptOnUtc { get; private set; }
    public DateTimeOffset? PublishedOnUtc { get; private set; }
    public string? LastError { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    internal void StartAttempt(DateTimeOffset attemptedOnUtc, bool recoverProcessing = false)
    {
        var canStart = Status is OutboxMessageStatus.Pending or OutboxMessageStatus.Failed ||
                       (recoverProcessing && Status == OutboxMessageStatus.Processing);
        if (!canStart)
            throw new InvalidOperationException($"Cannot claim an outbox message in {Status} status.");

        Status = OutboxMessageStatus.Processing;
        Attempts++;
        LastAttemptOnUtc = attemptedOnUtc;
        NextAttemptOnUtc = null;
        LastError = null;
    }

    internal void MarkPublished(DateTimeOffset publishedOnUtc)
    {
        if (Status == OutboxMessageStatus.Published)
            return;
        if (Status != OutboxMessageStatus.Processing)
            throw new InvalidOperationException($"Cannot publish an outbox message in {Status} status.");

        Status = OutboxMessageStatus.Published;
        PublishedOnUtc = publishedOnUtc;
        NextAttemptOnUtc = null;
        LastError = null;
    }

    internal void MarkFailed(string error, DateTimeOffset? nextAttemptOnUtc)
    {
        if (Status != OutboxMessageStatus.Processing)
            throw new InvalidOperationException($"Cannot fail an outbox message in {Status} status.");

        ArgumentException.ThrowIfNullOrWhiteSpace(error);
        var normalized = error.Trim();
        Status = OutboxMessageStatus.Failed;
        LastError = normalized.Length <= 4000 ? normalized : normalized[..4000];
        NextAttemptOnUtc = nextAttemptOnUtc;
    }

    internal void MarkDead(string error)
    {
        if (Status != OutboxMessageStatus.Processing)
            throw new InvalidOperationException($"Cannot dead-letter an outbox message in {Status} status.");

        ArgumentException.ThrowIfNullOrWhiteSpace(error);
        var normalized = error.Trim();
        Status = OutboxMessageStatus.Dead;
        LastError = normalized.Length <= 4000 ? normalized : normalized[..4000];
        NextAttemptOnUtc = null;
    }
}
