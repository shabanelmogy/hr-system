namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

public static class GeneralHubGroups
{
    public static string ForCompany(string tenantId, int companyId) =>
        $"tenant:{tenantId}:company:{companyId}";

    public static string ForUserCompany(string tenantId, int companyId, string userId) =>
        $"{ForCompany(tenantId, companyId)}:user:{userId}";
}
