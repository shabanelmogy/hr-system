using ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;
using HrEntitlementRequest = ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts.TenantModuleEntitlementRequest;
using HrEntitlementResponse = ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts.TenantModuleEntitlementResponse;
using PlatformEntitlementRequest = ErpSystem.Modules.Platform.Contracts.Entitlements.TenantModuleEntitlementRequest;
using PlatformEntitlementResponse = ErpSystem.Modules.Platform.Contracts.Entitlements.TenantModuleEntitlementResponse;

namespace ErpSystem.Modules.HR.Application.Features.Tenancy.PlatformCompatibility;

/// <summary>
/// DTO conversion retained only for the legacy tenant-management transaction
/// adapter. Module catalog policy and entitlement persistence are Platform-owned.
/// </summary>
public static class PlatformTenantModuleEntitlementMappings
{
    public static IReadOnlyList<HrEntitlementRequest> ToHrEntitlements(
        this IEnumerable<PlatformEntitlementRequest> entitlements) =>
        entitlements.Select(item => new HrEntitlementRequest(
            item.ModuleCode,
            item.SubmoduleCodes)).ToArray();

    public static IReadOnlyList<PlatformEntitlementResponse> ToPlatformEntitlements(
        this IEnumerable<HrEntitlementResponse> entitlements) =>
        entitlements.Select(item => new PlatformEntitlementResponse(
            item.ModuleCode,
            item.SubmoduleCodes)).ToArray();
}
