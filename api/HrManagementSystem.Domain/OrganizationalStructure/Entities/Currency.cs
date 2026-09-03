using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Currency : CompanyAuditableEntity
{
    private Currency()
    {
    }

    public Currency(
        string currencyCode,
        string nameEn,
        string nameAr,
        string symbol,
        decimal exchangeRateToDefault = 1.0m,
        bool isDefault = false)
    {
        UpdateIdentity(currencyCode, nameEn, nameAr, symbol);
        UpdateExchangeRate(exchangeRateToDefault);
        SetDefault(isDefault);
    }

    public int Id { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string Symbol { get; private set; } = string.Empty;
    public decimal ExchangeRateToDefault { get; private set; } = 1.0m;
    public bool IsDefault { get; private set; }

    public void UpdateIdentity(string currencyCode, string nameEn, string nameAr, string symbol)
    {
        var code = Required(currencyCode, nameof(currencyCode)).ToUpperInvariant();
        if (code.Length != 3)
        {
            throw new DomainRuleException(
                "Organization.Currency.InvalidCode",
                "Currency code must be a 3-letter ISO-4217 code.");
        }

        CurrencyCode = code;
        NameEn = Required(nameEn, nameof(nameEn));
        NameAr = Required(nameAr, nameof(nameAr));
        Symbol = Required(symbol, nameof(symbol));
    }

    public void UpdateExchangeRate(decimal exchangeRateToDefault)
    {
        if (exchangeRateToDefault <= 0)
        {
            throw new DomainRuleException(
                "Organization.Currency.InvalidExchangeRate",
                "Exchange rate must be greater than zero.");
        }

        ExchangeRateToDefault = exchangeRateToDefault;
    }

    public void SetDefault(bool isDefault)
    {
        IsDefault = isDefault;
        if (isDefault)
        {
            ExchangeRateToDefault = 1.0m;
        }
    }
}
