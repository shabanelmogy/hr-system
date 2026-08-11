namespace HrManagementSystem.Application.Common.Realtime;

public sealed record RealtimeEntityChanged(
    Guid EventId,
    DateTime OccurredAtUtc,
    string Resource,
    string Action,
    string? EntityId);
