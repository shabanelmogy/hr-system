using System.Globalization;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Realtime;
using Microsoft.Extensions.Logging;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;

/// <summary>Dispatches post-commit budget/envelope/plan invalidation without making a successful write retryable.</summary>
public sealed class WorkforceBudgetEffects(
    ICurrentActor actor,
    IRealtimeChangeDispatcher realtime,
    ILogger<WorkforceBudgetEffects> logger)
{
    public void BudgetChanged(int budgetId, string action) =>
        Dispatch(
            RealtimeAudience.ForCompanyPermission(
                TenantId(),
                CompanyId(),
                Permissions.ViewWorkforceBudgets),
            "workforce-budgets",
            action,
            budgetId.ToString(CultureInfo.InvariantCulture),
            budgetId);

    public void ApprovalActivated(int budgetId)
    {
        BudgetChanged(budgetId, "Approve");
        Dispatch(
            RealtimeAudience.ForCompanyPermission(
                TenantId(),
                CompanyId(),
                Permissions.ViewPositionEnvelopes),
            "position-envelopes",
            "Approve",
            budgetId.ToString(CultureInfo.InvariantCulture),
            budgetId);
        Dispatch(
            RealtimeAudience.ForCompanyPermission(
                TenantId(),
                CompanyId(),
                Permissions.ViewWorkforcePlans),
            "workforce-plans",
            "Activate",
            budgetId.ToString(CultureInfo.InvariantCulture),
            budgetId);
    }

    private string TenantId() => actor.TenantId ?? string.Empty;
    private int CompanyId() => actor.CompanyId.GetValueOrDefault();

    private void Dispatch(RealtimeAudience audience, string resource, string action, string entityId, int budgetId)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0)
            return;

        try
        {
            realtime.Dispatch(new RealtimeChangeRequest(
                audience,
                resource,
                action,
                entityId,
                Guid.NewGuid()));
        }
        catch (Exception exception)
        {
            logger.LogWarning(
                exception,
                "Workforce budget {BudgetId} was saved, but realtime invalidation could not be queued.",
                budgetId);
        }
    }
}
