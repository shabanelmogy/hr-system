namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

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
    string? RowVersion = null);
