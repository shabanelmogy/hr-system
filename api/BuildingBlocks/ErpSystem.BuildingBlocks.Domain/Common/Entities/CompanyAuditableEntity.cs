using ErpSystem.BuildingBlocks.Domain.Abstractions;

namespace ErpSystem.BuildingBlocks.Domain.Entities;

public abstract class CompanyAuditableEntity : TenantAuditableEntity, ICompanyScoped
{
    public int CompanyId { get; set; }
}
