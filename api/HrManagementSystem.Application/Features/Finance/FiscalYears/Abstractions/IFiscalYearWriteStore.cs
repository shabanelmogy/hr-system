using HrManagementSystem.Domain.Finance.FiscalYears.Entities;

namespace HrManagementSystem.Application.Features.Finance.FiscalYears.Abstractions;

public interface IFiscalYearWriteStore
{
    void Add(FiscalYear fiscalYear);
    Task<FiscalYear?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> OverlapExistsAsync(
        DateOnly startDate,
        DateOnly endDate,
        int? excludedId,
        CancellationToken cancellationToken);
    void RemovePeriods(IReadOnlyCollection<FiscalPeriod> periods);
    void ApplyOriginalRowVersion(FiscalYear fiscalYear, byte[] rowVersion);
}
