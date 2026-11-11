using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class GlobalCrystalReportAccessScopeTests
{
    [Fact]
    public async Task Grants_PreserveTenantScopeAndDistinguishMissingRolesFromPlatformRoles()
    {
        var actor = new Actor();
        await using var context = new ReportingDbContext(new DbContextOptionsBuilder<ReportingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options, actor);
        var report = GlobalCrystalReport.Create("countries", "countries-scope-fixture", null);
        context.GlobalCrystalReports.Add(report);
        foreach (var id in new[] { "tenant-role", "platform-role", "removed-role" })
            context.GlobalCrystalReportRoleGrants.Add(GlobalCrystalReportRoleGrant.Create(report.Id, id, CrystalReportRight.Run));
        await context.SaveChangesAsync();
        var store = new GlobalCrystalReportAccessStore(context, actor, new StubAuthorizationSource([
            new("tenant-role", "Accountant", "tenant-a", "Tenant A"),
            new("platform-role", "Reader", null, null)
        ]));
        var grants = await store.GrantsAsync(report.Id, default);
        var tenant = Assert.Single(grants, grant => grant.RoleId == "tenant-role");
        Assert.Equal("Accountant", tenant.RoleName);
        Assert.Equal("tenant-a", tenant.TenantId);
        Assert.Equal("Tenant A", tenant.TenantName);
        Assert.True(tenant.ScopeKnown);
        Assert.Equal("Run", Assert.Single(tenant.Rights));
        var platform = Assert.Single(grants, grant => grant.RoleId == "platform-role");
        Assert.True(platform.ScopeKnown);
        Assert.Null(platform.TenantId);
        var missing = Assert.Single(grants, grant => grant.RoleId == "removed-role");
        Assert.False(missing.ScopeKnown);
        Assert.Null(missing.TenantId);
        Assert.Equal("removed-role", missing.RoleName);
    }

    private sealed class Actor : ICurrentActor
    {
        public string? UserId => "scope-fixture";
        public string? TenantId => null;
        public int? CompanyId => null;
        public bool IsInRole(string role) => role == "super_admin";
    }
    private sealed class StubAuthorizationSource(IReadOnlyList<PlatformRoleScopeOption> scopes) : IPlatformAuthorizationSource
    {
        public Task<PlatformRoleScopePage> GetRoleScopesPageAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default) => Task.FromResult(new PlatformRoleScopePage([], 0));
        public Task<IReadOnlyList<PlatformRoleScopeOption>> GetRoleScopesAsync(IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default) => Task.FromResult(scopes);
        public Task<int> GetUserCountAsync(CancellationToken cancellationToken = default) => Task.FromResult(0);

        public Task<IReadOnlyCollection<string>> GetUserRoleIdsAsync(
            string userId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyCollection<string>>([]);

        public Task<IReadOnlyCollection<PlatformRoleOption>> GetRolesAsync(
            IReadOnlyCollection<string> roleIds,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyCollection<PlatformRoleOption>>([]);

        public Task<IReadOnlyCollection<PlatformRoleOption>> GetAssignableRolesAsync(
            string? tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyCollection<PlatformRoleOption>>([]);

        public Task<bool> AreRoleIdsValidAsync(
            string? tenantId,
            IReadOnlyCollection<string> roleIds,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(true);
    }
}

