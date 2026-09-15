using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.ReferenceData;

namespace ErpSystem.Modules.ReferenceData.Tests;

public sealed class ReferenceDataModuleMetadataTests
{
    [Fact]
    public void ReferenceData_DefaultsOnlyTheTenantAddressCapability()
    {
        var definition = new ReferenceDataModule().Definition;

        Assert.True(definition.IsDefault);

        var addresses = Assert.Single(definition.Submodules, item => item.Code == "addresses");
        Assert.Equal(PermissionAccessMode.TenantEntitlement, addresses.PermissionAccessMode);

        var geography = Assert.Single(definition.Submodules, item => item.Code == "geography");
        Assert.Equal(PermissionAccessMode.Global, geography.PermissionAccessMode);
    }
}
