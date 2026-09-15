using System.Security.Claims;
using System.Text.Json;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using ErpSystem.Modules.Platform.Presentation.Tenancy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformTenantReadOnlyMiddlewareOwnershipTests
{
    private static readonly DateTime SubscriptionEndsOn =
        new(2026, 9, 9, 0, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Ownership_MovesMiddlewareAndMetadataToPlatformWithoutPlatformReferencingHr()
    {
        Assert.Equal(
            "ErpSystem.Modules.Platform.Presentation",
            typeof(TenantReadOnlyMiddleware).Assembly.GetName().Name);
        Assert.Equal(
            "ErpSystem.Modules.Platform.Contracts",
            typeof(AllowTenantReadOnlyAttribute).Assembly.GetName().Name);

        var platformReferences = typeof(TenantReadOnlyMiddleware).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        Assert.DoesNotContain(platformReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
    }

    [Fact]
    public async Task ReadOnlyTenant_Post_ReturnsExactLockedProblemDetailsContract()
    {
        var nextCalled = false;
        var middleware = new TenantReadOnlyMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var tenantAccess = new RecordingTenantAccessService
        {
            Response = new TenantAccessResponse(
                "Tenant 1",
                "Free",
                "Expired",
                SubscriptionEndsOn,
                IsReadOnly: true)
        };
        var context = CreateContext(HttpMethods.Post, "tenant-1");
        context.TraceIdentifier = "trace-1";
        context.Items["HrManagementSystem.CorrelationId"] = "corr-1";

        await middleware.InvokeAsync(
            context,
            new TestExecutionContext("user-1", "tenant-1", 7),
            tenantAccess,
            new TestLocalizer());

        Assert.False(nextCalled);
        Assert.Equal(StatusCodes.Status423Locked, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);
        Assert.Equal("no-store", context.Response.Headers.CacheControl.ToString());
        Assert.Equal("tenant-1", tenantAccess.LastTenantId);

        context.Response.Body.Position = 0;
        using var document = await JsonDocument.ParseAsync(context.Response.Body);
        var root = document.RootElement;
        Assert.Equal(423, root.GetProperty("status").GetInt32());
        Assert.Equal("Subscription expired", root.GetProperty("title").GetString());
        Assert.Equal("Tenant is read only", root.GetProperty("detail").GetString());
        Assert.Equal("https://httpstatuses.com/423", root.GetProperty("type").GetString());
        Assert.Equal("Tenant.SubscriptionReadOnly", root.GetProperty("code").GetString());
        Assert.Equal("Expired", root.GetProperty("subscriptionStatus").GetString());
        Assert.Equal("trace-1", root.GetProperty("traceId").GetString());
        Assert.Equal("corr-1", root.GetProperty("correlationId").GetString());
    }

    [Fact]
    public async Task Middleware_PreservesAllHistoricalBypassRules()
    {
        await AssertBypassesAsync(CreateContext(HttpMethods.Get, "tenant-1"), "tenant-1");
        await AssertBypassesAsync(CreateContext(HttpMethods.Post, "tenant-1", authenticated: false), "tenant-1");
        await AssertBypassesAsync(CreateContext(HttpMethods.Post, "tenant-1", roles: ["super_admin"]), "tenant-1");
        await AssertBypassesAsync(CreateContext(HttpMethods.Post, null), null);

        var hub = CreateContext(HttpMethods.Post, "tenant-1");
        hub.Request.Path = "/hubs/company";
        await AssertBypassesAsync(hub, "tenant-1");

        var anonymous = CreateContext(HttpMethods.Post, "tenant-1");
        anonymous.SetEndpoint(new Endpoint(
            _ => Task.CompletedTask,
            new EndpointMetadataCollection(new AllowAnonymousAttribute()),
            "anonymous"));
        await AssertBypassesAsync(anonymous, "tenant-1");

        var allowedReadOnly = CreateContext(HttpMethods.Post, "tenant-1");
        allowedReadOnly.SetEndpoint(new Endpoint(
            _ => Task.CompletedTask,
            new EndpointMetadataCollection(new AllowTenantReadOnlyAttribute()),
            "allow-read-only"));
        await AssertBypassesAsync(allowedReadOnly, "tenant-1");
    }

    [Fact]
    public async Task WritableTenant_Post_ContinuesAfterPlatformAccessCheck()
    {
        var nextCalled = false;
        var middleware = new TenantReadOnlyMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var tenantAccess = new RecordingTenantAccessService
        {
            Response = new TenantAccessResponse(
                "Tenant 1", "Paid", "Active", null, IsReadOnly: false)
        };
        var context = CreateContext(HttpMethods.Post, "tenant-1");

        await middleware.InvokeAsync(
            context,
            new TestExecutionContext("user-1", "tenant-1", 7),
            tenantAccess,
            new TestLocalizer());

        Assert.True(nextCalled);
        Assert.Equal(1, tenantAccess.GetCalls);
        Assert.Equal("tenant-1", tenantAccess.LastTenantId);
    }

    private static async Task AssertBypassesAsync(DefaultHttpContext context, string? tenantId)
    {
        var nextCalled = false;
        var middleware = new TenantReadOnlyMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var tenantAccess = new RecordingTenantAccessService
        {
            Response = new TenantAccessResponse(
                "Tenant 1", "Free", "Expired", SubscriptionEndsOn, IsReadOnly: true)
        };

        await middleware.InvokeAsync(
            context,
            new TestExecutionContext("user-1", tenantId, 7),
            tenantAccess,
            new TestLocalizer());

        Assert.True(nextCalled);
        Assert.Equal(0, tenantAccess.GetCalls);
    }

    private static DefaultHttpContext CreateContext(
        string method,
        string? tenantId,
        bool authenticated = true,
        string[]? roles = null)
    {
        var context = new DefaultHttpContext();
        context.Request.Method = method;
        context.Response.Body = new MemoryStream();

        if (authenticated)
        {
            var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, "user-1") };
            if (!string.IsNullOrWhiteSpace(tenantId))
                claims.Add(new Claim(ExecutionContextClaimNames.TenantId, tenantId));
            claims.AddRange((roles ?? []).Select(role => new Claim(ClaimTypes.Role, role)));
            context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "test", ClaimTypes.Name, ClaimTypes.Role));
        }

        return context;
    }

    private sealed record TestExecutionContext(
        string? UserId,
        string? TenantId,
        int? CompanyId) : ICurrentExecutionContext;

    private sealed class RecordingTenantAccessService : ITenantAccessService
    {
        public TenantAccessResponse? Response { get; init; }
        public int GetCalls { get; private set; }
        public string? LastTenantId { get; private set; }

        public Task<TenantAccessResponse?> GetAsync(
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            GetCalls++;
            LastTenantId = tenantId;
            return Task.FromResult(Response);
        }
    }

    private sealed class TestLocalizer : IStringLocalizer<TenantReadOnlyMiddleware>
    {
        public LocalizedString this[string name] => new(
            name,
            name switch
            {
                "TenantReadOnlyTitle" => "Subscription expired",
                "TenantReadOnlyDetail" => "Tenant is read only",
                _ => name
            });

        public LocalizedString this[string name, params object[] arguments] => this[name];

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}

