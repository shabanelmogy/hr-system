namespace HrManagementSystem.Infrastructure.Security.Authentication;

public static class JwtClaimNames
{
    public const string SessionId = "sid";
    public const string SecurityStamp = "security_stamp";
    public const string TenantId = "tenant_id";
    public const string TenantName = "tenant_name";
    public const string TenantPlanName = "tenant_plan";
    public const string CompanyId = "company_id";
    public const string Scope = "scope";
    public const string RealtimeScope = "signalr";
    public const string CompanySelectionScope = "company_selection";
}
