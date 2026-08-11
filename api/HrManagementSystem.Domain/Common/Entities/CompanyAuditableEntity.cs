using HrManagementSystem.Domain.Common.Abstractions;

namespace HrManagementSystem.Domain.Common.Entities;

public abstract class CompanyAuditableEntity : TenantAuditableEntity, ICompanyScoped
{
    public int CompanyId { get; set; }
}
