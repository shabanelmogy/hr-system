using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Tokens;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class CurrentActorRoleTests
{
    [Fact]
    public void CurrentActor_IsInRole_DelegatesToExecutionContext()
    {
        var executionContext = new RoleExecutionContext([PlatformRoleNames.Admin]);
        var actor = new CurrentActor(executionContext, executionContext);

        Assert.True(actor.IsInRole(PlatformRoleNames.Admin));
        Assert.False(actor.IsInRole(PlatformRoleNames.User));
    }

    private sealed class RoleExecutionContext(IReadOnlyCollection<string> roles) :
        ICurrentExecutionContext,
        ICurrentExecutionContextScope
    {
        public string? UserId => "user-1";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 1;

        public bool IsInRole(string role) => roles.Contains(role, StringComparer.OrdinalIgnoreCase);

        public IDisposable BeginScope(string userId, string tenantId, int? companyId = null) =>
            NoopScope.Instance;

        private sealed class NoopScope : IDisposable
        {
            public static readonly NoopScope Instance = new();
            public void Dispose() { }
        }
    }
}
