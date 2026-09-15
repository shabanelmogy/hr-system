namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformModuleMetadataTests
{
    [Fact]
    public void Platform_IsTechnicalAndNotTenantFacing()
    {
        var definition = new PlatformModule().Definition;

        Assert.Equal("platform", definition.Code);
        Assert.False(definition.IsUserVisible);
        Assert.False(definition.AllowsTenantEntitlement);
        Assert.False(definition.IsDefault);
    }
}
