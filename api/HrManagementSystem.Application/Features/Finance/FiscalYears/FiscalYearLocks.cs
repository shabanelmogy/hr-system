namespace HrManagementSystem.Application.Features.Finance.FiscalYears;

public static class FiscalYearLocks
{
    public static string CompanyCalendar(string tenantId, int companyId) =>
        $"Finance:FiscalYears:{tenantId}:{companyId}";
}
