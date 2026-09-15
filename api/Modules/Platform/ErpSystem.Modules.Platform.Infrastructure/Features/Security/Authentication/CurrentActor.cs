using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Context.Authentication;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Tokens;

/// <summary>
/// Platform implementation of the request actor context. The host owns the
/// underlying trusted execution scope and Platform exposes it to modules.
/// </summary>
public sealed class CurrentActor(
    ICurrentExecutionContext executionContext,
    ICurrentExecutionContextScope executionScope) :
    ICurrentActor,
    ICurrentActorScope
{
    public string? UserId => executionContext.UserId;

    public string? TenantId => executionContext.TenantId;

    public int? CompanyId => executionContext.CompanyId;

    public string? MachineName => executionContext.MachineName;

    public IDisposable BeginScope(string userId, string tenantId, int? companyId = null)
    {
        return executionScope.BeginScope(userId, tenantId, companyId);
    }

    public bool IsInRole(string role) => executionContext.IsInRole(role);
}
