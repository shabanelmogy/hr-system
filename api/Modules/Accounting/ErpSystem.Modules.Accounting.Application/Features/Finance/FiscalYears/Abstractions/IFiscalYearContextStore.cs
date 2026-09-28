using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Contracts;
using ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Entities;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Abstractions;

public interface IFiscalYearContextStore
{
    Task<FiscalYearContextResponse> GetContextAsync(string userId, CancellationToken cancellationToken);
    Task<FiscalYear?> GetSelectableForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<FiscalYearUserSelection?> GetSelectionForUpdateAsync(string userId, CancellationToken cancellationToken);
    void AddSelection(FiscalYearUserSelection selection);
}
