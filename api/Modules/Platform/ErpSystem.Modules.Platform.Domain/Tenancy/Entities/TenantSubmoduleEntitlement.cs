using ErpSystem.BuildingBlocks.Domain.Abstractions;
using ErpSystem.BuildingBlocks.Domain.Guards;

namespace ErpSystem.Modules.Platform.Domain.Tenancy.Entities;

public sealed class TenantSubmoduleEntitlement : ITenantScoped
{
    private TenantSubmoduleEntitlement() { }

    public TenantSubmoduleEntitlement(string tenantId, string moduleCode, string submoduleCode)
    {
        TenantId = DomainGuard.Required(tenantId, nameof(tenantId));
        ModuleCode = DomainGuard.Required(moduleCode, nameof(moduleCode)).ToLowerInvariant();
        SubmoduleCode = DomainGuard.Required(submoduleCode, nameof(submoduleCode)).ToLowerInvariant();
    }

    public string TenantId { get; set; } = string.Empty;
    public string ModuleCode { get; private set; } = string.Empty;
    public string SubmoduleCode { get; private set; } = string.Empty;
}
