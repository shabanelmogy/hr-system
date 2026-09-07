using System.Globalization;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Realtime;
using Microsoft.Extensions.Logging;

namespace HrManagementSystem.Application.Features.WorkforcePlanning.Commands;

/// <summary>Dispatches post-commit staffing/amendment invalidation without making a successful write retryable.</summary>
public sealed class StaffingEffects(
    ICurrentActor actor,
    IRealtimeChangeDispatcher realtime,
    ILogger<StaffingEffects> logger)
{
    public void AmendmentChanged(int amendmentId, string action) =>
        Dispatch(
            RealtimeAudience.ForCompanyPermission(
                TenantId(),
                CompanyId(),
                Permissions.ViewEnvelopeAmendments),
            "envelope-amendments",
            action,
            amendmentId.ToString(CultureInfo.InvariantCulture),
            amendmentId);

    public void AmendmentApproved(int amendmentId, int envelopeId)
    {
        AmendmentChanged(amendmentId, "Approve");
        Dispatch(
            RealtimeAudience.ForCompanyPermission(
                TenantId(),
                CompanyId(),
                Permissions.ViewPositionEnvelopes),
            "position-envelopes",
            "Expand",
            envelopeId.ToString(CultureInfo.InvariantCulture),
            amendmentId);
    }

    public void RequestChanged(int requestId, string action) =>
        Dispatch(
            RealtimeAudience.ForCompanyPermission(
                TenantId(),
                CompanyId(),
                Permissions.ViewStaffingRequests),
            "staffing-requests",
            action,
            requestId.ToString(CultureInfo.InvariantCulture),
            requestId);

    public void RequestReleased(int requestId, int envelopeId)
    {
        RequestChanged(requestId, "Release");
        Dispatch(
            RealtimeAudience.ForCompanyPermission(
                TenantId(),
                CompanyId(),
                Permissions.ViewPositionEnvelopes),
            "position-envelopes",
            "Release",
            envelopeId.ToString(CultureInfo.InvariantCulture),
            requestId);
    }

    public void RequestReserved(int requestId, int envelopeId)
    {
        RequestChanged(requestId, "Approve");
        Dispatch(
            RealtimeAudience.ForCompanyPermission(
                TenantId(),
                CompanyId(),
                Permissions.ViewPositionEnvelopes),
            "position-envelopes",
            "Reserve",
            envelopeId.ToString(CultureInfo.InvariantCulture),
            requestId);
    }

    private string TenantId() => actor.TenantId ?? string.Empty;
    private int CompanyId() => actor.CompanyId.GetValueOrDefault();

    private void Dispatch(RealtimeAudience audience, string resource, string action, string entityId, int entityKey)
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
                "Staffing change {EntityKey} was saved, but realtime invalidation could not be queued.",
                entityKey);
        }
    }
}
