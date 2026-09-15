using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Queries.GetFiscalYears;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Abstractions;

public interface IFiscalYearReadStore
{
    Task<PageResponse<FiscalYearListItemResponse>> GetPageAsync(
        GetFiscalYearsQuery query,
        CancellationToken cancellationToken);

    Task<FiscalYearDetailResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<FiscalYearLookupResponse>> GetLookupAsync(
        CancellationToken cancellationToken);
}
