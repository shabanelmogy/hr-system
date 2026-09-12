namespace ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;

using PlatformTenantModuleEntitlementRequest =
    ErpSystem.Modules.Platform.Contracts.Entitlements.TenantModuleEntitlementRequest;

public sealed record TenantManagementRequest(
    string Identifier,
    string Name,
    bool IsActive,
    string SubscriptionStatus,
    DateTime SubscriptionStartedOn,
    DateTime? SubscriptionEndsOn,
    string? PlanName,
    int MaxAdmins,
    int MaxUsers,
    string? BillingEmail,
    string? ContactName,
    string? ContactPhone,
    string? Notes,
    string? RowVersion = null,
    IReadOnlyList<PlatformTenantModuleEntitlementRequest>? Entitlements = null);
