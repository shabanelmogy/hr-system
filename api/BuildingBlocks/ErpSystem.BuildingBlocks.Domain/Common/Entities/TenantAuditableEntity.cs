using ErpSystem.BuildingBlocks.Domain.Abstractions;

namespace ErpSystem.BuildingBlocks.Domain.Entities;

public abstract class TenantAuditableEntity : AuditableEntity, ITenantScoped
{
    public string TenantId { get; set; } = string.Empty;
}
