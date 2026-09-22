using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Queries;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Abstractions;

public interface ICurrencyReadStore
{
    Task<PageResponse<CurrencyResponse>> GetPageAsync(GetCurrenciesQuery criteria, CancellationToken cancellationToken);
    Task<CurrencyResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<CurrencyLookupResponse>> GetLookupAsync(CancellationToken cancellationToken);
}

public interface ICurrencyWriteStore
{
    void Add(Currency currency);
    Task<Currency?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(string currencyCode, int? excludedId, CancellationToken cancellationToken);
    Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken);
    void ApplyOriginalRowVersion(Currency currency, byte[] rowVersion);
}
