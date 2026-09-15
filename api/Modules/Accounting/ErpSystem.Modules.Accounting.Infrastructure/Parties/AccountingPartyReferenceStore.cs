using ErpSystem.Modules.Accounting.Application.Parties;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Accounting.Infrastructure.Parties;

public sealed class AccountingPartyReferenceStore(AccountingDbContext dbContext)
    : IAccountingPartyReferenceStore
{
    public async Task UpsertAsync(
        AccountingPartyReferenceUpdate update,
        CancellationToken cancellationToken = default)
    {
        if (update.PartyId == Guid.Empty || string.IsNullOrWhiteSpace(update.TenantId) ||
            update.CompanyId <= 0 || update.SourceRevision < 0)
            throw new InvalidOperationException("A complete party integration scope is required.");

        var reference = await dbContext.PartyReferences.SingleOrDefaultAsync(
            candidate => candidate.PartyId == update.PartyId &&
                         candidate.TenantId == update.TenantId &&
                         candidate.CompanyId == update.CompanyId,
            cancellationToken);

        if (reference is null)
        {
            dbContext.PartyReferences.Add(new AccountingPartyReference(
                update.PartyId,
                update.TenantId.Trim(),
                update.CompanyId,
                update.DisplayName.Trim(),
                Normalize(update.Email),
                Normalize(update.Phone),
                update.SourceEventId,
                update.SourceOccurredOnUtc,
                update.SourceRevision));
            return;
        }

        // New Contacts events carry a per-party revision. It remains ordered even
        // when two writes share a timestamp or cross hosts with skewed clocks.
        if (update.SourceRevision > 0 && update.SourceRevision <= reference.SourceRevision)
            return;

        // Revision zero is reserved for already-persisted v1 outbox payloads,
        // which predate the monotonic source revision contract.
        if (update.SourceRevision == 0)
        {
            if (reference.SourceRevision > 0 ||
                reference.SourceOccurredOnUtc > update.SourceOccurredOnUtc ||
                (reference.SourceOccurredOnUtc == update.SourceOccurredOnUtc &&
                 reference.SourceEventId.CompareTo(update.SourceEventId) >= 0))
            {
                return;
            }
        }

        reference.Apply(
            update.DisplayName.Trim(),
            Normalize(update.Email),
            Normalize(update.Phone),
            update.SourceEventId,
            update.SourceOccurredOnUtc,
            update.SourceRevision);
    }

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
