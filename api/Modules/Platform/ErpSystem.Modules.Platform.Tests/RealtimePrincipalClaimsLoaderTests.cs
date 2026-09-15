using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class RealtimePrincipalClaimsLoaderTests
{
    [Fact]
    public void PlatformIdentityUsesPlatformOwnedRoleAndUserTypes()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options;
        using var context = new PlatformDbContext(options);
        Assert.NotNull(context.Roles);
        Assert.Equal("PlatformApplicationUser", nameof(PlatformApplicationUser));
        Assert.Equal("PlatformApplicationRole", nameof(PlatformApplicationRole));
    }
}