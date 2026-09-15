using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformBootstrapEntitlementMergeTests
{
    [Fact]
    public void MergeEntitlements_AddsDefaultsAndPreservesExistingGrants()
    {
        var existing = new[]
        {
            new TenantModuleEntitlementResponse("Accounting", ["FiscalYears", "Journals"]),
            new TenantModuleEntitlementResponse("custom", ["Feature"])
        };
        var defaults = new[]
        {
            new TenantModuleEntitlementRequest("HR", ["Employees"]),
            new TenantModuleEntitlementRequest("Reference-Data", ["Addresses"])
        };

        var result = PlatformBootstrapUsersStartupTask.MergeEntitlements(existing, defaults);

        Assert.Equal(["accounting", "custom", "hr", "reference-data"], result.Select(item => item.ModuleCode));
        Assert.Equal(["fiscalyears", "journals"], result[0].SubmoduleCodes);
        Assert.Equal(["feature"], result[1].SubmoduleCodes);
        Assert.Equal(["employees"], result[2].SubmoduleCodes);
        Assert.Equal(["addresses"], result[3].SubmoduleCodes);
    }

    [Fact]
    public void MergeEntitlements_NormalizesCasingAndCollapsesDuplicates()
    {
        var existing = new[]
        {
            new TenantModuleEntitlementResponse("Accounting", ["Journals", "journals"]),
            new TenantModuleEntitlementResponse("accounting", ["FISCALYEARS"])
        };
        var defaults = new[]
        {
            new TenantModuleEntitlementRequest("ACCOUNTING", ["FiscalYears", "journals"])
        };

        var result = PlatformBootstrapUsersStartupTask.MergeEntitlements(existing, defaults);

        var accounting = Assert.Single(result);
        Assert.Equal("accounting", accounting.ModuleCode);
        Assert.Equal(["fiscalyears", "journals"], accounting.SubmoduleCodes);
    }
}
