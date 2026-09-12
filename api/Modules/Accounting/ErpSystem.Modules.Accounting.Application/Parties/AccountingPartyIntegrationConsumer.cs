using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Accounting.Application.Messaging;
using ErpSystem.Modules.Contacts.Contracts;

namespace ErpSystem.Modules.Accounting.Application.Parties;

public sealed record AccountingPartyReferenceUpdate(
    Guid PartyId,
    string TenantId,
    int CompanyId,
    string DisplayName,
    string? Email,
    string? Phone,
    Guid SourceEventId,
    DateTimeOffset SourceOccurredOnUtc);

public interface IAccountingPartyReferenceStore
{
    Task UpsertAsync(
        AccountingPartyReferenceUpdate update,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Transport-neutral Accounting consumer for Contacts facts. Idempotency and
/// the local projection write participate in the Accounting inbox transaction.
/// </summary>
public sealed class AccountingPartyIntegrationConsumer(
    IAccountingInbox inbox,
    IAccountingPartyReferenceStore store)
    : IIntegrationEventHandler<PartyCreatedIntegrationEvent>,
      IIntegrationEventHandler<PartyUpdatedIntegrationEvent>
{
    public Task<IntegrationEventConsumeResult> ConsumeAsync(
        PartyCreatedIntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default) =>
        ConsumeCoreAsync(integrationEvent, cancellationToken);

    public Task<IntegrationEventConsumeResult> ConsumeAsync(
        PartyUpdatedIntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default) =>
        ConsumeCoreAsync(integrationEvent, cancellationToken);

    async Task IIntegrationEventHandler<PartyCreatedIntegrationEvent>.HandleAsync(
        PartyCreatedIntegrationEvent integrationEvent,
        CancellationToken cancellationToken) =>
        await ConsumeAsync(integrationEvent, cancellationToken).ConfigureAwait(false);

    async Task IIntegrationEventHandler<PartyUpdatedIntegrationEvent>.HandleAsync(
        PartyUpdatedIntegrationEvent integrationEvent,
        CancellationToken cancellationToken) =>
        await ConsumeAsync(integrationEvent, cancellationToken).ConfigureAwait(false);

    private Task<IntegrationEventConsumeResult> ConsumeCoreAsync(
        IntegrationEvent integrationEvent,
        CancellationToken cancellationToken)
    {
        var update = integrationEvent switch
        {
            PartyCreatedIntegrationEvent created => new AccountingPartyReferenceUpdate(
                created.PartyId,
                created.TenantId,
                created.CompanyId,
                created.DisplayName,
                created.Email,
                created.Phone,
                created.EventId,
                created.OccurredOnUtc),
            PartyUpdatedIntegrationEvent updated => new AccountingPartyReferenceUpdate(
                updated.PartyId,
                updated.TenantId,
                updated.CompanyId,
                updated.DisplayName,
                updated.Email,
                updated.Phone,
                updated.EventId,
                updated.OccurredOnUtc),
            _ => throw new ArgumentOutOfRangeException(nameof(integrationEvent))
        };

        return inbox.ExecuteOnceAsync(
            "Accounting.Contacts.PartyReference.v1",
            integrationEvent,
            token => store.UpsertAsync(update, token),
            cancellationToken);
    }
}
