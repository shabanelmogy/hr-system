using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Tenancy.Administration;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class TenantUserFoundationTests
{
    [Fact]
    public void TenantHandlersAreApplicationOwnedWithoutEntitlementCompatibilityFacade()
    {
        Assert.Equal("ErpSystem.Modules.Platform.Application", typeof(GetTenantQuery).Assembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Application", typeof(GetTenantAdministratorQuery).Assembly.GetName().Name);
        Assert.DoesNotContain(
            typeof(ErpSystem.Modules.Platform.Application.AssemblyReference).Assembly.GetTypes(),
            type => string.Equals(type.Name, "ITenantModuleEntitlementService", StringComparison.Ordinal)
                || string.Equals(type.Name, "TenantModuleEntitlementService", StringComparison.Ordinal));
    }

    [Fact]
    public void TenantManagementRequestCarriesSubscriptionAndEntitlementData()
    {
        var properties = typeof(TenantManagementRequest).GetProperties().Select(property => property.Name).ToHashSet(StringComparer.Ordinal);
        Assert.Contains(nameof(TenantManagementRequest.SubscriptionStatus), properties);
        Assert.Contains(nameof(TenantManagementRequest.Entitlements), properties);
    }
}
