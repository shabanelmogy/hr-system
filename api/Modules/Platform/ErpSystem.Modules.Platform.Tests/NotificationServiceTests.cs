using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class NotificationServiceTests
{
    [Fact]
    public void PlatformDbContext_ContainsNotificationsAndPlatformIdentityTypes()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options;
        using var context = new PlatformDbContext(options);
        Assert.NotNull(context.Notifications);
        Assert.Equal("ErpSystem.Modules.Platform.Infrastructure.Identity", typeof(PlatformApplicationUser).Namespace);
        Assert.Equal("ErpSystem.Modules.Platform.Infrastructure.Identity", typeof(PlatformUserCompanyAccess).Namespace);
    }
}