using ErpSystem.Modules.Accounting.Contracts;

namespace ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Persistence;

public sealed class AccountingCurrencyCatalog(AccountingDbContext context) : IAccountingCurrencyCatalog
{
    public async Task<IReadOnlyList<AccountingCurrencyCatalogItem>> GetActiveAsync(
        string tenantId,
        int companyId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(tenantId) || companyId <= 0)
            return [];

        return await context.Currencies
            .AsNoTracking()
            .Where(item =>
                item.TenantId == tenantId &&
                item.CompanyId == companyId &&
                !item.IsDeleted)
            .OrderBy(item => item.CurrencyCode)
            .ThenBy(item => item.Id)
            .Select(item => new AccountingCurrencyCatalogItem(
                item.Id,
                item.CurrencyCode,
                item.NameEn,
                item.NameAr,
                item.Symbol))
            .ToListAsync(cancellationToken);
    }

    public async Task<AccountingCurrencyCatalogItem?> FindActiveByCodeAsync(
        string tenantId,
        int companyId,
        string currencyCode,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(tenantId) || companyId <= 0 || string.IsNullOrWhiteSpace(currencyCode))
            return null;

        var normalizedCode = currencyCode.Trim().ToUpperInvariant();
        return await context.Currencies
            .AsNoTracking()
            .Where(item =>
                item.TenantId == tenantId &&
                item.CompanyId == companyId &&
                item.CurrencyCode == normalizedCode &&
                !item.IsDeleted)
            .Select(item => new AccountingCurrencyCatalogItem(
                item.Id,
                item.CurrencyCode,
                item.NameEn,
                item.NameAr,
                item.Symbol))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
