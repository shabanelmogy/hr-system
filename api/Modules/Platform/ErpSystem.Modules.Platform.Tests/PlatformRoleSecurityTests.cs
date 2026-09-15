using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformRoleSecurityTests
{
    [Fact]
    public void PlatformDbContext_MapsTenantAwareRolesAndUsers()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options;
        using var context = new PlatformDbContext(options);
        var role = new PlatformApplicationRole("TenantAdmin") { TenantId = "tenant-1" };
        context.Roles.Add(role);
        context.SaveChanges();
        Assert.Equal("tenant-1", context.Roles.Single().TenantId);
    }
}
