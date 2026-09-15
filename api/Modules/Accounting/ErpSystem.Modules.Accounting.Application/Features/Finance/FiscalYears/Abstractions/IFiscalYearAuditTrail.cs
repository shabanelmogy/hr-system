using ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Entities;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Abstractions;

public interface IFiscalYearAuditTrail
{
    Task RecordUpdateAsync(FiscalYear existingFiscalYear, FiscalYear updatedFiscalYear, CancellationToken cancellationToken);
    Task RecordLifecycleAsync(FiscalYear fiscalYear, string oldStatus, string newStatus, CancellationToken cancellationToken);
}
