using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Contracts;
using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Districts.Entities;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Districts.Jobs;

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
            ReferenceDataPermissions.ViewDistricts,
            "GeographicalInformation",
            nameof(District),
            "Districts",
            request.Action,
            parameters,
            request.District?.Id.ToString(CultureInfo.InvariantCulture),
            "/super-admin/geography/districts",
            request.ActorUserId,
            request.OperationId);
        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"District notification failed: {result.Error.Code}");

        await realtimePublisher.PublishAsync(RealtimeChangeRequest.For<District>(
            RealtimeAudience.ForPermission(ReferenceDataPermissions.ViewDistricts),
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
