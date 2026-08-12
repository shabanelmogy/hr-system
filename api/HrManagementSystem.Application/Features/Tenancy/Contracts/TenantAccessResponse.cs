namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

public sealed record TenantAccessResponse(
    string TenantName,
    string PlanName,
    string SubscriptionStatus,
    DateTime? SubscriptionEndsOn,
    bool IsReadOnly);
