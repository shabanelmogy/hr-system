namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies;

internal static class CurrencyLocks
{
    public static string CompanyCatalog(string tenantId, int companyId) =>
        $"Accounting:Currencies:{tenantId}:{companyId}";
}
