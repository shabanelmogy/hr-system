using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

public sealed class ExchangeRateType : CompanyAuditableEntity
{
    private ExchangeRateType()
    {
    }

    public ExchangeRateType(string code, string nameAr, string nameEn)
    {
        Update(code, nameAr, nameEn);
    }

    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;

    public void Update(string code, string nameAr, string nameEn)
    {
        Code = Required(code, nameof(code)).ToUpperInvariant();
        NameAr = Required(nameAr, nameof(nameAr));
        NameEn = Required(nameEn, nameof(nameEn));
    }
}

public sealed class ExchangeRate : CompanyAuditableEntity
{
    private ExchangeRate()
    {
    }

    public ExchangeRate(
        int exchangeRateTypeId,
        int fromCurrencyId,
        int toCurrencyId,
        DateOnly effectiveFrom,
        DateOnly? effectiveTo,
        int version,
        decimal rate)
    {
        ExchangeRateTypeId = Positive(exchangeRateTypeId, nameof(exchangeRateTypeId));
        FromCurrencyId = Positive(fromCurrencyId, nameof(fromCurrencyId));
        ToCurrencyId = Positive(toCurrencyId, nameof(toCurrencyId));
        Update(effectiveFrom, effectiveTo, version, rate);
        EnsureCurrencyPair();
    }

    public int Id { get; private set; }
    public int ExchangeRateTypeId { get; private set; }
    public ExchangeRateType ExchangeRateType { get; private set; } = null!;
    public int FromCurrencyId { get; private set; }
    public Currency FromCurrency { get; private set; } = null!;
    public int ToCurrencyId { get; private set; }
    public Currency ToCurrency { get; private set; } = null!;
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public int Version { get; private set; }
    public decimal Rate { get; private set; }

    public void Update(DateOnly effectiveFrom, DateOnly? effectiveTo, int version, decimal rate)
    {
        if (effectiveTo.HasValue && effectiveTo.Value < effectiveFrom)
        {
            throw new DomainRuleException(
                "Finance.ExchangeRate.InvalidEffectiveRange",
                "Exchange-rate effective end date cannot precede its start date.");
        }

        if (version <= 0)
            throw new ArgumentOutOfRangeException(nameof(version), "Exchange-rate version must be positive.");
        if (rate <= 0)
            throw new DomainRuleException(
                "Finance.ExchangeRate.InvalidRate",
                "Exchange rate must be greater than zero.");

        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        Version = version;
        Rate = rate;
    }

    public void ChangeDefinition(int exchangeRateTypeId, int fromCurrencyId, int toCurrencyId)
    {
        ExchangeRateTypeId = Positive(exchangeRateTypeId, nameof(exchangeRateTypeId));
        FromCurrencyId = Positive(fromCurrencyId, nameof(fromCurrencyId));
        ToCurrencyId = Positive(toCurrencyId, nameof(toCurrencyId));
        EnsureCurrencyPair();
    }

    private void EnsureCurrencyPair()
    {
        if (FromCurrencyId == ToCurrencyId)
        {
            throw new DomainRuleException(
                "Finance.ExchangeRate.SameCurrencyPair",
                "Exchange-rate source and target currencies must differ.");
        }
    }
}
