using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Jobs;

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class DistrictManagementChangedJob(
    INotificationPublisher notificationPublisher,
    IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(DistrictChange request, CancellationToken cancellationToken)
    {
        var parameters = request.District is null
            ? new Dictionary<string, string> { ["Count"] = (request.BulkCount ?? 0).ToString(CultureInfo.InvariantCulture) }
            : new Dictionary<string, string> { ["NameAr"] = request.District.NameAr, ["NameEn"] = request.District.NameEn };
        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewDistricts,
            "GeographicalInformation",
            nameof(District),
            "Districts",
            request.Action,
            parameters,
            request.District?.Id.ToString(CultureInfo.InvariantCulture),
            "/basic-data/districts",
            request.ActorUserId,
            request.OperationId);
        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"District notification failed: {result.Error.Code}");

        await realtimePublisher.PublishAsync(RealtimeChangeRequest.For<District>(
            RealtimeAudience.ForPermission(Permissions.ViewDistricts),
            request.Action,
            request.District?.Id.ToString(CultureInfo.InvariantCulture),
            request.OperationId), cancellationToken);
    }
}

public sealed class DistrictChangeScheduler : IDistrictChangeScheduler
{
    public void Schedule(DistrictChange change) =>
        BackgroundJob.Enqueue<DistrictManagementChangedJob>(job => job.ExecuteAsync(change, CancellationToken.None));
}
