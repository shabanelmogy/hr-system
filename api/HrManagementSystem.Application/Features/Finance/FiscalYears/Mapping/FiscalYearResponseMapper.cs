using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;
using HrManagementSystem.Domain.Finance.FiscalYears.Entities;

namespace HrManagementSystem.Application.Features.Finance.FiscalYears.Mapping;

public static class FiscalYearResponseMapper
{
    public static FiscalYearDetailResponse ToDetail(FiscalYear fiscalYear) =>
        new(
            fiscalYear.Id,
            fiscalYear.Code,
            fiscalYear.NameAr,
            fiscalYear.NameEn,
            fiscalYear.StartDate,
            fiscalYear.EndDate,
            fiscalYear.PeriodFrequency,
            fiscalYear.Status,
            fiscalYear.Periods
                .OrderBy(period => period.Sequence)
                .Select(period => new FiscalPeriodResponse(
                    period.Id,
                    period.Sequence,
                    period.Code,
                    period.NameAr,
                    period.NameEn,
                    period.StartDate,
                    period.EndDate,
                    period.Status))
                .ToArray(),
            fiscalYear.CreatedOn,
            fiscalYear.UpdatedOn,
            fiscalYear.IsDeleted,
            Convert.ToBase64String(fiscalYear.RowVersion));
}
