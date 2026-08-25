namespace HrManagementSystem.Application.Features.Security.Authentication.Contracts;

public sealed record SessionResponse(
    string UserId,
    string TenantId,
    string TenantName,
    string TenantPlanName,
    int CompanyId,
    string CompanyCode,
    string CompanyNameAr,
    string CompanyNameEn,
    IReadOnlyCollection<CompanyOptionResponse> Companies,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Permissions,
    string TenantSubscriptionStatus,
    DateTime? TenantSubscriptionEndsOn,
    bool TenantReadOnly,
    long ExpiresAt);
