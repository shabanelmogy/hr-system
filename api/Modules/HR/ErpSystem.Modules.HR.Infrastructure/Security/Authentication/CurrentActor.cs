using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;

namespace ErpSystem.Modules.HR.Infrastructure.Security.Authentication;

/// <summary>
/// Compatibility adapter for existing HR code. Execution-context ownership is
/// host-level; new cross-module code consumes ICurrentExecutionContext directly.
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

    public IDisposable BeginScope(string userId, string tenantId, int? companyId = null)
    {
        return executionScope.BeginScope(userId, tenantId, companyId);
    }

    public bool IsInRole(string role) => executionContext.IsInRole(role);
}
