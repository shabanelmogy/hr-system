using System.Security.Claims;
using ErpSystem.Api.Hosting;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Infrastructure.Security.Authentication;
using Microsoft.AspNetCore.Http;

namespace ErpSystem.Tests;

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
                    new Claim(AuthenticationTokenClaimNames.TenantId, "http-tenant"),
                    new Claim(AuthenticationTokenClaimNames.CompanyId, "10")
                ], "test"))
            }
        };
        var executionContext = new HttpCurrentExecutionContext(accessor);
        var actor = new CurrentActor(executionContext, executionContext);

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
        var executionContext = new HttpCurrentExecutionContext(new HttpContextAccessor());
        var actor = new CurrentActor(executionContext, executionContext);

        Assert.Throws<ArgumentOutOfRangeException>(() =>
            actor.BeginScope("job-user", "job-tenant", 0));
    }

    [Theory]
    [InlineData(" ", "tenant-1", "11")]
    [InlineData("user-1", " ", "11")]
    [InlineData("user-1", "tenant-1", "0")]
    [InlineData("user-1", "tenant-1", "-1")]
    [InlineData("user-1", "tenant-1", "invalid")]
    public void HttpClaims_WithInvalidScopeValues_AreNotExposed(
        string userId,
        string tenantId,
        string companyId)
    {
        var accessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, userId),
                    new Claim(AuthenticationTokenClaimNames.TenantId, tenantId),
                    new Claim(AuthenticationTokenClaimNames.CompanyId, companyId)
                ], "test"))
            }
        };
        var executionContext = new HttpCurrentExecutionContext(accessor);

        if (string.IsNullOrWhiteSpace(userId))
            Assert.Null(executionContext.UserId);
        else
            Assert.Equal(userId, executionContext.UserId);

        if (string.IsNullOrWhiteSpace(tenantId))
            Assert.Null(executionContext.TenantId);
        else
            Assert.Equal(tenantId, executionContext.TenantId);

        if (!int.TryParse(companyId, out var parsed) || parsed <= 0)
            Assert.Null(executionContext.CompanyId);
        else
            Assert.Equal(parsed, executionContext.CompanyId);
    }

    [Fact]
    public void HttpClaims_WithWhitespaceRequiredScopeValues_AreNotExposed()
    {
        var accessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, "   "),
                    new Claim(AuthenticationTokenClaimNames.TenantId, "\t"),
                    new Claim(AuthenticationTokenClaimNames.CompanyId, " 11 ")
                ], "test"))
            }
        };
        var executionContext = new HttpCurrentExecutionContext(accessor);

        Assert.Null(executionContext.UserId);
        Assert.Null(executionContext.TenantId);
        Assert.Equal(11, executionContext.CompanyId);
    }
}
