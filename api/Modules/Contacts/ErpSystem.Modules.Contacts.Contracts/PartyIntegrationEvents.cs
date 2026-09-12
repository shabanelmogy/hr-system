using ErpSystem.BuildingBlocks.Messaging;

namespace ErpSystem.Modules.Contacts.Contracts;

public sealed record PartyCreatedIntegrationEvent(
    Guid PartyId,
    string TenantId,
    int CompanyId,
    string DisplayName,
    string? Email,
    string? Phone,
    Guid EventId,
    DateTimeOffset OccurredOnUtc,
    string? CorrelationId = null,
    string? CausationId = null)
    : IntegrationEvent(EventId, OccurredOnUtc, CorrelationId, CausationId)
{
    public const string EventNameValue = "contacts.party.created";
    public override string EventName => EventNameValue;
}

public sealed record PartyUpdatedIntegrationEvent(
    Guid PartyId,
    string TenantId,
    int CompanyId,
    string DisplayName,
    string? Email,
    string? Phone,
    Guid EventId,
    DateTimeOffset OccurredOnUtc,
    string? CorrelationId = null,
    string? CausationId = null)
    : IntegrationEvent(EventId, OccurredOnUtc, CorrelationId, CausationId)
{
    public const string EventNameValue = "contacts.party.updated";
    public override string EventName => EventNameValue;
}
