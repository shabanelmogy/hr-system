namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

public static class GeneralHubGroups
{
    public static string ForTenant(string tenantId) =>
        $"tenant:{tenantId.Trim()}";

    public static string ForRole(string role) =>
        $"role:{role.Trim().ToLowerInvariant()}";

    public static string ForPermission(string permission) =>
        $"permission:{permission}";

    public static string ForTenantPermission(string tenantId, string permission) =>
        $"{ForTenant(tenantId)}:{ForPermission(permission)}";

    public static string ForTenantRole(string tenantId, string roleId) =>
        $"{ForTenant(tenantId)}:role:{roleId.Trim()}";

    public static string ForCompany(string tenantId, int companyId) =>
        $"{ForTenant(tenantId)}:company:{companyId}";

    public static string ForCompanyPermission(string tenantId, int companyId, string permission) =>
        $"{ForCompany(tenantId, companyId)}:{ForPermission(permission)}";

    public static string ForUserCompany(string tenantId, int companyId, string userId) =>
        $"{ForCompany(tenantId, companyId)}:user:{userId}";
}
