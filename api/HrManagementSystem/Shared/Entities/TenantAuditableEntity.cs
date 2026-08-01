using HrManagementSystem.Shared.Abstractions;

namespace HrManagementSystem.Shared.Entities;

public abstract class TenantAuditableEntity : AuditableEntity, ITenantScoped
{
    public string TenantId { get; set; } = string.Empty;
}
