namespace HrManagementSystem.Application.Common.Realtime;

public sealed record RealtimeChangeRequest(
    RealtimeAudience Audience,
    string Resource,
    string Action,
    string? EntityId,
    Guid EventId)
{
    public static RealtimeChangeRequest For<TEntity>(
        RealtimeAudience audience,
        string action,
        string? entityId,
        Guid? eventId = null) =>
        new(
            audience ?? throw new ArgumentNullException(nameof(audience)),
            RealtimeResource.For<TEntity>(),
            Required(action, nameof(action)),
            entityId,
            eventId ?? Guid.NewGuid());

    private static string Required(string value, string parameterName) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("A non-empty value is required.", parameterName)
            : value.Trim();
}
