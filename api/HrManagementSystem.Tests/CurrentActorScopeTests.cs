using System.Security.Claims;
using HrManagementSystem.Infrastructure.Security.Authentication;
using Microsoft.AspNetCore.Http;

namespace HrManagementSystem.Tests;

public sealed class CurrentActorScopeTests
{
    [Fact]
    public void Scope_OverridesHttpActorAndRestoresItOnDispose()
    {
        var accessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, "http-user"),
                    new Claim(JwtClaimNames.TenantId, "http-tenant"),
                    new Claim(JwtClaimNames.CompanyId, "10")
                ], "test"))
            }
        };
        var actor = new CurrentActor(accessor);

        using (actor.BeginScope("job-user", "job-tenant", 20))
        {
            Assert.Equal("job-user", actor.UserId);
            Assert.Equal("job-tenant", actor.TenantId);
            Assert.Equal(20, actor.CompanyId);
        }

        Assert.Equal("http-user", actor.UserId);
        Assert.Equal("http-tenant", actor.TenantId);
        Assert.Equal(10, actor.CompanyId);
    }

    [Fact]
    public void Scope_RejectsInvalidCompanyId()
    {
        var actor = new CurrentActor(new HttpContextAccessor());

        Assert.Throws<ArgumentOutOfRangeException>(() =>
            actor.BeginScope("job-user", "job-tenant", 0));
    }
}
