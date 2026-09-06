using System.Globalization;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Realtime;
using Microsoft.Extensions.Logging;

namespace HrManagementSystem.Application.Features.WorkforcePlanning.Commands;

/// <summary>Dispatches post-commit client invalidation without making a successful write retryable.</summary>
public sealed class WorkforcePlanEffects(
    ICurrentActor actor,
    IRealtimeChangeDispatcher realtime,
    ILogger<WorkforcePlanEffects> logger)
{
    public void Changed(int planId, string action)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0)
            return;

        try
        {
            realtime.Dispatch(new RealtimeChangeRequest(
                RealtimeAudience.ForCompanyPermission(
                    actor.TenantId,
                    actor.CompanyId.Value,
                    Permissions.ViewWorkforcePlans),
                "workforce-plans",
                action,
                planId.ToString(CultureInfo.InvariantCulture),
                Guid.NewGuid()));
        }
        catch (Exception exception)
        {
            logger.LogWarning(
                exception,
                "Workforce plan {PlanId} was saved, but realtime invalidation could not be queued.",
                planId);
        }
    }
}
