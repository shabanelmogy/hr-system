using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Contacts.Contracts;
using ErpSystem.Modules.Contacts.Domain;
using ErpSystem.Modules.Contacts.Application.Messaging;
using MediatR;

namespace ErpSystem.Modules.Contacts.Application.Parties;

public sealed record CreatePartyCommand(
    string DisplayName,
    string? Email,
    string? Phone,
    string? CorrelationId = null,
    string? CausationId = null) : IRequest<PartyResponse>;

public sealed record UpdatePartyCommand(
    Guid Id,
    string DisplayName,
    string? Email,
    string? Phone,
    string? CorrelationId = null,
    string? CausationId = null) : IRequest<PartyResponse?>;

public sealed class CreatePartyCommandHandler(
    IPartyStore store,
    ICurrentExecutionContext executionContext,
    IContactsOutbox outbox,
    TimeProvider timeProvider) : IRequestHandler<CreatePartyCommand, PartyResponse>
{
    public async Task<PartyResponse> Handle(CreatePartyCommand request, CancellationToken cancellationToken)
    {
        var (tenantId, companyId) = PartyScope.Require(executionContext);
        var nowUtc = timeProvider.GetUtcNow();
        var party = Party.Create(
            Guid.NewGuid(),
            tenantId,
            companyId,
            request.DisplayName,
            request.Email,
            request.Phone,
            nowUtc);

        store.Add(party);
        outbox.Enqueue(new PartyCreatedIntegrationEvent(
            party.Id,
            party.TenantId,
            party.CompanyId,
            party.DisplayName,
            party.Email,
            party.Phone,
            Guid.NewGuid(),
            nowUtc,
            request.CorrelationId,
            request.CausationId));

        await store.SaveChangesAsync(cancellationToken);
        return PartyResponseMapper.Map(party);
    }
}

public sealed class UpdatePartyCommandHandler(
    IPartyStore store,
    ICurrentExecutionContext executionContext,
    IContactsOutbox outbox,
    TimeProvider timeProvider) : IRequestHandler<UpdatePartyCommand, PartyResponse?>
{
    public async Task<PartyResponse?> Handle(UpdatePartyCommand request, CancellationToken cancellationToken)
    {
        PartyScope.Require(executionContext);
        var party = await store.GetByIdAsync(request.Id, cancellationToken);
        if (party is null)
            return null;

        var nowUtc = timeProvider.GetUtcNow();
        party.Update(request.DisplayName, request.Email, request.Phone, nowUtc);
        outbox.Enqueue(new PartyUpdatedIntegrationEvent(
            party.Id,
            party.TenantId,
            party.CompanyId,
            party.DisplayName,
            party.Email,
            party.Phone,
            Guid.NewGuid(),
            nowUtc,
            request.CorrelationId,
            request.CausationId));

        await store.SaveChangesAsync(cancellationToken);
        return PartyResponseMapper.Map(party);
    }
}

internal static class PartyScope
{
    internal static (string TenantId, int CompanyId) Require(ICurrentExecutionContext context)
    {
        var tenantId = context.TenantId;
        var companyId = context.CompanyId;
        if (string.IsNullOrWhiteSpace(tenantId) || companyId is null or <= 0)
            throw new InvalidOperationException("A tenant and company are required for Contacts operations.");

        return (tenantId, companyId.Value);
    }
}
