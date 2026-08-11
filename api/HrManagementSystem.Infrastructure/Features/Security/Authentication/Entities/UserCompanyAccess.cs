using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.Common.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

public sealed class UserCompanyAccess : ICompanyScoped
{
    public string TenantId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public bool IsDefault { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = default!;
    public Company Company { get; set; } = default!;
}
