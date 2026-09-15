using ErpSystem.Modules.Accounting.Contracts;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.FiscalYears.Persistence;

internal sealed class FiscalYearPlanningSource(AccountingDbContext context) : IFiscalYearPlanningSource
{
    public async Task<FiscalYearPlanningSnapshot?> GetAsync(
        string tenantId,
        int companyId,
        int fiscalYearId,
        CancellationToken cancellationToken)
    {
        var year = await context.FiscalYears
            .AsNoTracking()
            .Where(item => item.TenantId == tenantId &&
                           item.CompanyId == companyId &&
                           item.Id == fiscalYearId &&
                           !item.IsDeleted)
            .Select(item => new
            {
                item.Id,
                item.Code,
                item.StartDate,
                item.EndDate,
                item.Status,
                PeriodIds = item.Periods
                    .Where(period => !period.IsDeleted)
                    .Select(period => period.Id)
            })
            .FirstOrDefaultAsync(cancellationToken);

        return year is null
            ? null
            : new FiscalYearPlanningSnapshot(
                year.Id,
                year.Code,
                year.StartDate,
                year.EndDate,
                year.PeriodIds.ToHashSet(),
                year.Status.ToString());
    }
}
