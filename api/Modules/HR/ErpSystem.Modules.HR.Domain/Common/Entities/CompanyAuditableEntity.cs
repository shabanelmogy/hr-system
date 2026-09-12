using ErpSystem.Modules.HR.Domain.Common.Abstractions;

namespace ErpSystem.Modules.HR.Domain.Common.Entities;

public abstract class CompanyAuditableEntity : TenantAuditableEntity, ICompanyScoped
{
    public int CompanyId { get; set; }
}
