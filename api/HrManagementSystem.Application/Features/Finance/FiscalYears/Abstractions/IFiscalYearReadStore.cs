using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Queries.GetFiscalYears;

namespace HrManagementSystem.Application.Features.Finance.FiscalYears.Abstractions;

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
