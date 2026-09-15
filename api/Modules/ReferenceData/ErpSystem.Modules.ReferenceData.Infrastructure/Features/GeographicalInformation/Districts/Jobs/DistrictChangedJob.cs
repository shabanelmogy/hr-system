using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;

using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Contracts;

using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Districts.Entities;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Districts.Jobs;

public sealed record DistrictChangedJobRequest(
    DistrictResponse District,
    string Action,
    string? ActorUserId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class DistrictChangedJob(
    INotificationPublisher notificationPublisher,
    IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(DistrictChangedJobRequest request, CancellationToken cancellationToken)
    {
        var notification = NotificationPublishRequestFactory.Create(
            ReferenceDataPermissions.ViewDistricts,
            "GeographicalInformation",
            nameof(District),
            "Districts",
            request.Action,
            new Dictionary<string, string>
            {
                ["NameAr"] = request.District.NameAr,
                ["NameEn"] = request.District.NameEn,
                ["Code"] = request.District.Code
            },
            request.District.Id.ToString(CultureInfo.InvariantCulture),
            "/super-admin/geography/districts",
            request.ActorUserId,
            request.OperationId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"District notification failed: {result.Error.Code}");

        await realtimePublisher.PublishAsync(RealtimeChangeRequest.For<District>(
            RealtimeAudience.ForPermission(ReferenceDataPermissions.ViewDistricts),
            request.Action,
            request.District.Id.ToString(CultureInfo.InvariantCulture),
            request.OperationId), cancellationToken);
    }
}
