using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

public sealed class AccountingCompanySettings : CompanyAuditableEntity
{
    private AccountingCompanySettings()
    {
    }

    public AccountingCompanySettings(int functionalCurrencyId, int primaryBookId)
    {
        Change(functionalCurrencyId, primaryBookId);
    }

    public int Id { get; private set; }
    public int FunctionalCurrencyId { get; private set; }
    public Currency FunctionalCurrency { get; private set; } = null!;
    public int PrimaryBookId { get; private set; }
    public Book PrimaryBook { get; private set; } = null!;

    public void Change(int functionalCurrencyId, int primaryBookId)
    {
        FunctionalCurrencyId = Positive(functionalCurrencyId, nameof(functionalCurrencyId));
        PrimaryBookId = Positive(primaryBookId, nameof(primaryBookId));
    }
}
