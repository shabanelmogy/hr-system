using Xunit;

namespace ErpSystem.Modules.PointOfSale.Tests;

public sealed class PointOfSaleModuleTests
{
    [Fact]
    public void Definition_ExposesStableUserVisibleModuleMetadata()
    {
        var module = new PointOfSaleModule();

        Assert.Equal("PointOfSale", module.Name);
        Assert.Equal("point-of-sale", module.Definition.Code);
        Assert.Equal("PointOfSale", module.Definition.Name);
        Assert.Equal("1.0.0", module.Definition.Version);
        Assert.True(module.Definition.IsUserVisible);
        Assert.True(module.Definition.AllowsTenantEntitlement);
        Assert.Empty(module.Definition.RequiredModuleDependencies);
        Assert.Empty(module.Definition.OptionalModuleDependencies);
    }
}
