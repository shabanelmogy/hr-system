namespace HrManagementSystem.Application.Features.WorkforcePlanning;

public static class WorkforcePlanLocks
{
    public static string Company(string tenantId, int companyId) =>
        $"WorkforcePlanning:Plans:{tenantId}:{companyId}";
}
