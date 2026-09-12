using ErpSystem.Modules.Contacts.Application.Parties;
using ErpSystem.Modules.Contacts.Domain;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Contacts.Infrastructure.Parties;

public sealed class PartyStore(ContactsDbContext dbContext) : IPartyStore
{
    public Task<Party?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Parties.SingleOrDefaultAsync(party => party.Id == id, cancellationToken);

    public void Add(Party party) => dbContext.Parties.Add(party);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
