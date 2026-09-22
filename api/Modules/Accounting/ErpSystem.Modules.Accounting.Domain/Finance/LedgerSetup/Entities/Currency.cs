using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

public sealed class Currency : CompanyAuditableEntity
{
    private Currency()
    {
    }

    public Currency(string currencyCode, string nameEn, string nameAr, string symbol)
    {
        UpdateIdentity(currencyCode, nameEn, nameAr, symbol);
    }

    public int Id { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string Symbol { get; private set; } = string.Empty;

    public void UpdateIdentity(string currencyCode, string nameEn, string nameAr, string symbol)
    {
        CurrencyCode = NormalizeCurrencyCode(currencyCode, nameof(currencyCode));
        NameEn = Required(nameEn, nameof(nameEn));
        NameAr = Required(nameAr, nameof(nameAr));
        Symbol = Required(symbol, nameof(symbol));
    }
}
