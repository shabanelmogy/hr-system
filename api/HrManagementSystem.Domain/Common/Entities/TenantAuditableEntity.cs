using HrManagementSystem.Domain.Common.Abstractions;

namespace HrManagementSystem.Domain.Common.Entities;

public abstract class TenantAuditableEntity : AuditableEntity, ITenantScoped
{
    public string TenantId { get; set; } = string.Empty;
}
