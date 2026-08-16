namespace HrManagementSystem.Application.Common.Realtime;

public enum RealtimeAudienceKind
{
    Permission,
    Company,
    CompanyPermission,
    UserCompany,
    Role,
    Tenant,
    TenantPermission,
    TenantRole
}

public sealed record RealtimeAudience(
    RealtimeAudienceKind Kind,
    string? Permission = null,
    string? TenantId = null,
    int? CompanyId = null,
    string? UserId = null,
    string? Role = null,
    string? RoleId = null)
{
    public static RealtimeAudience ForPermission(string permission) =>
        new(RealtimeAudienceKind.Permission, Permission: Required(permission, nameof(permission)));

    public static RealtimeAudience ForTenantPermission(string tenantId, string permission) =>
        new(
            RealtimeAudienceKind.TenantPermission,
            Permission: Required(permission, nameof(permission)),
            TenantId: Required(tenantId, nameof(tenantId)));

    public static RealtimeAudience ForCompanyPermission(
        string tenantId,
        int companyId,
        string permission) =>
        new(
            RealtimeAudienceKind.CompanyPermission,
            Required(permission, nameof(permission)),
            Required(tenantId, nameof(tenantId)),
            Positive(companyId));

    public static RealtimeAudience ForCompany(string tenantId, int companyId) =>
        new(
            RealtimeAudienceKind.Company,
            TenantId: Required(tenantId, nameof(tenantId)),
            CompanyId: Positive(companyId));

    public static RealtimeAudience ForUserCompany(
        string tenantId,
        int companyId,
        string userId) =>
        new(
            RealtimeAudienceKind.UserCompany,
            TenantId: Required(tenantId, nameof(tenantId)),
            CompanyId: Positive(companyId),
            UserId: Required(userId, nameof(userId)));

    public static RealtimeAudience ForRole(string role) =>
        new(RealtimeAudienceKind.Role, Role: Required(role, nameof(role)));

    public static RealtimeAudience ForTenantRole(string tenantId, string roleId) =>
        new(
            RealtimeAudienceKind.TenantRole,
            TenantId: Required(tenantId, nameof(tenantId)),
            RoleId: Required(roleId, nameof(roleId)));

    public static RealtimeAudience ForTenant(string tenantId) =>
        new(RealtimeAudienceKind.Tenant, TenantId: Required(tenantId, nameof(tenantId)));

    private static string Required(string value, string parameterName) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("A non-empty value is required.", parameterName)
            : value.Trim();

    private static int Positive(int value) =>
        value > 0
            ? value
            : throw new ArgumentOutOfRangeException(nameof(value), "Company ID must be positive.");
}
