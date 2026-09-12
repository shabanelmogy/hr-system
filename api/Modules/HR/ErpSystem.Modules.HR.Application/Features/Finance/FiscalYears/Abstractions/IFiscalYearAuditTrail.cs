using ErpSystem.Modules.HR.Domain.Finance.FiscalYears.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Finance.FiscalYears.Abstractions;

public interface IFiscalYearAuditTrail
{
    void RecordUpdate(FiscalYear existingFiscalYear, FiscalYear updatedFiscalYear);
    void RecordLifecycle(FiscalYear fiscalYear, string oldStatus, string newStatus);
}
