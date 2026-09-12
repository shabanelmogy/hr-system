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
        if (update.PartyId == Guid.Empty || string.IsNullOrWhiteSpace(update.TenantId) || update.CompanyId <= 0)
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
                update.SourceOccurredOnUtc));
            return;
        }

        // Out-of-order older events must not regress the Accounting projection.
        if (reference.SourceOccurredOnUtc > update.SourceOccurredOnUtc)
            return;

        reference.Apply(
            update.DisplayName.Trim(),
            Normalize(update.Email),
            Normalize(update.Phone),
            update.SourceEventId,
            update.SourceOccurredOnUtc);
    }

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
