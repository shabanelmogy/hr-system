using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Inventory.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.ReferenceData.Infrastructure;
using ErpSystem.Modules.Reporting.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.IntegrationTests;

public sealed class ModuleBoundaryFoundationTests
{
    [Fact]
    public void PlatformModel_IsolatedFromHrSchema()
    {
        using var context = new PlatformDbContext(new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options);
        Assert.NotEmpty(context.Model.GetEntityTypes());
        Assert.DoesNotContain(context.Model.GetEntityTypes(), entity => string.Equals(entity.GetSchema(), "hr", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void ModuleContexts_ExposeIndependentModels()
    {
        using var referenceData = new ReferenceDataDbContext(new DbContextOptionsBuilder<ReferenceDataDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options);
        using var inventory = new InventoryDbContext(new DbContextOptionsBuilder<InventoryDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options);
        using var accounting = new AccountingDbContext(new DbContextOptionsBuilder<AccountingDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options);
        using var reporting = new ReportingDbContext(new DbContextOptionsBuilder<ReportingDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options);

        Assert.NotEmpty(referenceData.Model.GetEntityTypes());
        Assert.NotEmpty(inventory.Model.GetEntityTypes());
        Assert.NotEmpty(accounting.Model.GetEntityTypes());
        Assert.NotEmpty(reporting.Model.GetEntityTypes());
    }
}
