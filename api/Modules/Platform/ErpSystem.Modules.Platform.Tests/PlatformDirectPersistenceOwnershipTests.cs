using ErpSystem.Modules.Platform.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformDirectPersistenceOwnershipTests
{
    [Fact]
    public void PlatformDbContext_UsesPlatformSchemaForItsModel()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options;
        using var context = new PlatformDbContext(options);
        var entityTypes = context.Model.GetEntityTypes();
        Assert.NotEmpty(entityTypes);
        Assert.DoesNotContain(entityTypes, entity => string.Equals(entity.GetSchema(), "hr", StringComparison.OrdinalIgnoreCase));
    }
}