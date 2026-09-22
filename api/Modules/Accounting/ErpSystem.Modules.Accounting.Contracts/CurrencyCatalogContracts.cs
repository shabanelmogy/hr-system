namespace ErpSystem.Modules.Accounting.Contracts;

/// <summary>
/// Stable read-only company currency projection published by Accounting for
/// selectors and validation in other bounded contexts.
/// </summary>
public sealed record AccountingCurrencyCatalogItem(
    int Id,
    string CurrencyCode,
    string NameEn,
    string NameAr,
    string Symbol);

public interface IAccountingCurrencyCatalog
{
    Task<IReadOnlyList<AccountingCurrencyCatalogItem>> GetActiveAsync(
        string tenantId,
        int companyId,
        CancellationToken cancellationToken);

    Task<AccountingCurrencyCatalogItem?> FindActiveByCodeAsync(
        string tenantId,
        int companyId,
        string currencyCode,
        CancellationToken cancellationToken);
}
