namespace ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;

public sealed record ModuleSubmoduleCatalogResponse(
    string Code,
    string Name,
    IReadOnlyList<string> RequiredPermissions,
    string? EntryPath = null);

public sealed record ModuleCatalogResponse(
    string Code,
    string Name,
    IReadOnlyList<ModuleSubmoduleCatalogResponse> Submodules,
    bool IsDefault);

public sealed record TenantModuleEntitlementRequest(
    string ModuleCode,
    IReadOnlyList<string>? SubmoduleCodes = null);

public sealed record TenantModuleEntitlementResponse(
    string ModuleCode,
    IReadOnlyList<string> SubmoduleCodes);
