using ErpSystem.Modules.Contacts.Domain;

namespace ErpSystem.Modules.Contacts.Application.Parties;

public sealed record PartyResponse(
    Guid Id,
    string DisplayName,
    string? Email,
    string? Phone,
    DateTimeOffset CreatedOnUtc,
    DateTimeOffset? UpdatedOnUtc);

public interface IPartyStore
{
    Task<Party?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    void Add(Party party);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

internal static class PartyResponseMapper
{
    internal static PartyResponse Map(Party party) =>
        new(
            party.Id,
            party.DisplayName,
            party.Email,
            party.Phone,
            party.CreatedOnUtc,
            party.UpdatedOnUtc);
}
