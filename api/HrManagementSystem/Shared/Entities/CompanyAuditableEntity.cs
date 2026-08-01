using HrManagementSystem.Shared.Abstractions;

namespace HrManagementSystem.Shared.Entities;

public abstract class CompanyAuditableEntity : TenantAuditableEntity, ICompanyScoped
{
    public int CompanyId { get; set; }
}
