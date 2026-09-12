using ErpSystem.BuildingBlocks.Context;
using MediatR;

namespace ErpSystem.Modules.Contacts.Application.Parties;

public sealed record GetPartyQuery(Guid Id) : IRequest<PartyResponse?>;

public sealed class GetPartyQueryHandler(
    IPartyStore store,
    ICurrentExecutionContext executionContext) : IRequestHandler<GetPartyQuery, PartyResponse?>
{
    public async Task<PartyResponse?> Handle(GetPartyQuery request, CancellationToken cancellationToken)
    {
        PartyScope.Require(executionContext);
        var party = await store.GetByIdAsync(request.Id, cancellationToken);
        return party is null ? null : PartyResponseMapper.Map(party);
    }
}
