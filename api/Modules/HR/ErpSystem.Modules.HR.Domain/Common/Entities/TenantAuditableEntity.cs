using ErpSystem.Modules.HR.Domain.Common.Abstractions;

namespace ErpSystem.Modules.HR.Domain.Common.Entities;

public abstract class TenantAuditableEntity : AuditableEntity, ITenantScoped
{
    public string TenantId { get; set; } = string.Empty;
}
