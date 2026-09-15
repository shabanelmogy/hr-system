using ErpSystem.BuildingBlocks.Domain.Abstractions;
using ErpSystem.BuildingBlocks.Domain.Guards;

namespace ErpSystem.Modules.Platform.Domain.Tenancy.Entities;

public sealed class TenantModuleEntitlement : ITenantScoped
{
    private TenantModuleEntitlement() { }

    public TenantModuleEntitlement(string tenantId, string moduleCode)
    {
        TenantId = DomainGuard.Required(tenantId, nameof(tenantId));
        ModuleCode = DomainGuard.Required(moduleCode, nameof(moduleCode)).ToLowerInvariant();
    }

    public string TenantId { get; set; } = string.Empty;
    public string ModuleCode { get; private set; } = string.Empty;
}
