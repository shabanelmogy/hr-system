namespace ErpSystem.Modules.Platform.Infrastructure.Persistence.LegacyHr;

internal sealed class LegacyTenantRow
{
    public string Id { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string SubscriptionStatus { get; set; } = string.Empty;
    public DateTime? SubscriptionEndsOn { get; set; }
    public string? PlanName { get; set; }
}

internal sealed class LegacyCompanyRow
{
    public int Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string CompanyCode { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

internal sealed class LegacyIdentityUserRow
{
    public string Id { get; set; } = string.Empty;
    public bool IsDisabled { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public string? SecurityStamp { get; set; }
}

internal sealed class LegacyUserTenantAccessRow
{
    public string UserId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

internal sealed class LegacyUserCompanyAccessRow
{
    public string UserId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public bool IsDefault { get; set; }
}

internal sealed class LegacyRefreshSessionRow
{
    public string ApplicationUserId { get; set; } = string.Empty;
    public int Id { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public DateTime ExpiresOn { get; set; }
    public DateTime? RevokedOn { get; set; }
}

internal sealed class LegacyRoleRow
{
    public string Id { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? NormalizedName { get; set; }
    public string? TenantId { get; set; }
    public bool IsSystem { get; set; }
    public bool IsDeleted { get; set; }
}

internal sealed class LegacyUserRoleRow
{
    public string UserId { get; set; } = string.Empty;
    public string RoleId { get; set; } = string.Empty;
}

internal sealed class LegacyRoleClaimRow
{
    public int Id { get; set; }
    public string RoleId { get; set; } = string.Empty;
    public string? ClaimType { get; set; }
    public string? ClaimValue { get; set; }
}

internal sealed class LegacyTenantModuleEntitlementRow
{
    public string TenantId { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
}

internal sealed class LegacyTenantSubmoduleEntitlementRow
{
    public string TenantId { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string SubmoduleCode { get; set; } = string.Empty;
}
