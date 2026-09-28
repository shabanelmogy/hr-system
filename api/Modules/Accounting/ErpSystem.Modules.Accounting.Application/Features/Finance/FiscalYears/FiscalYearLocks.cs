namespace ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears;

public static class FiscalYearLocks
{
    public static string CompanyCalendar(string tenantId, int companyId) =>
        $"Finance:FiscalYears:{tenantId}:{companyId}";

    public static string UserContext(string tenantId, int companyId, string userId) =>
        $"Finance:FiscalYearContext:{tenantId}:{companyId}:{userId}";
}
