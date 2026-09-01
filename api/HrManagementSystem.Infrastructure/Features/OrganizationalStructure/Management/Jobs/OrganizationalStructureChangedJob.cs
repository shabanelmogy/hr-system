using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Abstractions;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Contracts;
using HrManagementSystem.Application.Features.Platform.Notifications.Services;

namespace HrManagementSystem.Infrastructure.Features.OrganizationalStructure.Management.Jobs;

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class OrganizationalStructureChangedJob(
    INotificationPublisher notificationPublisher,
    IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(OrganizationalStructureChange request, CancellationToken cancellationToken)
    {
        var parameters = new Dictionary<string, string>
        {
            ["NameEn"] = request.NameEn ?? request.Resource,
            ["NameAr"] = request.NameAr ?? request.Resource
        };
        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewOrganizationalStructure,
            "OrganizationalStructure",
            "OrganizationalStructureItem",
            "OrganizationalStructure",
            request.Action,
            parameters,
            request.EntityId?.ToString(CultureInfo.InvariantCulture),
            "/basic-data/organizational-structure/manage",
            request.ActorUserId,
            request.OperationId);
        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"Organizational structure notification failed: {result.Error.Code}");

        await realtimePublisher.PublishAsync(new RealtimeChangeRequest(
            RealtimeAudience.ForPermission(Permissions.ViewOrganizationalStructure),
            "organizational-structure",
            request.Action,
            request.EntityId?.ToString(CultureInfo.InvariantCulture),
            request.OperationId), cancellationToken);
    }
}

public sealed class OrganizationalStructureChangeScheduler : IOrganizationalStructureChangeScheduler
{
    public void Schedule(OrganizationalStructureChange change) =>
        BackgroundJob.Enqueue<OrganizationalStructureChangedJob>(job =>
            job.ExecuteAsync(change, CancellationToken.None));
}
