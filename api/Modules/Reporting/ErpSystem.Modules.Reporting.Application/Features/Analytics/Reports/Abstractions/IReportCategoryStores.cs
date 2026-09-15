using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Contracts;
using ErpSystem.Modules.Reporting.Domain.Analytics.Reports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Abstractions;

public interface IReportCategoryReadStore
{
    Task<IReadOnlyList<ReportCategoryResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<ReportCategoryResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
}

public interface IReportCategoryRepository
{
    void Add(ReportCategory reportCategory);
    Task<ReportCategory?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

public interface IReportCategoryEffects
{
    Task RecordUpdateAsync(
        int id,
        ReportCategory existing,
        ReportCategory updated,
        CancellationToken cancellationToken);

    Task InvalidateCacheAsync(CancellationToken cancellationToken);
    void DispatchChange(string action, ReportCategory reportCategory);
}
