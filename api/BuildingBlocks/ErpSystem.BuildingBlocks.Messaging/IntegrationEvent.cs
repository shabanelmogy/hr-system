namespace ErpSystem.BuildingBlocks.Messaging;

/// <summary>
/// Transport-neutral contract for facts published across module boundaries.
/// The event identifier is stable across retries; correlation and causation
/// metadata are preserved independently from any broker or serialization format.
/// </summary>
public abstract record IntegrationEvent
{
    protected IntegrationEvent(
        Guid eventId,
        DateTimeOffset occurredOnUtc,
        string? correlationId = null,
        string? causationId = null)
    {
        if (eventId == Guid.Empty)
            throw new ArgumentException("Integration event id must not be empty.", nameof(eventId));

        EventId = eventId;
        OccurredOnUtc = occurredOnUtc.ToUniversalTime();
        CorrelationId = NormalizeOptional(correlationId);
        CausationId = NormalizeOptional(causationId);
    }

    public Guid EventId { get; }

    public abstract string EventName { get; }

    public virtual int EventVersion => 1;

    public DateTimeOffset OccurredOnUtc { get; }

    public string? CorrelationId { get; }

    public string? CausationId { get; }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
