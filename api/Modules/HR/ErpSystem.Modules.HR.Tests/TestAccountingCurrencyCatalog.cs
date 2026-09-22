using ErpSystem.Modules.Accounting.Contracts;

namespace ErpSystem.Modules.HR.Tests;

internal sealed class TestAccountingCurrencyCatalog : IAccountingCurrencyCatalog
{
    private readonly Dictionary<string, AccountingCurrencyCatalogItem> _items;

    public TestAccountingCurrencyCatalog(params string[] activeCodes)
    {
        _items = activeCodes
            .Select((code, index) => new AccountingCurrencyCatalogItem(
                index + 1,
                code.Trim().ToUpperInvariant(),
                code.Trim().ToUpperInvariant(),
                code.Trim().ToUpperInvariant(),
                code.Trim().ToUpperInvariant()))
            .ToDictionary(item => item.CurrencyCode, StringComparer.OrdinalIgnoreCase);
    }

    public string? LastTenantId { get; private set; }
    public int? LastCompanyId { get; private set; }

    public Task<IReadOnlyList<AccountingCurrencyCatalogItem>> GetActiveAsync(
        string tenantId,
        int companyId,
        CancellationToken cancellationToken)
    {
        LastTenantId = tenantId;
        LastCompanyId = companyId;
        return Task.FromResult<IReadOnlyList<AccountingCurrencyCatalogItem>>(_items.Values.ToArray());
    }

    public Task<AccountingCurrencyCatalogItem?> FindActiveByCodeAsync(
        string tenantId,
        int companyId,
        string currencyCode,
        CancellationToken cancellationToken)
    {
        LastTenantId = tenantId;
        LastCompanyId = companyId;
        _items.TryGetValue(currencyCode.Trim(), out var item);
        return Task.FromResult(item);
    }
}
