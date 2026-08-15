using HrManagementSystem.Domain.Common.Abstractions;
using HrManagementSystem.Domain.Tenancy.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

public sealed class UserTenantAccess : ITenantScoped
{
    public string TenantId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = default!;
    public Tenant Tenant { get; set; } = default!;
}
