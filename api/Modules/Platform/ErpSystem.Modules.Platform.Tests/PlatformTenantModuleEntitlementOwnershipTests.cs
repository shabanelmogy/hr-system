using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Entitlements;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformTenantModuleEntitlementOwnershipTests
{
    [Fact]
    public void PlatformApplicationOwnsTheEntitlementPortWithoutPassThroughFacade()
    {
        Assert.Equal("ErpSystem.Modules.Platform.Application", typeof(TenantModuleEntitlementRequest).Assembly.GetName().Name);
        Assert.Same(typeof(TenantModuleEntitlementRequest).Assembly, typeof(ITenantModuleEntitlementSource).Assembly);
        Assert.Same(typeof(TenantModuleEntitlementRequest).Assembly, typeof(TenantModuleEntitlementResponse).Assembly);

        Assert.DoesNotContain(
            typeof(ErpSystem.Modules.Platform.Application.AssemblyReference).Assembly.GetTypes(),
            type => string.Equals(type.Name, "ITenantModuleEntitlementService", StringComparison.Ordinal)
                || string.Equals(type.Name, "TenantModuleEntitlementService", StringComparison.Ordinal));

        Assert.DoesNotContain(
            typeof(ErpSystem.Modules.Platform.Contracts.AssemblyReference).Assembly.GetTypes(),
            type => string.Equals(
                type.Namespace,
                "ErpSystem.Modules.Platform.Contracts.Entitlements",
                StringComparison.Ordinal));
    }
}
